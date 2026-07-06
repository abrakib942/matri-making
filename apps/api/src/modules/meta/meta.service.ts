import { createSuccessResult, ServiceResult } from '@/common/interfaces/service-result.interface';
import { DbService } from '@/db/db.service';
import { Inject, Injectable } from '@nestjs/common';
import { Gender, GeneralStatus, LocationType, ProfileStatus } from '@prisma/client';
import { ENUM_CATALOG } from './enum-catalog';

@Injectable()
export class MetaService {
  @Inject(DbService)
  private readonly db: DbService;

  getEnums(lang?: string): ServiceResult {
    if (lang === 'en' || lang === 'bn') {
      const localized = Object.fromEntries(
        Object.entries(ENUM_CATALOG).map(([key, entries]) => [
          key,
          entries.map(entry => ({ value: entry.value, label: entry[lang] })),
        ]),
      );

      return createSuccessResult(localized, 'Enum catalog retrieved successfully');
    }

    return createSuccessResult(ENUM_CATALOG, 'Enum catalog retrieved successfully');
  }

  async getLocations(type?: string, parentId?: number): Promise<ServiceResult> {
    const where: { type?: LocationType; parentId?: number } = {};

    if (type && Object.values(LocationType).includes(type.toUpperCase() as LocationType)) {
      where.type = type.toUpperCase() as LocationType;
    }

    if (parentId !== undefined && !Number.isNaN(parentId)) {
      where.parentId = parentId;
    }

    const locations = await this.db.location.findMany({
      where,
      orderBy: { nameEn: 'asc' },
    });

    return createSuccessResult(locations, 'Locations retrieved successfully');
  }

  async getPlans(): Promise<ServiceResult> {
    const [plans, creditPackages] = await Promise.all([
      this.db.plan.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } }),
      this.db.creditPackage.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } }),
    ]);

    return createSuccessResult({ plans, creditPackages }, 'Plans retrieved successfully');
  }

  async getStats(): Promise<ServiceResult> {
    const activeWhere = { status: ProfileStatus.ACTIVE };

    const [
      totalBiodatas,
      grooms,
      brides,
      successfulMarriages,
      divisionGroups,
      divisions,
      modeGenderGroups,
    ] = await Promise.all([
      this.db.profile.count({ where: activeWhere }),
      this.db.profile.count({ where: { ...activeWhere, gender: Gender.MALE } }),
      this.db.profile.count({ where: { ...activeWhere, gender: Gender.FEMALE } }),
      this.db.successStory.count({ where: { status: GeneralStatus.ACTIVE } }),
      this.db.profile.groupBy({
        by: ['divisionId', 'gender'],
        where: { ...activeWhere, divisionId: { not: null } },
        _count: { _all: true },
      }),
      this.db.location.findMany({
        where: { type: LocationType.DIVISION },
        orderBy: { nameEn: 'asc' },
      }),
      this.db.profile.groupBy({
        by: ['mode', 'gender'],
        where: activeWhere,
        _count: { _all: true },
      }),
    ]);

    const divisionMap = new Map<
      number,
      { divisionId: number; nameEn: string; nameBn: string; grooms: number; brides: number }
    >();

    for (const div of divisions) {
      divisionMap.set(div.id, {
        divisionId: div.id,
        nameEn: div.nameEn,
        nameBn: div.nameBn,
        grooms: 0,
        brides: 0,
      });
    }

    for (const row of divisionGroups) {
      if (!row.divisionId) continue;
      const entry = divisionMap.get(row.divisionId);
      if (!entry) continue;
      if (row.gender === Gender.MALE) entry.grooms = row._count._all;
      else if (row.gender === Gender.FEMALE) entry.brides = row._count._all;
    }

    const totals = {
      totalBiodatas: totalBiodatas || 0,
      grooms: grooms || 0,
      brides: brides || 0,
      successfulMarriages: successfulMarriages || 0,
    };

    const byMode = {
      ISLAMIC: { male: 0, female: 0, total: 0 },
      GENERAL: { male: 0, female: 0, total: 0 },
    };

    for (const row of modeGenderGroups) {
      const entry = byMode[row.mode];
      if (!entry) continue;
      if (row.gender === Gender.MALE) entry.male = row._count._all;
      else if (row.gender === Gender.FEMALE) entry.female = row._count._all;
      entry.total = entry.male + entry.female;
    }

    return createSuccessResult(
      {
        ...totals,
        byMode,
        divisions: Array.from(divisionMap.values()),
      },
      'Public stats retrieved successfully',
    );
  }
}
