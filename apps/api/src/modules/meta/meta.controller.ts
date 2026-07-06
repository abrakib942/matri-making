import { Controller, Get, HttpCode, HttpStatus, Inject, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { MetaService } from './meta.service';

@ApiTags('Meta')
@Controller()
export class MetaController {
  @Inject()
  private readonly metaService: MetaService;

  @HttpCode(HttpStatus.OK)
  @Get('api/v1/meta/enums')
  getEnums(@Query('lang') lang?: string) {
    return this.metaService.getEnums(lang);
  }

  @HttpCode(HttpStatus.OK)
  @Get('api/v1/meta/locations')
  async getLocations(@Query('type') type?: string, @Query('parentId') parentId?: string) {
    return await this.metaService.getLocations(
      type,
      parentId !== undefined ? parseInt(parentId) : undefined,
    );
  }

  @HttpCode(HttpStatus.OK)
  @Get('api/v1/meta/plans')
  async getPlans() {
    return await this.metaService.getPlans();
  }

  @HttpCode(HttpStatus.OK)
  @Get('api/v1/meta/stats')
  async getStats() {
    return await this.metaService.getStats();
  }
}
