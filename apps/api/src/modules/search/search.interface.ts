import { ServiceResult } from '@/common/interfaces/service-result.interface';
import { SearchProfilesDto } from './dto/index';

/**
 * Search abstraction: the default implementation queries PostgreSQL directly;
 * an Elasticsearch-backed implementation can be swapped in later by providing
 * this token with a different class.
 */
export const SEARCH_SERVICE = 'SEARCH_SERVICE';

export interface ISearchService {
  searchProfiles(viewerUserId: number, dto: SearchProfilesDto): Promise<ServiceResult>;
}
