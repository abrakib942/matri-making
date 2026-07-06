import { CheckAbility, GetUser } from '@/common/decorators';
import { JwtGuard, PermissionGuard } from '@/common/guards';
import {
  Body,
  Controller,
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
import { ReportStatus } from '@prisma/client';
import { CreateReportDto, ResolveReportDto } from './dto/index';
import { ReportService } from './report.service';

@ApiTags('Reports')
@Controller()
export class ReportController {
  @Inject()
  private readonly reportService: ReportService;

  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.OK)
  @Post('api/v1/profiles/:id/report')
  async createReport(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateReportDto,
  ) {
    return await this.reportService.createReport(userId, id, dto);
  }

  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.OK)
  @Get('api/v1/me/reports')
  async listMyReports(@GetUser('id') userId: number) {
    return await this.reportService.listMyReports(userId);
  }

  @CheckAbility({ subject: 'report', action: 'read' })
  @UseGuards(PermissionGuard)
  @HttpCode(HttpStatus.OK)
  @Get('api/v1/admin/reports')
  async listReports(@Query('status') status?: ReportStatus) {
    return await this.reportService.listReports(status);
  }

  @CheckAbility({ subject: 'report', action: 'update' })
  @UseGuards(PermissionGuard)
  @HttpCode(HttpStatus.OK)
  @Put('api/v1/admin/reports/:id')
  async resolveReport(
    @GetUser('id') adminUserId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ResolveReportDto,
  ) {
    return await this.reportService.resolveReport(adminUserId, id, dto);
  }
}
