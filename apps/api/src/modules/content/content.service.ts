import {
  createErrorResult,
  createSuccessResult,
  ServiceResult,
} from '@/common/interfaces/service-result.interface';
import { DbService } from '@/db/db.service';
import { Inject, Injectable } from '@nestjs/common';
import {
  CreateAdvertisementDto,
  CreateCmsPageDto,
  CreateSuccessStoryDto,
  UpdateAdvertisementDto,
  UpdateCmsPageDto,
  UpdateSuccessStoryDto,
} from './dto/index';

@Injectable()
export class ContentService {
  @Inject(DbService)
  private readonly db: DbService;

  // ---------- success stories ----------

  async listPublicStories(): Promise<ServiceResult> {
    const stories = await this.db.successStory.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { id: 'desc' },
    });

    return createSuccessResult(stories, 'Success stories retrieved successfully');
  }

  async listAllStories(): Promise<ServiceResult> {
    const stories = await this.db.successStory.findMany({ orderBy: { id: 'desc' } });

    return createSuccessResult(stories, 'Success stories retrieved successfully');
  }

  async createStory(dto: CreateSuccessStoryDto): Promise<ServiceResult> {
    const { marriedAt, ...rest } = dto;

    const data = await this.db.successStory.create({
      data: { ...rest, ...(marriedAt ? { marriedAt: new Date(marriedAt) } : {}) },
    });

    return createSuccessResult(data, 'Success story created');
  }

  async updateStory(id: number, dto: UpdateSuccessStoryDto): Promise<ServiceResult> {
    const existing = await this.db.successStory.findUnique({ where: { id } });

    if (!existing) {
      return createErrorResult(
        { name: 'badRequest', message: 'Success story not found' },
        'Success story not found',
      );
    }

    const { marriedAt, ...rest } = dto;

    const data = await this.db.successStory.update({
      where: { id },
      data: { ...rest, ...(marriedAt ? { marriedAt: new Date(marriedAt) } : {}) },
    });

    return createSuccessResult(data, 'Success story updated');
  }

  async deleteStory(id: number): Promise<ServiceResult> {
    await this.db.successStory.deleteMany({ where: { id } });

    return createSuccessResult({ deleted: true }, 'Success story deleted');
  }

  // ---------- CMS pages ----------

  async getPublicPage(slug: string): Promise<ServiceResult> {
    const page = await this.db.cmsPage.findFirst({ where: { slug, status: 'ACTIVE' } });

    if (!page) {
      return createErrorResult({ name: 'badRequest', message: 'Page not found' }, 'Page not found');
    }

    return createSuccessResult(page, 'Page retrieved successfully');
  }

  async listAllPages(): Promise<ServiceResult> {
    const pages = await this.db.cmsPage.findMany({ orderBy: { slug: 'asc' } });

    return createSuccessResult(pages, 'Pages retrieved successfully');
  }

  async createPage(dto: CreateCmsPageDto): Promise<ServiceResult> {
    const existing = await this.db.cmsPage.findUnique({ where: { slug: dto.slug } });

    if (existing) {
      return createErrorResult(
        { name: 'badRequest', message: 'A page with this slug already exists' },
        'A page with this slug already exists',
      );
    }

    const data = await this.db.cmsPage.create({ data: { ...dto } });

    return createSuccessResult(data, 'Page created');
  }

  async updatePage(id: number, dto: UpdateCmsPageDto): Promise<ServiceResult> {
    const existing = await this.db.cmsPage.findUnique({ where: { id } });

    if (!existing) {
      return createErrorResult({ name: 'badRequest', message: 'Page not found' }, 'Page not found');
    }

    const data = await this.db.cmsPage.update({ where: { id }, data: { ...dto } });

    return createSuccessResult(data, 'Page updated');
  }

  async deletePage(id: number): Promise<ServiceResult> {
    await this.db.cmsPage.deleteMany({ where: { id } });

    return createSuccessResult({ deleted: true }, 'Page deleted');
  }

  // ---------- advertisements ----------

  async listPublicAds(placement?: string): Promise<ServiceResult> {
    const now = new Date();

    const ads = await this.db.advertisement.findMany({
      where: {
        status: 'ACTIVE',
        ...(placement ? { placement } : {}),
        OR: [{ startsAt: null }, { startsAt: { lte: now } }],
        AND: [{ OR: [{ endsAt: null }, { endsAt: { gte: now } }] }],
      },
      orderBy: { id: 'desc' },
    });

    return createSuccessResult(ads, 'Advertisements retrieved successfully');
  }

  async listAllAds(): Promise<ServiceResult> {
    const ads = await this.db.advertisement.findMany({ orderBy: { id: 'desc' } });

    return createSuccessResult(ads, 'Advertisements retrieved successfully');
  }

  async createAd(dto: CreateAdvertisementDto): Promise<ServiceResult> {
    const { startsAt, endsAt, ...rest } = dto;

    const data = await this.db.advertisement.create({
      data: {
        ...rest,
        ...(startsAt ? { startsAt: new Date(startsAt) } : {}),
        ...(endsAt ? { endsAt: new Date(endsAt) } : {}),
      },
    });

    return createSuccessResult(data, 'Advertisement created');
  }

  async updateAd(id: number, dto: UpdateAdvertisementDto): Promise<ServiceResult> {
    const existing = await this.db.advertisement.findUnique({ where: { id } });

    if (!existing) {
      return createErrorResult(
        { name: 'badRequest', message: 'Advertisement not found' },
        'Advertisement not found',
      );
    }

    const { startsAt, endsAt, ...rest } = dto;

    const data = await this.db.advertisement.update({
      where: { id },
      data: {
        ...rest,
        ...(startsAt ? { startsAt: new Date(startsAt) } : {}),
        ...(endsAt ? { endsAt: new Date(endsAt) } : {}),
      },
    });

    return createSuccessResult(data, 'Advertisement updated');
  }

  async deleteAd(id: number): Promise<ServiceResult> {
    await this.db.advertisement.deleteMany({ where: { id } });

    return createSuccessResult({ deleted: true }, 'Advertisement deleted');
  }
}
