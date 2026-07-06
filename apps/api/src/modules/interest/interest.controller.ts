import { GetUser } from '@/common/decorators';
import { JwtGuard } from '@/common/guards';
import {
  Body,
  Controller,
  Delete,
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
import {
  BlockProfileDto,
  ListInterestsDto,
  NoteDto,
  RespondInterestDto,
  SendInterestDto,
} from './dto/index';
import { InterestService } from './interest.service';

@ApiTags('Interests')
@UseGuards(JwtGuard)
@Controller()
export class InterestController {
  @Inject()
  private readonly interestService: InterestService;

  @HttpCode(HttpStatus.OK)
  @Post('api/v1/interests')
  async sendInterest(@GetUser('id') userId: number, @Body() dto: SendInterestDto) {
    return await this.interestService.sendInterest(userId, dto);
  }

  @HttpCode(HttpStatus.OK)
  @Get('api/v1/interests')
  async listInterests(@GetUser('id') userId: number, @Query() dto: ListInterestsDto) {
    return await this.interestService.listInterests(userId, dto);
  }

  @HttpCode(HttpStatus.OK)
  @Put('api/v1/interests/:id/respond')
  async respondInterest(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: RespondInterestDto,
  ) {
    return await this.interestService.respondInterest(userId, id, dto);
  }

  @HttpCode(HttpStatus.OK)
  @Put('api/v1/interests/:id/withdraw')
  async withdrawInterest(@GetUser('id') userId: number, @Param('id', ParseIntPipe) id: number) {
    return await this.interestService.withdrawInterest(userId, id);
  }

  // ---------- shortlist ----------

  @HttpCode(HttpStatus.OK)
  @Post('api/v1/profiles/:id/shortlist')
  async addShortlist(@GetUser('id') userId: number, @Param('id', ParseIntPipe) id: number) {
    return await this.interestService.addShortlist(userId, id);
  }

  @HttpCode(HttpStatus.OK)
  @Delete('api/v1/profiles/:id/shortlist')
  async removeShortlist(@GetUser('id') userId: number, @Param('id', ParseIntPipe) id: number) {
    return await this.interestService.removeShortlist(userId, id);
  }

  @HttpCode(HttpStatus.OK)
  @Get('api/v1/me/shortlist')
  async listShortlist(@GetUser('id') userId: number) {
    return await this.interestService.listShortlist(userId);
  }

  // ---------- favourite ----------

  @HttpCode(HttpStatus.OK)
  @Post('api/v1/profiles/:id/favourite')
  async addFavourite(@GetUser('id') userId: number, @Param('id', ParseIntPipe) id: number) {
    return await this.interestService.addFavourite(userId, id);
  }

  @HttpCode(HttpStatus.OK)
  @Delete('api/v1/profiles/:id/favourite')
  async removeFavourite(@GetUser('id') userId: number, @Param('id', ParseIntPipe) id: number) {
    return await this.interestService.removeFavourite(userId, id);
  }

  @HttpCode(HttpStatus.OK)
  @Get('api/v1/me/favourites')
  async listFavourites(@GetUser('id') userId: number) {
    return await this.interestService.listFavourites(userId);
  }

  // ---------- block ----------

  @HttpCode(HttpStatus.OK)
  @Post('api/v1/profiles/:id/block')
  async blockProfile(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: BlockProfileDto,
  ) {
    return await this.interestService.blockProfile(userId, id, dto);
  }

  @HttpCode(HttpStatus.OK)
  @Delete('api/v1/profiles/:id/block')
  async unblockProfile(@GetUser('id') userId: number, @Param('id', ParseIntPipe) id: number) {
    return await this.interestService.unblockProfile(userId, id);
  }

  @HttpCode(HttpStatus.OK)
  @Get('api/v1/me/blocks')
  async listBlocks(@GetUser('id') userId: number) {
    return await this.interestService.listBlocks(userId);
  }

  // ---------- notes ----------

  @HttpCode(HttpStatus.OK)
  @Put('api/v1/profiles/:id/note')
  async upsertNote(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: NoteDto,
  ) {
    return await this.interestService.upsertNote(userId, id, dto);
  }

  @HttpCode(HttpStatus.OK)
  @Delete('api/v1/profiles/:id/note')
  async removeNote(@GetUser('id') userId: number, @Param('id', ParseIntPipe) id: number) {
    return await this.interestService.removeNote(userId, id);
  }

  @HttpCode(HttpStatus.OK)
  @Get('api/v1/me/notes')
  async listNotes(@GetUser('id') userId: number) {
    return await this.interestService.listNotes(userId);
  }

  // ---------- visitors ----------

  @HttpCode(HttpStatus.OK)
  @Get('api/v1/me/visitors')
  async listVisitors(@GetUser('id') userId: number) {
    return await this.interestService.listVisitors(userId);
  }
}
