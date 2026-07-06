import { CheckAbility, GetUser } from '@/common/decorators';
import { JwtGuard, PermissionGuard } from '@/common/guards';
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
import {
  AssignUserPermissionsDto,
  AssignUserRolesDto,
  SignInUserDto,
  UserCreateDto,
  UserUpdateDto,
} from './dto/index';
import { UserService } from './user.service';

@Controller()
export class UserController {
  @Inject()
  private readonly userService: UserService;

  @HttpCode(HttpStatus.OK)
  @Post('api/v1/auth/sign-in')
  async signIn(@Body() dto: SignInUserDto) {
    return await this.userService.signIn(dto);
  }

  @CheckAbility({ subject: 'user', action: 'create' })
  @UseGuards(PermissionGuard)
  @HttpCode(HttpStatus.OK)
  @Post('api/v1/users')
  async create(@Body() dto: UserCreateDto) {
    return await this.userService.save(dto);
  }

  @CheckAbility({ subject: 'user', action: 'read' })
  @UseGuards(PermissionGuard)
  @HttpCode(HttpStatus.OK)
  @Get('api/v1/users')
  async readAll() {
    return await this.userService.getAll();
  }

  @CheckAbility({ subject: 'user', action: 'read' })
  @UseGuards(PermissionGuard)
  @HttpCode(HttpStatus.OK)
  @Get('api/v1/users/:id')
  async readById(@Param('id') id: string) {
    return await this.userService.getById(parseInt(id));
  }

  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.OK)
  @Get('api/v1/user-profile')
  readProfile(@GetUser() user: unknown) {
    return {
      success: true,
      data: user,
    };
  }

  @CheckAbility({ subject: 'user', action: 'update' })
  @UseGuards(PermissionGuard)
  @HttpCode(HttpStatus.OK)
  @Put('api/v1/users/:id')
  async updateById(@Param('id') id: string, @Body() dto: UserUpdateDto) {
    return await this.userService.editById(parseInt(id), dto);
  }

  @CheckAbility({ subject: 'user', action: 'update' })
  @UseGuards(PermissionGuard)
  @HttpCode(HttpStatus.OK)
  @Put('api/v1/users/:id/roles')
  async updateRoles(@Param('id') id: string, @Body() dto: AssignUserRolesDto) {
    return await this.userService.updateRoles(parseInt(id), dto.roleIds);
  }

  @CheckAbility({ subject: 'user', action: 'update' })
  @UseGuards(PermissionGuard)
  @HttpCode(HttpStatus.OK)
  @Put('api/v1/users/:id/permissions')
  async updatePermissions(@Param('id') id: string, @Body() dto: AssignUserPermissionsDto) {
    return await this.userService.updatePermissions(parseInt(id), dto.permissionIds);
  }

  @CheckAbility({ subject: 'user', action: 'delete' })
  @UseGuards(PermissionGuard)
  @HttpCode(HttpStatus.OK)
  @Delete('api/v1/users/:id')
  async deleteById(@Param('id') id: string) {
    return await this.userService.removeById(parseInt(id));
  }
}
