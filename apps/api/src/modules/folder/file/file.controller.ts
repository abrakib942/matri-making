import { CheckAbility } from '@/common/decorators';
import { PermissionGuard } from '@/common/guards';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { FileDto, UpdateFileDto } from './dto/index';
import { FileService } from './file.service';

export const fileSubject = 'file';

@Controller('')
export class FileController {
  @Inject()
  private readonly fileService: FileService;

  @CheckAbility({ subject: fileSubject, action: 'create' })
  @UseGuards(PermissionGuard)
  @HttpCode(HttpStatus.OK)
  @Post('api/v1/files')
  async create(@Body() dto: FileDto) {
    return await this.fileService.save(dto);
  }

  @CheckAbility({ subject: fileSubject, action: 'read' })
  @UseGuards(PermissionGuard)
  @HttpCode(HttpStatus.OK)
  @Get('api/v1/folders/:folderId/files')
  async readAll(@Param('folderId') folderId: string) {
    return await this.fileService.getAll(parseInt(folderId));
  }

  @CheckAbility({ subject: fileSubject, action: 'read' })
  @UseGuards(PermissionGuard)
  @HttpCode(HttpStatus.OK)
  @Get('api/v1/files/:id')
  async readById(@Param('id') id: string) {
    return await this.fileService.getById(parseInt(id, 10));
  }

  @CheckAbility({ subject: fileSubject, action: 'update' })
  @UseGuards(PermissionGuard)
  @HttpCode(HttpStatus.OK)
  @Put('api/v1/files/:id')
  async updateById(@Param('id') id: string, @Body() dto: UpdateFileDto) {
    return await this.fileService.editById(parseInt(id, 10), dto);
  }

  @CheckAbility({ subject: fileSubject, action: 'delete' })
  @UseGuards(PermissionGuard)
  @HttpCode(HttpStatus.OK)
  @Delete('api/v1/files/:id')
  async deleteById(@Param('id') id: string) {
    return await this.fileService.removeById(parseInt(id, 10));
  }
}
