import { Inject, Injectable } from '@nestjs/common';
import { DbService } from '@/db/db.service';
import { CreatePermissionDto, UpdatePermissionDto } from './dto/index';
import { createSuccessResult, createErrorResult, ServiceResult } from '@/common/interfaces';

@Injectable()
export class PermissionService {
  @Inject(DbService)
  private readonly db: DbService;

  private formatLabel(value: string) {
    return value
      .split(/[-_]/)
      .filter(Boolean)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  async save(dto: CreatePermissionDto): Promise<ServiceResult> {
    const data = await this.db.permission.create({
      data: {
        subject: dto.subject,
        action: dto.action,
        description: dto.description,
      },
    });

    return createSuccessResult(data, 'Permission created successfully');
  }

  async getAllModuleNames(): Promise<ServiceResult> {
    const subjects = await this.db.permission.findMany({
      distinct: ['subject'],
      select: { subject: true },
      orderBy: { subject: 'asc' },
    });

    const result = subjects.map(({ subject }) => ({
      value: subject,
      label: this.formatLabel(subject),
    }));

    return createSuccessResult(result, 'Module names retrieved successfully');
  }

  async getAllPermissionTypes(): Promise<ServiceResult> {
    const actions = await this.db.permission.findMany({
      distinct: ['action'],
      select: { action: true },
      orderBy: { action: 'asc' },
    });

    const result = actions.map(({ action }) => ({
      value: action,
      label: this.formatLabel(action),
    }));

    return createSuccessResult(result, 'Permission types retrieved successfully');
  }

  async getAll(roleId: number | null): Promise<ServiceResult> {
    if (!roleId) {
      const data = await this.db.permission.findMany({
        include: {
          rolePermissions: {
            include: {
              role: true,
            },
          },
        },
      });

      return createSuccessResult(data, 'Permissions retrieved successfully');
    }

    const role = await this.db.role.findUnique({
      where: { id: roleId },
      select: { id: true, name: true, description: true },
    });

    if (!role) {
      return createErrorResult({ name: 'badRequest', message: 'Role not found' }, 'Role not found');
    }

    const rolePermissions = await this.db.rolePermission.findMany({
      where: { roleId },
      include: {
        permission: true,
      },
    });

    const data = rolePermissions.map(({ permission }) => ({
      ...permission,
      role,
    }));

    return createSuccessResult(data, 'Role permissions retrieved successfully');
  }

  async getCatalog(): Promise<ServiceResult> {
    const permissions = await this.db.permission.findMany({
      orderBy: [{ subject: 'asc' }, { action: 'asc' }],
    });

    const grouped = permissions.reduce((acc, permission) => {
      if (!acc.has(permission.subject)) {
        acc.set(permission.subject, {
          subject: permission.subject,
          label: this.formatLabel(permission.subject),
          permissions: [],
        });
      }

      acc.get(permission.subject).permissions.push({
        id: permission.id,
        action: permission.action,
        label: this.formatLabel(permission.action),
        description: permission.description,
      });

      return acc;
    }, new Map<string, any>());

    const catalog = Array.from(grouped.values());

    return createSuccessResult(catalog, 'Permission catalog retrieved successfully');
  }

  async getById(id: number): Promise<ServiceResult> {
    // Business logic validation
    if (!id || id <= 0) {
      return createErrorResult(
        { name: 'badRequest', message: 'Invalid permission ID' },
        'Invalid permission ID provided',
      );
    }

    const data = await this.db.permission.findFirst({
      where: { id },
      include: {
        rolePermissions: {
          include: {
            role: true,
          },
        },
      },
    });

    // Business logic: check if permission exists
    if (!data) {
      return createErrorResult(
        { name: 'badRequest', message: 'Permission not found' },
        'Permission not found',
      );
    }

    return createSuccessResult(data, 'Permission retrieved successfully');
  }

  async editById(id: number, dto: UpdatePermissionDto): Promise<ServiceResult> {
    // Business logic validation
    if (!id || id <= 0) {
      return createErrorResult(
        { name: 'badRequest', message: 'Invalid permission ID' },
        'Invalid permission ID provided',
      );
    }

    const data = await this.db.permission.update({
      where: { id },
      data: dto,
    });

    return createSuccessResult(data, 'Permission updated successfully');
  }

  async removeById(id: number): Promise<ServiceResult> {
    // Business logic validation
    if (!id || id <= 0) {
      return createErrorResult(
        { name: 'badRequest', message: 'Invalid permission ID' },
        'Invalid permission ID provided',
      );
    }

    const data = await this.db.permission.delete({
      where: { id },
    });

    return createSuccessResult(data, 'Permission deleted successfully');
  }
}
