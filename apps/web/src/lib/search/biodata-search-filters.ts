export interface BiodataSearchFilters {
  mode: string;
  gender: string;
  maritalStatus: string;
  ageMin: string;
  ageMax: string;
  countryId: number | null;
  divisionId: number | null;
  districtId: number | null;
  upazilaId: number | null;
  professionKey: string;
  educationLevel: string;
  religion: string;
  query: string;
}

export const defaultBiodataSearchFilters: BiodataSearchFilters = {
  mode: '',
  gender: '',
  maritalStatus: '',
  ageMin: '18',
  ageMax: '35',
  countryId: null,
  divisionId: null,
  districtId: null,
  upazilaId: null,
  professionKey: '',
  educationLevel: '',
  religion: '',
  query: '',
};

export function biodataFiltersToQuery(filters: BiodataSearchFilters): string {
  const params = new URLSearchParams();
  if (filters.mode) params.set('mode', filters.mode);
  if (filters.gender) params.set('gender', filters.gender);
  if (filters.maritalStatus) params.set('maritalStatus', filters.maritalStatus);
  if (filters.ageMin) params.set('ageMin', filters.ageMin);
  if (filters.ageMax) params.set('ageMax', filters.ageMax);
  if (filters.religion) params.set('religion', filters.religion);
  if (filters.educationLevel) params.set('educationLevel', filters.educationLevel);
  if (filters.professionKey) params.set('professionKey', filters.professionKey);
  if (filters.upazilaId) params.set('upazilaId', String(filters.upazilaId));
  else if (filters.districtId) params.set('districtId', String(filters.districtId));
  else if (filters.divisionId) params.set('divisionId', String(filters.divisionId));
  if (filters.countryId) params.set('countryId', String(filters.countryId));
  if (filters.query.trim()) params.set('q', filters.query.trim());
  return params.toString();
}

export function biodataFiltersToSearchBody(
  filters: BiodataSearchFilters,
  extras?: { cursor?: number; limit?: number; sortBy?: string; minMatchScore?: number | null },
): Record<string, unknown> {
  const body: Record<string, unknown> = {
    limit: extras?.limit ?? 12,
    sortBy: extras?.sortBy ?? 'newest',
  };
  if (extras?.cursor) body.cursor = extras.cursor;
  if (filters.mode) body.mode = filters.mode;
  if (filters.gender) body.gender = filters.gender;
  if (filters.religion) body.religion = filters.religion;
  if (filters.maritalStatus) body.maritalStatuses = [filters.maritalStatus];
  if (filters.ageMin) body.ageMin = Number(filters.ageMin);
  if (filters.ageMax) body.ageMax = Number(filters.ageMax);
  if (filters.educationLevel) body.educationLevels = [filters.educationLevel];
  if (filters.professionKey) body.professionKeys = [filters.professionKey];
  if (filters.districtId) body.districtIds = [filters.districtId];
  if (filters.upazilaId) body.upazilaIds = [filters.upazilaId];
  if (filters.divisionId && !filters.districtId && !filters.upazilaId) {
    body.divisionIds = [filters.divisionId];
  }
  const q = filters.query.trim();
  if (q) body.biodataNo = q;
  if (extras?.minMatchScore != null) body.minMatchScore = extras.minMatchScore;
  return body;
}

export function countActiveAdvancedFilters(filters: BiodataSearchFilters): number {
  let n = 0;
  if (filters.mode) n++;
  if (filters.maritalStatus) n++;
  if (filters.professionKey) n++;
  if (filters.educationLevel) n++;
  if (filters.religion) n++;
  if (filters.countryId) n++;
  if (filters.upazilaId) n++;
  return n;
}

export function parseFiltersFromSearchParams(
  params: URLSearchParams,
): Partial<BiodataSearchFilters> {
  return {
    mode: params.get('mode') ?? '',
    gender: params.get('gender') ?? '',
    maritalStatus: params.get('maritalStatus') ?? '',
    ageMin: params.get('ageMin') ?? '',
    ageMax: params.get('ageMax') ?? '',
    religion: params.get('religion') ?? '',
    educationLevel: params.get('educationLevel') ?? '',
    professionKey: params.get('professionKey') ?? '',
    divisionId: params.get('divisionId') ? Number(params.get('divisionId')) : null,
    districtId: params.get('districtId') ? Number(params.get('districtId')) : null,
    upazilaId: params.get('upazilaId') ? Number(params.get('upazilaId')) : null,
    countryId: params.get('countryId') ? Number(params.get('countryId')) : null,
    query: params.get('q') ?? params.get('biodataNo') ?? '',
  };
}
