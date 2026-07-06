import { Injectable, Inject } from '@nestjs/common';
import { DbService } from '@/db/db.service';
import { CreateFolderDto, UpdateFolderDto } from './dto/index';
import slugify from 'slugify';
import { createSuccessResult, createErrorResult, ServiceResult } from '@/common/interfaces';

@Injectable()
export class FolderService {
  constructor(@Inject(DbService) private readonly db: DbService) {}

  async save(dto: CreateFolderDto): Promise<ServiceResult> {
    // Business logic validation
    if (!dto.name || dto.name.trim().length === 0) {
      return createErrorResult(
        { name: 'badRequest', message: 'Folder name is required' },
        'Folder name cannot be empty',
      );
    }

    // Single operation - use Prisma directly
    const data = await this.db.folder.create({
      data: {
        ...dto,
        slug: slugify(dto.name, {
          lower: true,
          strict: true,
        }),
        name: dto.name,
      },
    });

    return createSuccessResult(data, 'Folder created successfully');
  }

  async getAll(): Promise<ServiceResult> {
    // Single operation - use Prisma directly
    const data = await this.db.folder.findMany();

    return createSuccessResult(data, 'Folders retrieved successfully');
  }

  async getById(id: number): Promise<ServiceResult> {
    // Business logic validation
    if (!id || id <= 0) {
      return createErrorResult(
        { name: 'badRequest', message: 'Invalid folder ID' },
        'Invalid folder ID provided',
      );
    }

    // Single operation - use Prisma directly
    const data = await this.db.folder.findFirst({
      where: { id },
    });

    // Business logic: check if folder exists
    if (!data) {
      return createErrorResult(
        { name: 'badRequest', message: 'Folder not found' },
        'Folder not found',
      );
    }

    return createSuccessResult(data, 'Folder retrieved successfully');
  }

  async editById(id: number, dto: UpdateFolderDto): Promise<ServiceResult> {
    // Business logic validation
    if (!id || id <= 0) {
      return createErrorResult(
        { name: 'badRequest', message: 'Invalid folder ID' },
        'Invalid folder ID provided',
      );
    }

    if (dto.name && dto.name.trim().length === 0) {
      return createErrorResult(
        { name: 'badRequest', message: 'Folder name cannot be empty' },
        'Folder name cannot be empty',
      );
    }

    // Single operation - use Prisma directly
    const data = await this.db.folder.update({
      where: { id },
      data: {
        ...dto,
        ...(dto.name && {
          slug: slugify(dto.name, {
            lower: true,
            strict: true,
          }),
        }),
      },
    });

    return createSuccessResult(data, 'Folder updated successfully');
  }

  async removeById(id: number): Promise<ServiceResult> {
    // Business logic validation
    if (!id || id <= 0) {
      return createErrorResult(
        { name: 'badRequest', message: 'Invalid folder ID' },
        'Invalid folder ID provided',
      );
    }

    // Single operation - use Prisma directly
    const data = await this.db.folder.delete({
      where: { id },
    });

    return createSuccessResult(data, 'Folder deleted successfully');
  }
}
