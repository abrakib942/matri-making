import { CheckAbility } from '@/common/decorators';
import { PermissionGuard } from '@/common/guards';
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
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ContentService } from './content.service';
import {
  CreateAdvertisementDto,
  CreateCmsPageDto,
  CreateSuccessStoryDto,
  UpdateAdvertisementDto,
  UpdateCmsPageDto,
  UpdateSuccessStoryDto,
} from './dto/index';

@ApiTags('Content')
@Controller()
export class ContentController {
  @Inject()
  private readonly contentService: ContentService;

  // ---------- public endpoints ----------

  @HttpCode(HttpStatus.OK)
  @Get('api/v1/success-stories')
  async listPublicStories() {
    return await this.contentService.listPublicStories();
  }

  @HttpCode(HttpStatus.OK)
  @Get('api/v1/cms/:slug')
  async getPublicPage(@Param('slug') slug: string) {
    return await this.contentService.getPublicPage(slug);
  }

  @HttpCode(HttpStatus.OK)
  @Get('api/v1/ads')
  async listPublicAds(@Query('placement') placement?: string) {
    return await this.contentService.listPublicAds(placement);
  }

  // ---------- admin: success stories ----------

  @CheckAbility({ subject: 'success-story', action: 'read' })
  @UseGuards(PermissionGuard)
  @HttpCode(HttpStatus.OK)
  @Get('api/v1/admin/success-stories')
  async listAllStories() {
    return await this.contentService.listAllStories();
  }

  @CheckAbility({ subject: 'success-story', action: 'create' })
  @UseGuards(PermissionGuard)
  @HttpCode(HttpStatus.OK)
  @Post('api/v1/admin/success-stories')
  async createStory(@Body() dto: CreateSuccessStoryDto) {
    return await this.contentService.createStory(dto);
  }

  @CheckAbility({ subject: 'success-story', action: 'update' })
  @UseGuards(PermissionGuard)
  @HttpCode(HttpStatus.OK)
  @Put('api/v1/admin/success-stories/:id')
  async updateStory(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateSuccessStoryDto) {
    return await this.contentService.updateStory(id, dto);
  }

  @CheckAbility({ subject: 'success-story', action: 'delete' })
  @UseGuards(PermissionGuard)
  @HttpCode(HttpStatus.OK)
  @Delete('api/v1/admin/success-stories/:id')
  async deleteStory(@Param('id', ParseIntPipe) id: number) {
    return await this.contentService.deleteStory(id);
  }

  // ---------- admin: CMS pages ----------

  @CheckAbility({ subject: 'cms', action: 'read' })
  @UseGuards(PermissionGuard)
  @HttpCode(HttpStatus.OK)
  @Get('api/v1/admin/cms')
  async listAllPages() {
    return await this.contentService.listAllPages();
  }

  @CheckAbility({ subject: 'cms', action: 'create' })
  @UseGuards(PermissionGuard)
  @HttpCode(HttpStatus.OK)
  @Post('api/v1/admin/cms')
  async createPage(@Body() dto: CreateCmsPageDto) {
    return await this.contentService.createPage(dto);
  }

  @CheckAbility({ subject: 'cms', action: 'update' })
  @UseGuards(PermissionGuard)
  @HttpCode(HttpStatus.OK)
  @Put('api/v1/admin/cms/:id')
  async updatePage(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCmsPageDto) {
    return await this.contentService.updatePage(id, dto);
  }

  @CheckAbility({ subject: 'cms', action: 'delete' })
  @UseGuards(PermissionGuard)
  @HttpCode(HttpStatus.OK)
  @Delete('api/v1/admin/cms/:id')
  async deletePage(@Param('id', ParseIntPipe) id: number) {
    return await this.contentService.deletePage(id);
  }

  // ---------- admin: advertisements ----------

  @CheckAbility({ subject: 'ad', action: 'read' })
  @UseGuards(PermissionGuard)
  @HttpCode(HttpStatus.OK)
  @Get('api/v1/admin/ads')
  async listAllAds() {
    return await this.contentService.listAllAds();
  }

  @CheckAbility({ subject: 'ad', action: 'create' })
  @UseGuards(PermissionGuard)
  @HttpCode(HttpStatus.OK)
  @Post('api/v1/admin/ads')
  async createAd(@Body() dto: CreateAdvertisementDto) {
    return await this.contentService.createAd(dto);
  }

  @CheckAbility({ subject: 'ad', action: 'update' })
  @UseGuards(PermissionGuard)
  @HttpCode(HttpStatus.OK)
  @Put('api/v1/admin/ads/:id')
  async updateAd(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateAdvertisementDto) {
    return await this.contentService.updateAd(id, dto);
  }

  @CheckAbility({ subject: 'ad', action: 'delete' })
  @UseGuards(PermissionGuard)
  @HttpCode(HttpStatus.OK)
  @Delete('api/v1/admin/ads/:id')
  async deleteAd(@Param('id', ParseIntPipe) id: number) {
    return await this.contentService.deleteAd(id);
  }
}
