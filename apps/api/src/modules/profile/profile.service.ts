import {
  createErrorResult,
  createSuccessResult,
  ServiceResult,
} from '@/common/interfaces/service-result.interface';
import { DbService } from '@/db/db.service';
import { Inject, Injectable } from '@nestjs/common';
import { MemberRole, Prisma } from '@prisma/client';
import {
  AddMediaDto,
  CreateProfileDto,
  InviteMemberDto,
  RespondInviteDto,
  UpdateGeneralDetailsDto,
  UpdateIslamicDetailsDto,
  UpdateMediaDto,
  UpdatePreferenceDto,
  UpdatePrivacyDto,
  UpdateProfileDto,
} from './dto/index';
import { computeCompletionPercent, computeGreenFlags } from './green-flags';
import { ProfileAccessService, ProfileForAccess } from './profile-access.service';

const PROFILE_INCLUDE = {
  privacySettings: true,
  islamicDetails: true,
  generalDetails: true,
  preference: true,
  media: { orderBy: { sortOrder: 'asc' as const } },
};

@Injectable()
export class ProfileService {
  @Inject(DbService)
  private readonly db: DbService;

  @Inject()
  private readonly access: ProfileAccessService;

  // ---------- helpers ----------

  private async generateBiodataNo(tx: Prisma.TransactionClient): Promise<string> {
    const seq = await tx.biodataSequence.create({ data: {} });
    return `LM-${100000 + seq.id}`;
  }

  private async assertManager(
    userId: number,
    profileId: number,
    requiredRole?: MemberRole,
  ): Promise<ServiceResult | null> {
    const member = await this.db.profileMember.findUnique({
      where: { userId_profileId: { userId, profileId } },
    });

    if (!member || member.inviteStatus !== 'ACCEPTED') {
      return createErrorResult(
        { name: 'forbidden', message: 'You do not manage this profile' },
        'You do not manage this profile',
      );
    }

    if (requiredRole === 'OWNER' && member.role !== 'OWNER') {
      return createErrorResult(
        { name: 'forbidden', message: 'Only the profile owner can perform this action' },
        'Only the profile owner can perform this action',
      );
    }

    return null;
  }

  async recomputeDerived(profileId: number): Promise<void> {
    const profile = await this.db.profile.findUnique({
      where: { id: profileId },
      include: PROFILE_INCLUDE,
    });

    if (!profile) return;

    const greenFlags = computeGreenFlags(profile);
    const completionPercent = computeCompletionPercent(profile);

    await this.db.profile.update({
      where: { id: profileId },
      data: { greenFlags, completionPercent },
    });
  }

  private async loadProfile(id: number) {
    return this.db.profile.findUnique({
      where: { id },
      include: PROFILE_INCLUDE,
    });
  }

  // ---------- CRUD ----------

  async create(userId: number, dto: CreateProfileDto): Promise<ServiceResult> {
    if (dto.gender === 'OTHER') {
      return createErrorResult(
        { name: 'badRequest', message: 'Profile gender must be MALE or FEMALE' },
        'Profile gender must be MALE or FEMALE',
      );
    }

    const profile = await this.db.$transaction(async tx => {
      const biodataNo = await this.generateBiodataNo(tx);

      const created = await tx.profile.create({
        data: {
          biodataNo,
          mode: dto.mode,
          fullName: dto.fullName,
          gender: dto.gender,
          dateOfBirth: new Date(dto.dateOfBirth),
          maritalStatus: dto.maritalStatus ?? 'NEVER_MARRIED',
          religion: dto.religion ?? 'ISLAM',
          createdByUserId: userId,
          // Islamic mode defaults to a photo-hidden, contact-locked experience.
          privacySettings: {
            create:
              dto.mode === 'ISLAMIC'
                ? { photoPolicy: 'ON_UNLOCK', contactPolicy: 'ON_UNLOCK', hidePhone: true }
                : { photoPolicy: 'VISIBLE', contactPolicy: 'ON_UNLOCK', hidePhone: true },
          },
          members: {
            create: {
              userId,
              relationship: dto.relationship,
              role: 'OWNER',
              inviteStatus: 'ACCEPTED',
            },
          },
        },
        include: PROFILE_INCLUDE,
      });

      if (dto.mode === 'ISLAMIC') {
        await tx.islamicProfileDetails.create({ data: { profileId: created.id } });
      } else {
        await tx.generalProfileDetails.create({ data: { profileId: created.id } });
      }

      return created;
    });

    await this.recomputeDerived(profile.id);

    const data = await this.loadProfile(profile.id);

    return createSuccessResult(data, 'Profile created successfully');
  }

