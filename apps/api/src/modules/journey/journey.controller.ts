import { GetUser } from '@/common/decorators';
import { JwtGuard } from '@/common/guards';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  ParseIntPipe,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UpdateJourneyStageDto } from './dto/index';
import { JourneyService } from './journey.service';

@ApiTags('Journeys')
@UseGuards(JwtGuard)
@Controller()
export class JourneyController {
  @Inject()
  private readonly journeyService: JourneyService;

  @HttpCode(HttpStatus.OK)
  @Get('api/v1/journeys')
  async listMine(@GetUser('id') userId: number) {
    return await this.journeyService.listMine(userId);
  }

  @HttpCode(HttpStatus.OK)
  @Get('api/v1/journeys/:id')
  async getById(@GetUser('id') userId: number, @Param('id', ParseIntPipe) id: number) {
    return await this.journeyService.getById(userId, id);
  }

  @HttpCode(HttpStatus.OK)
  @Put('api/v1/journeys/:id/stage')
  async updateStage(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateJourneyStageDto,
  ) {
    return await this.journeyService.updateStage(userId, id, dto);
  }
}
