import {
  UseGuards,
  Controller,
  Body,
  Post,
  HttpCode,
  HttpStatus,
  Get,
  Param,
  Delete,
  Put,
  Inject,
} from '@nestjs/common';
import { FolderService } from './folder.service';
import { CheckAbility } from '@/common/decorators';
import { PermissionGuard } from '@/common/guards';
import { CreateFolderDto, UpdateFolderDto } from './dto/index';

export const folderSubject = 'folder';

@Controller('')
export class FolderController {
  @Inject()
  private readonly folderService: FolderService;

  @CheckAbility({ subject: folderSubject, action: 'create' })
  @UseGuards(PermissionGuard)
  @HttpCode(HttpStatus.OK)
  @Post('api/v1/folders')
  async create(@Body() dto: CreateFolderDto) {
    return await this.folderService.save(dto);
  }

  @CheckAbility({ subject: folderSubject, action: 'read' })
  @UseGuards(PermissionGuard)
  @HttpCode(HttpStatus.OK)
  @Get('api/v1/folders')
  async readAll() {
    return await this.folderService.getAll();
  }

  @CheckAbility({ subject: folderSubject, action: 'read' })
  @UseGuards(PermissionGuard)
  @HttpCode(HttpStatus.OK)
  @Get('api/v1/folders/:id')
  async readById(@Param('id') id: string) {
    return await this.folderService.getById(parseInt(id));
  }

  @CheckAbility({ subject: folderSubject, action: 'update' })
  @UseGuards(PermissionGuard)
  @HttpCode(HttpStatus.OK)
  @Put('api/v1/folders/:id')
  async updateById(@Param('id') id: string, @Body() dto: UpdateFolderDto) {
    return await this.folderService.editById(parseInt(id, 10), dto);
  }

  @CheckAbility({ subject: folderSubject, action: 'delete' })
  @UseGuards(PermissionGuard)
  @HttpCode(HttpStatus.OK)
  @Delete('api/v1/folders/:id')
  async deleteById(@Param('id') id: string) {
    return await this.folderService.removeById(parseInt(id, 10));
  }
}
