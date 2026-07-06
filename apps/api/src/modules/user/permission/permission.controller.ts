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

import { PermissionService } from './permission.service';
import { CheckAbility } from '@/common/decorators';
import { PermissionGuard } from '@/common/guards';
import { CreatePermissionDto, UpdatePermissionDto } from './dto/index';

const permissionSubject = 'permission';

@Controller()
export class PermissionController {
  @Inject()
  private readonly permissionService: PermissionService;

  @CheckAbility({ subject: permissionSubject, action: 'create' })
  @UseGuards(PermissionGuard)
  @HttpCode(HttpStatus.OK)
  @Post('api/v1/permissions')
  async create(@Body() dto: CreatePermissionDto) {
    return await this.permissionService.save(dto);
  }

  @CheckAbility({ subject: permissionSubject, action: 'read' })
  @UseGuards(PermissionGuard)
  @HttpCode(HttpStatus.OK)
  @Get('api/v1/permission-modules')
  async readAllModuleNames() {
    return await this.permissionService.getAllModuleNames();
  }

  @CheckAbility({ subject: permissionSubject, action: 'read' })
  @UseGuards(PermissionGuard)
  @HttpCode(HttpStatus.OK)
  @Get('api/v1/permission-types')
  async readAllPermissionTypes() {
    return await this.permissionService.getAllPermissionTypes();
  }

  @CheckAbility({ subject: permissionSubject, action: 'read' })
  @UseGuards(PermissionGuard)
  @HttpCode(HttpStatus.OK)
  @Get('api/v1/permissions/catalog')
  async readCatalog() {
    return await this.permissionService.getCatalog();
  }

  @CheckAbility({ subject: permissionSubject, action: 'read' })
  @UseGuards(PermissionGuard)
  @HttpCode(HttpStatus.OK)
  @Get('api/v1/permissions')
  async readAll() {
    return await this.permissionService.getAll(null);
  }

  @CheckAbility({ subject: permissionSubject, action: 'read' })
  @UseGuards(PermissionGuard)
  @HttpCode(HttpStatus.OK)
  @Get('api/v1/roles/:roleId/permissions')
  async readAllByRole(@Param('roleId') roleId: string) {
    return await this.permissionService.getAll(parseInt(roleId));
  }

  @CheckAbility({ subject: permissionSubject, action: 'read' })
  @UseGuards(PermissionGuard)
  @HttpCode(HttpStatus.OK)
  @Get('api/v1/permissions/:id')
  async readById(@Param('id') id) {
    return await this.permissionService.getById(parseInt(id));
  }

  @CheckAbility({ subject: permissionSubject, action: 'update' })
  @UseGuards(PermissionGuard)
  @HttpCode(HttpStatus.OK)
  @Put('api/v1/permissions/:id')
  async updateById(@Param('id') id, @Body() dto: UpdatePermissionDto) {
    return await this.permissionService.editById(parseInt(id), dto);
  }

  @CheckAbility({ subject: permissionSubject, action: 'delete' })
  @UseGuards(PermissionGuard)
  @HttpCode(HttpStatus.OK)
  @Delete('api/v1/permissions/:id')
  async deleteById(@Param('id') id) {
    return await this.permissionService.removeById(parseInt(id));
  }
}
