import { GetUser } from '@/common/decorators';
import { JwtGuard } from '@/common/guards';
import { Body, Controller, HttpCode, HttpStatus, Inject, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SearchProfilesDto } from './dto/index';
import { SEARCH_SERVICE } from './search.interface';
import type { ISearchService } from './search.interface';

@ApiTags('Search')
@UseGuards(JwtGuard)
@Controller()
export class SearchController {
  @Inject(SEARCH_SERVICE)
  private readonly searchService: ISearchService;

  @HttpCode(HttpStatus.OK)
  @Post('api/v1/search/profiles')
  async searchProfiles(@GetUser('id') userId: number, @Body() dto: SearchProfilesDto) {
    return await this.searchService.searchProfiles(userId, dto);
  }
}
