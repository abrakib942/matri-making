import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  HealthCheckService,
  HealthCheck,
  MemoryHealthIndicator,
  DiskHealthIndicator,
} from '@nestjs/terminus';
import { DbService } from '@/db/db.service';
import { HealthResponseDto, PingResponseDto } from './dto/health-response.dto';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly memory: MemoryHealthIndicator,
    private readonly disk: DiskHealthIndicator,
    private readonly db: DbService,
  ) {}

  @Get()
  @HealthCheck()
  @ApiOperation({ summary: 'Check API health status' })
  @ApiResponse({
    status: 200,
    description: 'API is healthy',
    type: HealthResponseDto,
  })
  @ApiResponse({ status: 503, description: 'API is unhealthy' })
  async check() {
    return this.health.check([
      async () => {
        try {
          await this.db.$queryRaw`SELECT 1`;
          return {
            database: {
              status: 'up',
            },
          };
        } catch (error) {
          return {
            database: {
              status: 'down',
              message: error instanceof Error ? error.message : 'Unknown error',
            },
          };
        }
      },
      () => this.memory.checkHeap('memory_heap', 150 * 1024 * 1024),
      () => this.memory.checkRSS('memory_rss', 150 * 1024 * 1024),
      () =>
        this.disk.checkStorage('storage', {
          path: '/',
          thresholdPercent: 0.9,
        }),
    ]);
  }

  @Get('ping')
  @ApiOperation({ summary: 'Simple ping endpoint' })
  @ApiResponse({
    status: 200,
    description: 'Pong response',
    type: PingResponseDto,
  })
  ping(): PingResponseDto {
    return {
      status: 'ok',
      message: 'pong',
      timestamp: new Date().toISOString(),
    };
  }
}
