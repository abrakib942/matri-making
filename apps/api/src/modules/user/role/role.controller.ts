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
import { RoleService } from './role.service';
import { CheckAbility } from '@/common/decorators';
import { PermissionGuard } from '@/common/guards';
import { AssignRolePermissionsDto, CreateRoleDto, UpdateRoleDto } from './dto/index';

@Controller('')
export class RoleController {
  @Inject()
  private readonly roleService: RoleService;

  @CheckAbility({ subject: 'role', action: 'create' })
  @UseGuards(PermissionGuard)
  @HttpCode(HttpStatus.OK)
  @Post('api/v1/roles')
  async create(@Body() dto: CreateRoleDto) {
    return await this.roleService.save(dto);
  }

  @CheckAbility({ subject: 'role', action: 'read' })
  @UseGuards(PermissionGuard)
  @HttpCode(HttpStatus.OK)
  @Get('api/v1/roles')
  async readAll() {
    return await this.roleService.getAll();
  }

  @CheckAbility({ subject: 'role', action: 'read' })
  @UseGuards(PermissionGuard)
  @HttpCode(HttpStatus.OK)
  @Get('api/v1/roles/:id')
  async readById(@Param('id') id: string) {
    return await this.roleService.getById(parseInt(id));
  }

  @CheckAbility({ subject: 'role', action: 'update' })
  @UseGuards(PermissionGuard)
  @HttpCode(HttpStatus.OK)
  @Put('api/v1/roles/:id')
  async updateById(@Param('id') id, @Body() dto: UpdateRoleDto) {
    return await this.roleService.editById(parseInt(id), dto);
  }

  @CheckAbility({ subject: 'role', action: 'update' })
  @UseGuards(PermissionGuard)
  @HttpCode(HttpStatus.OK)
  @Put('api/v1/roles/:id/permissions')
  async syncPermissions(@Param('id') id: string, @Body() dto: AssignRolePermissionsDto) {
    return await this.roleService.syncPermissions(parseInt(id), dto.permissionIds);
  }

  @CheckAbility({ subject: 'role', action: 'delete' })
  @UseGuards(PermissionGuard)
  @HttpCode(HttpStatus.OK)
  @Delete('api/v1/roles/:id')
  async deleteById(@Param('id') id) {
    return await this.roleService.removeById(parseInt(id));
  }
}
