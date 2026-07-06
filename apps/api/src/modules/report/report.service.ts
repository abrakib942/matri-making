import {
  createErrorResult,
  createSuccessResult,
  ServiceResult,
} from '@/common/interfaces/service-result.interface';
import { DbService } from '@/db/db.service';
import { Inject, Injectable } from '@nestjs/common';
import { ReportStatus } from '@prisma/client';
import { CreateReportDto, ResolveReportDto } from './dto/index';

@Injectable()
export class ReportService {
  @Inject(DbService)
  private readonly db: DbService;

  async createReport(
    userId: number,
    reportedProfileId: number,
    dto: CreateReportDto,
  ): Promise<ServiceResult> {
    const profile = await this.db.profile.findUnique({ where: { id: reportedProfileId } });

    if (!profile) {
      return createErrorResult(
        { name: 'badRequest', message: 'Profile not found' },
        'Profile not found',
      );
    }

    const existing = await this.db.report.findFirst({
      where: {
        reporterUserId: userId,
        reportedProfileId,
        status: { in: ['OPEN', 'IN_REVIEW'] },
      },
    });

    if (existing) {
      return createErrorResult(
        { name: 'badRequest', message: 'You already have an open report on this profile' },
        'You already have an open report on this profile',
      );
    }

    const data = await this.db.report.create({
      data: {
        reporterUserId: userId,
        reportedProfileId,
        reason: dto.reason,
        details: dto.details,
      },
    });

    return createSuccessResult(data, 'Report submitted. Our team will review it shortly.');
  }

  async listMyReports(userId: number): Promise<ServiceResult> {
    const reports = await this.db.report.findMany({
      where: { reporterUserId: userId },
      include: { reportedProfile: { select: { id: true, biodataNo: true } } },
      orderBy: { id: 'desc' },
    });

    return createSuccessResult(reports, 'Reports retrieved successfully');
  }

  // ---------- admin ----------

  async listReports(status?: ReportStatus): Promise<ServiceResult> {
    const reports = await this.db.report.findMany({
      where: status ? { status } : { status: { in: ['OPEN', 'IN_REVIEW'] } },
      include: {
        reporter: { select: { id: true, name: true, email: true } },
        reportedProfile: { select: { id: true, biodataNo: true, fullName: true, status: true } },
      },
      orderBy: { id: 'asc' },
    });

    return createSuccessResult(reports, 'Reports retrieved successfully');
  }

  async resolveReport(
    adminUserId: number,
    reportId: number,
    dto: ResolveReportDto,
  ): Promise<ServiceResult> {
    const report = await this.db.report.findUnique({ where: { id: reportId } });

    if (!report) {
      return createErrorResult(
        { name: 'badRequest', message: 'Report not found' },
        'Report not found',
      );
    }

    const data = await this.db.report.update({
      where: { id: reportId },
      data: {
        status: dto.status,
        resolutionNote: dto.resolutionNote,
        resolvedBy: dto.status === 'RESOLVED' || dto.status === 'DISMISSED' ? adminUserId : null,
      },
    });

    return createSuccessResult(data, 'Report updated');
  }
}
