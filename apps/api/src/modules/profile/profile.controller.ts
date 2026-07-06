import { GetUser } from '@/common/decorators';
import { JwtGuard } from '@/common/guards';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
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
import { ProfileService } from './profile.service';

@ApiTags('Profiles')
@UseGuards(JwtGuard)
@Controller()
export class ProfileController {
  @Inject()
  private readonly profileService: ProfileService;

  @HttpCode(HttpStatus.OK)
  @Post('api/v1/profiles')
  async create(@GetUser('id') userId: number, @Body() dto: CreateProfileDto) {
    return await this.profileService.create(userId, dto);
  }

  @HttpCode(HttpStatus.OK)
  @Get('api/v1/profiles/mine')
  async getMine(@GetUser('id') userId: number) {
    return await this.profileService.getMine(userId);
  }

  @HttpCode(HttpStatus.OK)
  @Get('api/v1/profiles/member-invites')
  async myInvites(@GetUser('id') userId: number) {
    return await this.profileService.myInvites(userId);
  }

  @HttpCode(HttpStatus.OK)
  @Get('api/v1/profiles/:id')
  async getById(@GetUser('id') userId: number, @Param('id', ParseIntPipe) id: number) {
    return await this.profileService.getById(userId, id);
  }

  @HttpCode(HttpStatus.OK)
  @Put('api/v1/profiles/:id')
  async update(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProfileDto,
  ) {
    return await this.profileService.update(userId, id, dto);
  }

  @HttpCode(HttpStatus.OK)
  @Put('api/v1/profiles/:id/islamic-details')
  async updateIslamicDetails(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateIslamicDetailsDto,
  ) {
    return await this.profileService.updateIslamicDetails(userId, id, dto);
  }

  @HttpCode(HttpStatus.OK)
  @Put('api/v1/profiles/:id/general-details')
  async updateGeneralDetails(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateGeneralDetailsDto,
  ) {
    return await this.profileService.updateGeneralDetails(userId, id, dto);
  }

  @HttpCode(HttpStatus.OK)
  @Put('api/v1/profiles/:id/preference')
  async updatePreference(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePreferenceDto,
  ) {
    return await this.profileService.updatePreference(userId, id, dto);
  }

  @HttpCode(HttpStatus.OK)
  @Put('api/v1/profiles/:id/privacy')
  async updatePrivacy(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePrivacyDto,
  ) {
    return await this.profileService.updatePrivacy(userId, id, dto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('api/v1/profiles/:id/submit')
  async submitForApproval(@GetUser('id') userId: number, @Param('id', ParseIntPipe) id: number) {
    return await this.profileService.submitForApproval(userId, id);
  }

  // ---------- media ----------

  @HttpCode(HttpStatus.OK)
  @Post('api/v1/profiles/:id/media')
  async addMedia(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AddMediaDto,
  ) {
    return await this.profileService.addMedia(userId, id, dto);
  }

  @HttpCode(HttpStatus.OK)
  @Put('api/v1/profiles/:id/media/:mediaId')
  async updateMedia(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
    @Param('mediaId', ParseIntPipe) mediaId: number,
    @Body() dto: UpdateMediaDto,
  ) {
    return await this.profileService.updateMedia(userId, id, mediaId, dto);
  }

  @HttpCode(HttpStatus.OK)
  @Delete('api/v1/profiles/:id/media/:mediaId')
  async removeMedia(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
    @Param('mediaId', ParseIntPipe) mediaId: number,
  ) {
    return await this.profileService.removeMedia(userId, id, mediaId);
  }

  // ---------- family members ----------

  @HttpCode(HttpStatus.OK)
  @Get('api/v1/profiles/:id/members')
  async listMembers(@GetUser('id') userId: number, @Param('id', ParseIntPipe) id: number) {
    return await this.profileService.listMembers(userId, id);
  }

  @HttpCode(HttpStatus.OK)
  @Post('api/v1/profiles/:id/members/invite')
  async inviteMember(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: InviteMemberDto,
  ) {
    return await this.profileService.inviteMember(userId, id, dto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('api/v1/profiles/member-invites/:memberId/respond')
  async respondInvite(
    @GetUser('id') userId: number,
    @Param('memberId', ParseIntPipe) memberId: number,
    @Body() dto: RespondInviteDto,
  ) {
    return await this.profileService.respondInvite(userId, memberId, dto);
  }

  @HttpCode(HttpStatus.OK)
  @Delete('api/v1/profiles/:id/members/:memberId')
  async removeMember(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
    @Param('memberId', ParseIntPipe) memberId: number,
  ) {
    return await this.profileService.removeMember(userId, id, memberId);
  }
}
