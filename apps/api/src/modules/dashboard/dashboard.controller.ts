import { GetUser } from '@/common/decorators';
import { JwtGuard } from '@/common/guards';
import { Controller, Get, HttpCode, HttpStatus, Inject, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';

@ApiTags('Dashboard')
@UseGuards(JwtGuard)
@Controller()
export class DashboardController {
  @Inject()
  private readonly dashboardService: DashboardService;

  @HttpCode(HttpStatus.OK)
  @Get('api/v1/dashboard')
  async getDashboard(@GetUser('id') userId: number) {
    return await this.dashboardService.getDashboard(userId);
  }
}