  async getMine(userId: number): Promise<ServiceResult> {
    const members = await this.db.profileMember.findMany({
      where: { userId, inviteStatus: 'ACCEPTED' },
      include: {
        profile: { include: PROFILE_INCLUDE },
      },
    });

    const data = members.map(m => ({
      relationship: m.relationship,
      role: m.role,
      profile: m.profile,
    }));

    return createSuccessResult(data, 'Profiles retrieved successfully');
  }

  async getById(viewerUserId: number | null, id: number): Promise<ServiceResult> {
    const profile = await this.loadProfile(id);

    if (!profile) {
      return createErrorResult(
        { name: 'badRequest', message: 'Profile not found' },
        'Profile not found',
      );
    }

    const grant = await this.access.getAccessGrant(viewerUserId, profile as ProfileForAccess);

    if (!grant.canViewProfile) {
      return createErrorResult(
        { name: 'forbidden', message: 'This profile is not visible to you' },
        'This profile is not visible to you',
      );
    }

    // Non-managers only see ACTIVE profiles.
    if (!grant.isManager && profile.status !== 'ACTIVE') {
      return createErrorResult(
        { name: 'badRequest', message: 'Profile not found' },
        'Profile not found',
      );
    }

    // Record the visit against the viewer's primary profile.
    if (!grant.isManager && viewerUserId != null) {
      const viewerMember = await this.db.profileMember.findFirst({
        where: { userId: viewerUserId, inviteStatus: 'ACCEPTED' },
        orderBy: { createdAt: 'asc' },
      });

      if (viewerMember) {
        await this.db.profileVisit.upsert({
          where: {
            visitorProfileId_targetProfileId: {
              visitorProfileId: viewerMember.profileId,
              targetProfileId: id,
            },
          },
          update: { visitedAt: new Date() },
          create: { visitorProfileId: viewerMember.profileId, targetProfileId: id },
        });

        await this.db.profile.update({
          where: { id },
          data: { viewCount: { increment: 1 } },
        });
      }
    }

    const data = this.access.serializeProfile(profile as ProfileForAccess, grant);

    return createSuccessResult({ ...data, access: grant }, 'Profile retrieved successfully');
  }

  async update(userId: number, id: number, dto: UpdateProfileDto): Promise<ServiceResult> {
    const denied = await this.assertManager(userId, id);
    if (denied) return denied;

    const { dateOfBirth, ...rest } = dto;

    await this.db.profile.update({
      where: { id },
      data: {
        ...rest,
        ...(dateOfBirth ? { dateOfBirth: new Date(dateOfBirth) } : {}),
        lastActiveAt: new Date(),
      },
    });

    await this.recomputeDerived(id);

    const data = await this.loadProfile(id);

    return createSuccessResult(data, 'Profile updated successfully');
  }

  async updateIslamicDetails(
    userId: number,
    id: number,
    dto: UpdateIslamicDetailsDto,
  ): Promise<ServiceResult> {
    const denied = await this.assertManager(userId, id);
    if (denied) return denied;

    const profile = await this.db.profile.findUnique({ where: { id } });

    if (!profile || profile.mode !== 'ISLAMIC') {
      return createErrorResult(
        { name: 'badRequest', message: 'This is not an Islamic-mode profile' },
        'This is not an Islamic-mode profile',
      );
    }

    await this.db.islamicProfileDetails.upsert({
      where: { profileId: id },
      update: { ...dto },
      create: { profileId: id, ...dto },
    });

    await this.recomputeDerived(id);

    const data = await this.loadProfile(id);

    return createSuccessResult(data, 'Islamic details updated successfully');
  }

  async updateGeneralDetails(
    userId: number,
    id: number,
    dto: UpdateGeneralDetailsDto,
  ): Promise<ServiceResult> {
    const denied = await this.assertManager(userId, id);
    if (denied) return denied;

    const profile = await this.db.profile.findUnique({ where: { id } });

    if (!profile) {
      return createErrorResult(
        { name: 'badRequest', message: 'Profile not found' },
        'Profile not found',
      );
    }

    // Lifestyle details are allowed on both modes (Islamic profiles may still
    // record smoking habits etc.), so no mode restriction here.
    await this.db.generalProfileDetails.upsert({
      where: { profileId: id },
      update: { ...dto },
      create: { profileId: id, ...dto },
    });

    await this.recomputeDerived(id);

    const data = await this.loadProfile(id);

    return createSuccessResult(data, 'Details updated successfully');
  }

