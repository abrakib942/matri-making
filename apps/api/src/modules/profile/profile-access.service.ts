import { DbService } from '@/db/db.service';
import { Inject, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

export interface AccessGrant {
  isManager: boolean;
  canViewProfile: boolean;
  canViewPhoto: boolean;
  photoBlurredOnly: boolean;
  canViewContact: boolean;
  canViewGuardian: boolean;
  canViewFullBiodata: boolean;
  canAccessSafeChat: boolean;
  activeChatRoomId: number | null;
}

export type ProfileForAccess = Prisma.ProfileGetPayload<{
  include: {
    privacySettings: true;
    islamicDetails: true;
    generalDetails: true;
    media: true;
  };
}>;

const NO_ACCESS: AccessGrant = {
  isManager: false,
  canViewProfile: false,
  canViewPhoto: false,
  photoBlurredOnly: false,
  canViewContact: false,
  canViewGuardian: false,
  canViewFullBiodata: false,
  canAccessSafeChat: false,
  activeChatRoomId: null,
};

/**
 * The single authoritative privacy gate. Every profile-serving endpoint must
 * compute an AccessGrant here and field-strip its response through
 * serializeProfile(). Contact and guardian data never leave the API without
 * an explicit grant.
 */
@Injectable()
export class ProfileAccessService {
  @Inject(DbService)
  private readonly db: DbService;

  /**
   * The profile a user acts as (sending interests, visits): the earliest
   * profile they own or manage.
   */
  async getPrimaryProfileId(userId: number): Promise<number | null> {
    const member = await this.db.profileMember.findFirst({
      where: { userId, inviteStatus: 'ACCEPTED' },
      orderBy: { createdAt: 'asc' },
      select: { profileId: true },
    });

    return member?.profileId ?? null;
  }

  async isManager(userId: number, profileId: number): Promise<boolean> {
    const member = await this.db.profileMember.findUnique({
      where: { userId_profileId: { userId, profileId } },
    });

    return !!member && member.inviteStatus === 'ACCEPTED';
  }

  async getAccessGrant(
    viewerUserId: number | null,
    profile: ProfileForAccess,
  ): Promise<AccessGrant> {
    if (viewerUserId == null) {
      const privacy = profile.privacySettings;
      const visibility = privacy?.visibility ?? 'PUBLIC';

      if (visibility !== 'PUBLIC') {
        return { ...NO_ACCESS };
      }

      const photoPolicy = privacy?.photoPolicy ?? 'ON_UNLOCK';
      let canViewPhoto = false;
      let photoBlurredOnly = false;

      switch (photoPolicy) {
        case 'VISIBLE':
          canViewPhoto = true;
          break;
        case 'BLURRED':
          canViewPhoto = true;
          photoBlurredOnly = true;
          break;
        default:
          break;
      }

      return {
        isManager: false,
        canViewProfile: true,
        canViewPhoto,
        photoBlurredOnly,
        canViewContact: false,
        canViewGuardian: false,
        canViewFullBiodata: false,
        canAccessSafeChat: false,
        activeChatRoomId: null,
      };
    }

    const isManager = await this.isManager(viewerUserId, profile.id);

    if (isManager) {
      return {
        isManager: true,
        canViewProfile: true,
        canViewPhoto: true,
        photoBlurredOnly: false,
        canViewContact: true,
        canViewGuardian: true,
        canViewFullBiodata: true,
        canAccessSafeChat: false,
        activeChatRoomId: null,
      };
    }

    const privacy = profile.privacySettings;
    const visibility = privacy?.visibility ?? 'PUBLIC';

    // Blocked either way -> no access.
    const viewerProfiles = await this.db.profileMember.findMany({
      where: { userId: viewerUserId, inviteStatus: 'ACCEPTED' },
      select: { profileId: true },
    });
    const viewerProfileIds = viewerProfiles.map(m => m.profileId);

    if (viewerProfileIds.length > 0) {
      const block = await this.db.block.findFirst({
        where: {
          OR: [
            { ownerProfileId: profile.id, targetProfileId: { in: viewerProfileIds } },
            { ownerProfileId: { in: viewerProfileIds }, targetProfileId: profile.id },
          ],
        },
      });

      if (block) {
        return { ...NO_ACCESS };
      }
    }

    if (visibility === 'HIDDEN') {
      return { ...NO_ACCESS };
    }

    if (visibility === 'VERIFIED_ONLY') {
      const viewer = await this.db.user.findUnique({
        where: { id: viewerUserId },
        select: { emailVerifiedAt: true, phoneVerifiedAt: true },
      });

      if (!viewer?.emailVerifiedAt || !viewer?.phoneVerifiedAt) {
        return { ...NO_ACCESS };
      }
    }

    // Active unlocks
    const unlocks = await this.db.biodataUnlock.findMany({
      where: {
        viewerUserId,
        profileId: profile.id,
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
    });

    const hasUnlock = (type: 'CONTACT' | 'GUARDIAN' | 'FULL_BIODATA') =>
      unlocks.some(u => u.type === type || u.type === 'FULL_BIODATA');

    // Accepted interest in either direction between viewer's profiles and the target.
    let interestAccepted = false;

    if (viewerProfileIds.length > 0) {
      const accepted = await this.db.interest.findFirst({
        where: {
          status: 'ACCEPTED',
          OR: [
            { fromProfileId: { in: viewerProfileIds }, toProfileId: profile.id },
            { fromProfileId: profile.id, toProfileId: { in: viewerProfileIds } },
          ],
        },
      });
      interestAccepted = !!accepted;
    }

    const photoPolicy = privacy?.photoPolicy ?? 'ON_UNLOCK';
    const contactPolicy = privacy?.contactPolicy ?? 'ON_UNLOCK';

    let canViewPhoto = false;
    let photoBlurredOnly = false;

    switch (photoPolicy) {
      case 'VISIBLE':
        canViewPhoto = true;
        break;
      case 'BLURRED':
        canViewPhoto = true;
        photoBlurredOnly = true;
        break;
      case 'ON_ACCEPT':
        canViewPhoto = interestAccepted || hasUnlock('FULL_BIODATA');
        break;
      case 'ON_UNLOCK':
        canViewPhoto = hasUnlock('FULL_BIODATA');
        break;
    }

    let canViewContact = false;

    switch (contactPolicy) {
      case 'ON_ACCEPT':
        canViewContact = interestAccepted || hasUnlock('CONTACT');
        break;
      case 'VERIFIED_ONLY': {
        // hidePhone opts out of passive (verification-based) contact access;
        // an explicit unlock still works.
        const viewer = await this.db.user.findUnique({
          where: { id: viewerUserId },
          select: { emailVerifiedAt: true, phoneVerifiedAt: true },
        });
        const passiveAccess =
          !privacy?.hidePhone && !!viewer?.emailVerifiedAt && !!viewer?.phoneVerifiedAt;
        canViewContact = passiveAccess || hasUnlock('CONTACT');
        break;
      }
      case 'ON_UNLOCK':
      default:
        canViewContact = hasUnlock('CONTACT');
        break;
    }

    let canAccessSafeChat = false;
    let activeChatRoomId: number | null = null;

    if (hasUnlock('CONTACT') && viewerProfileIds.length > 0) {
      const viewerProfileId = viewerProfileIds[0];
      const [low, high] =
        viewerProfileId < profile.id
          ? [viewerProfileId, profile.id]
          : [profile.id, viewerProfileId];

      const room = await this.db.chatRoom.findFirst({
        where: {
          profileAId: low,
          profileBId: high,
          status: 'ACTIVE',
          expiresAt: { gt: new Date() },
        },
        select: { id: true },
      });

      if (room) {
        canAccessSafeChat = true;
        activeChatRoomId = room.id;
      }
    }

    // Islamic CONTACT unlock opens safe chat — phone stays hidden until chat ends.
    if (profile.mode === 'ISLAMIC' && hasUnlock('CONTACT')) {
      canViewContact = false;
    }

    return {
      isManager: false,
      canViewProfile: true,
      canViewPhoto,
      photoBlurredOnly,
      canViewContact,
      canViewGuardian: hasUnlock('GUARDIAN'),
      canViewFullBiodata: hasUnlock('FULL_BIODATA'),
      canAccessSafeChat,
      activeChatRoomId,
    };
  }

  /**
   * Field-strips a fully loaded profile according to the access grant.
   */
  serializeProfile(profile: ProfileForAccess, grant: AccessGrant) {
    const privacy = profile.privacySettings;

    const media = profile.media
      .filter(m => m.type === 'PHOTO')
      .map(m => {
        if (grant.isManager) return m;
        if (!grant.canViewPhoto) return { ...m, url: null, blurredUrl: null };
        if (grant.photoBlurredOnly) return { ...m, url: null };
        return m;
      });

    const islamicDetails = profile.islamicDetails
      ? {
          ...profile.islamicDetails,
          waliName: grant.canViewGuardian ? profile.islamicDetails.waliName : null,
          waliRelation: grant.canViewGuardian ? profile.islamicDetails.waliRelation : null,
          waliPhone: grant.canViewGuardian ? profile.islamicDetails.waliPhone : null,
        }
      : null;

    const hideLocation = !grant.isManager && (privacy?.hideLocation ?? false);
    // An explicit contact grant (unlock/accept per policy) always reveals
    // contact info; hidePhone only prevents passive exposure (handled when
    // the grant is computed).
    const canSeeContact = grant.isManager || grant.canViewContact;

    return {
      ...profile,
      contactPhone: canSeeContact ? profile.contactPhone : null,
      contactEmail: canSeeContact ? profile.contactEmail : null,
      presentAddress: hideLocation ? null : profile.presentAddress,
      permanentAddress: hideLocation ? null : profile.permanentAddress,
      islamicDetails,
      media,
      privacySettings: grant.isManager ? privacy : undefined,
    };
  }
}
