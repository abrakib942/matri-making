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
import { VerificationStatus, VerificationType } from '@prisma/client';
import { ReviewVerificationDto, SubmitVerificationDto } from './dto/index';
import { VerificationService } from './verification.service';

@ApiTags('Verification')
@Controller()
export class VerificationController {
  @Inject()
  private readonly verificationService: VerificationService;

  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.OK)
  @Post('api/v1/verifications')
  async submit(@GetUser('id') userId: number, @Body() dto: SubmitVerificationDto) {
    return await this.verificationService.submit(userId, dto);
  }

  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.OK)
  @Get('api/v1/me/verifications')
  async getMine(@GetUser('id') userId: number) {
    return await this.verificationService.getMine(userId);
  }

  // ---------- admin review queue ----------

  @CheckAbility({ subject: 'verification', action: 'read' })
  @UseGuards(PermissionGuard)
  @HttpCode(HttpStatus.OK)
  @Get('api/v1/admin/verifications')
  async listForReview(
    @Query('status') status?: VerificationStatus,
    @Query('type') type?: VerificationType,
  ) {
    return await this.verificationService.listForReview(status, type);
  }

  @CheckAbility({ subject: 'verification', action: 'update' })
  @UseGuards(PermissionGuard)
  @HttpCode(HttpStatus.OK)
  @Put('api/v1/admin/verifications/:id/review')
  async review(
    @GetUser('id') reviewerId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ReviewVerificationDto,
  ) {
    return await this.verificationService.review(reviewerId, id, dto);
  }
}