  async updatePreference(
    userId: number,
    id: number,
    dto: UpdatePreferenceDto,
  ): Promise<ServiceResult> {
    const denied = await this.assertManager(userId, id);
    if (denied) return denied;

    if (dto.ageMin !== undefined && dto.ageMax !== undefined && dto.ageMin > dto.ageMax) {
      return createErrorResult(
        { name: 'badRequest', message: 'ageMin cannot be greater than ageMax' },
        'ageMin cannot be greater than ageMax',
      );
    }

    await this.db.partnerPreference.upsert({
      where: { profileId: id },
      update: { ...dto },
      create: { profileId: id, ...dto },
    });

    await this.recomputeDerived(id);

    const data = await this.loadProfile(id);

    return createSuccessResult(data, 'Partner preference updated successfully');
  }

  async updatePrivacy(userId: number, id: number, dto: UpdatePrivacyDto): Promise<ServiceResult> {
    const denied = await this.assertManager(userId, id);
    if (denied) return denied;

    await this.db.privacySettings.upsert({
      where: { profileId: id },
      update: { ...dto },
      create: { profileId: id, ...dto },
    });

    const data = await this.loadProfile(id);

    return createSuccessResult(data, 'Privacy settings updated successfully');
  }

  async submitForApproval(userId: number, id: number): Promise<ServiceResult> {
    const denied = await this.assertManager(userId, id);
    if (denied) return denied;

    const profile = await this.loadProfile(id);

    if (!profile) {
      return createErrorResult(
        { name: 'badRequest', message: 'Profile not found' },
        'Profile not found',
      );
    }

    if (profile.status !== 'DRAFT' && profile.status !== 'REJECTED') {
      return createErrorResult(
        { name: 'badRequest', message: `Profile cannot be submitted from ${profile.status} state` },
        'Profile cannot be submitted',
      );
    }

    if (profile.completionPercent < 40) {
      return createErrorResult(
        {
          name: 'badRequest',
          message: 'Please complete at least 40% of the biodata before submitting for approval',
        },
        'Biodata is too incomplete to submit',
      );
    }

    const data = await this.db.profile.update({
      where: { id },
      data: { status: 'PENDING_APPROVAL', rejectionReason: null },
    });

    return createSuccessResult(data, 'Profile submitted for approval');
  }

  // ---------- media ----------

  async addMedia(userId: number, id: number, dto: AddMediaDto): Promise<ServiceResult> {
    const denied = await this.assertManager(userId, id);
    if (denied) return denied;

    if (dto.isPrimary) {
      await this.db.profileMedia.updateMany({
        where: { profileId: id },
        data: { isPrimary: false },
      });
    }

    const data = await this.db.profileMedia.create({
      data: {
        profileId: id,
        type: dto.type ?? 'PHOTO',
        url: dto.url,
        blurredUrl: dto.blurredUrl,
        isPrimary: dto.isPrimary ?? false,
        sortOrder: dto.sortOrder ?? 0,
      },
    });

    return createSuccessResult(data, 'Media added successfully');
  }

  async updateMedia(
    userId: number,
    id: number,
    mediaId: number,
    dto: UpdateMediaDto,
  ): Promise<ServiceResult> {
    const denied = await this.assertManager(userId, id);
    if (denied) return denied;

    const media = await this.db.profileMedia.findFirst({ where: { id: mediaId, profileId: id } });

    if (!media) {
      return createErrorResult(
        { name: 'badRequest', message: 'Media not found' },
        'Media not found',
      );
    }

    if (dto.isPrimary) {
      await this.db.profileMedia.updateMany({
        where: { profileId: id },
        data: { isPrimary: false },
      });
    }

    const data = await this.db.profileMedia.update({
      where: { id: mediaId },
      data: { ...dto },
    });

    return createSuccessResult(data, 'Media updated successfully');
  }

