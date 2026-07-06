import { createErrorResult, createSuccessResult, ServiceResult } from '@/common/interfaces';
import { DbService } from '@/db/db.service';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FileDto, UpdateFileDto } from './dto/index';

@Injectable()
export class FileService {
  @Inject()
  private readonly config: ConfigService;

  @Inject(DbService)
  private readonly db: DbService;

  async save(dto: FileDto): Promise<ServiceResult> {
    // Business logic validation
    if (!dto.folderId || typeof dto.folderId !== 'number' || dto.folderId <= 0) {
      return createErrorResult(
        { name: 'badRequest', message: 'Folder ID is required' },
        'Folder ID is required',
      );
    }

    if (!dto.name) {
      return createErrorResult(
        { name: 'badRequest', message: 'File name is required' },
        'File name is required',
      );
    }

    if (!dto.url) {
      return createErrorResult(
        { name: 'badRequest', message: 'File URL is required' },
        'File URL is required',
      );
    }

    // Check if folder exists first (business logic validation)
    const folder = await this.db.folder.findUnique({
      where: { id: dto.folderId },
    });

    // Business logic: check if folder exists
    if (!folder) {
      return createErrorResult(
        { name: 'badRequest', message: 'Folder not found' },
        'Folder not found',
      );
    }

    // Single operation - use Prisma directly
    const data = await this.db.file.create({
      data: {
        ...dto,
        folderId: dto.folderId,
        name: dto.name,
        url: dto.url,
      },
    });

    return createSuccessResult(data, 'File created successfully');
  }

  async getAll(folderId: number): Promise<ServiceResult> {
    // Business logic validation
    if (!folderId || folderId <= 0) {
      return createErrorResult(
        { name: 'badRequest', message: 'Invalid folder ID' },
        'Invalid folder ID provided',
      );
    }

    // Single operation - use Prisma directly
    const data = await this.db.file.findMany({
      where: { folderId },
      include: { folder: true },
    });

    return createSuccessResult(data, 'Files retrieved successfully');
  }

  async getById(id: number): Promise<ServiceResult> {
    // Business logic validation
    if (!id || id <= 0) {
      return createErrorResult(
        { name: 'badRequest', message: 'Invalid file ID' },
        'Invalid file ID provided',
      );
    }

    // Single operation - use Prisma directly
    const data = await this.db.file.findFirst({
      where: { id },
      include: { folder: true },
    });

    // Business logic: check if file exists
    if (!data) {
      return createErrorResult({ name: 'badRequest', message: 'File not found' }, 'File not found');
    }

    return createSuccessResult(data, 'File retrieved successfully');
  }

  async editById(id: number, dto: UpdateFileDto): Promise<ServiceResult> {
    // Business logic validation
    if (!id || id <= 0) {
      return createErrorResult(
        { name: 'badRequest', message: 'Invalid file ID' },
        'Invalid file ID provided',
      );
    }

    if (!dto || Object.keys(dto).length === 0) {
      return createErrorResult(
        { name: 'badRequest', message: 'No update data provided' },
        'At least one field is required to update the file',
      );
    }

    if (dto.folderId !== undefined && dto.folderId <= 0) {
      return createErrorResult(
        { name: 'badRequest', message: 'Invalid folder ID' },
        'Invalid folder ID provided',
      );
    }

    const existingFile = await this.db.file.findFirst({
      where: { id },
      include: { folder: true },
    });

    // Business logic: check if file exists
    if (!existingFile) {
      return createErrorResult({ name: 'badRequest', message: 'File not found' }, 'File not found');
    }

    if (dto.folderId !== undefined) {
      const folder = await this.db.folder.findUnique({
        where: { id: dto.folderId },
      });

      if (!folder) {
        return createErrorResult(
          { name: 'badRequest', message: 'Folder not found' },
          'Folder not found',
        );
      }
    }

    const data = await this.db.file.update({
      where: { id },
      data: {
        ...dto,
      },
      include: { folder: true },
    });

    return createSuccessResult(data, 'File updated successfully');
  }

  async removeById(id: number): Promise<ServiceResult> {
    // Business logic validation
    if (!id || id <= 0) {
      return createErrorResult(
        { name: 'badRequest', message: 'Invalid file ID' },
        'Invalid file ID provided',
      );
    }

    // Single operation - use Prisma directly
    const file = await this.db.file.findFirst({ where: { id } });

    // Business logic: check if file exists
    if (!file) {
      return createErrorResult({ name: 'badRequest', message: 'File not found' }, 'File not found');
    }

    const folder = await this.db.folder.findFirst({ where: { id: file.folderId } });

    if (!folder) {
      return createErrorResult(
        { name: 'badRequest', message: 'Folder not found' },
        'Folder not found',
      );
    }

    // Delete from database (let errors bubble up)
    await this.db.file.delete({ where: { id } });

    return createSuccessResult(null, 'File deleted successfully');
  }
}
