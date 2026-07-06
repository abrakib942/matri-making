import { FolderController } from './folder.controller';
import { FolderService } from './folder.service';
import { FileController } from './file/file.controller';
import { FileService } from './file/file.service';

// System imports
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  controllers: [FolderController, FileController],
  providers: [FolderService, FileService],
})
export class FolderModule {}