  async removeMedia(userId: number, id: number, mediaId: number): Promise<ServiceResult> {
    const denied = await this.assertManager(userId, id);
    if (denied) return denied;

    const media = await this.db.profileMedia.findFirst({ where: { id: mediaId, profileId: id } });

    if (!media) {
      return createErrorResult(
        { name: 'badRequest', message: 'Media not found' },
        'Media not found',
      );
    }

    await this.db.profileMedia.delete({ where: { id: mediaId } });

    return createSuccessResult({ deleted: true }, 'Media removed successfully');
  }

  // ---------- family members ----------

  async listMembers(userId: number, id: number): Promise<ServiceResult> {
    const denied = await this.assertManager(userId, id);
    if (denied) return denied;

    const members = await this.db.profileMember.findMany({
      where: { profileId: id },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    return createSuccessResult(members, 'Members retrieved successfully');
  }

  async inviteMember(userId: number, id: number, dto: InviteMemberDto): Promise<ServiceResult> {
    const denied = await this.assertManager(userId, id, 'OWNER');
    if (denied) return denied;

    const invitee = await this.db.user.findUnique({ where: { email: dto.email } });

    if (!invitee) {
      return createErrorResult(
        { name: 'badRequest', message: 'No account found with this email' },
        'No account found with this email',
      );
    }

    const existing = await this.db.profileMember.findUnique({
      where: { userId_profileId: { userId: invitee.id, profileId: id } },
    });

    if (existing) {
      return createErrorResult(
        { name: 'badRequest', message: 'This user is already a member or has a pending invite' },
        'This user is already a member or has a pending invite',
      );
    }

    const data = await this.db.profileMember.create({
      data: {
        userId: invitee.id,
        profileId: id,
        relationship: dto.relationship,
        role: dto.role ?? 'MANAGER',
        inviteStatus: 'PENDING',
        invitedBy: userId,
      },
    });

    await this.db.notification.create({
      data: {
        userId: invitee.id,
        type: 'MEMBER_INVITE',
        titleEn: 'Family account invitation',
        titleBn: 'পারিবারিক অ্যাকাউন্টের আমন্ত্রণ',
        bodyEn: 'You have been invited to help manage a biodata.',
        bodyBn: 'একটি বায়োডাটা পরিচালনায় সহায়তার জন্য আপনাকে আমন্ত্রণ জানানো হয়েছে।',
        data: { profileId: id, memberId: data.id },
      },
    });

    return createSuccessResult(data, 'Invitation sent successfully');
  }

  async respondInvite(
    userId: number,
    memberId: number,
    dto: RespondInviteDto,
  ): Promise<ServiceResult> {
    const member = await this.db.profileMember.findUnique({ where: { id: memberId } });

    if (!member || member.userId !== userId || member.inviteStatus !== 'PENDING') {
      return createErrorResult(
        { name: 'badRequest', message: 'Invite not found' },
        'Invite not found',
      );
    }

    if (dto.response === 'DECLINED') {
      await this.db.profileMember.delete({ where: { id: memberId } });
      return createSuccessResult({ declined: true }, 'Invitation declined');
    }

    const data = await this.db.profileMember.update({
      where: { id: memberId },
      data: { inviteStatus: 'ACCEPTED' },
    });

    return createSuccessResult(data, 'Invitation accepted');
  }

  async removeMember(userId: number, id: number, memberId: number): Promise<ServiceResult> {
    const denied = await this.assertManager(userId, id, 'OWNER');
    if (denied) return denied;

    const member = await this.db.profileMember.findFirst({
      where: { id: memberId, profileId: id },
    });

    if (!member) {
      return createErrorResult(
        { name: 'badRequest', message: 'Member not found' },
        'Member not found',
      );
    }

    if (member.role === 'OWNER') {
      return createErrorResult(
        { name: 'badRequest', message: 'The profile owner cannot be removed' },
        'The profile owner cannot be removed',
      );
    }

    await this.db.profileMember.delete({ where: { id: memberId } });

    return createSuccessResult({ deleted: true }, 'Member removed successfully');
  }

  async myInvites(userId: number): Promise<ServiceResult> {
    const invites = await this.db.profileMember.findMany({
      where: { userId, inviteStatus: 'PENDING' },
      include: {
        profile: { select: { id: true, biodataNo: true, fullName: true, mode: true } },
      },
    });

    return createSuccessResult(invites, 'Invites retrieved successfully');
  }
}
