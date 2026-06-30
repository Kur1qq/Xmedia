import { Module } from '@nestjs/common';
import { UploadController } from './upload.controller';
import { AdminModule } from '../admin/admin.module';
import { StorageService } from './storage.service';

@Module({
  imports: [AdminModule],
  controllers: [UploadController],
  providers: [StorageService],
  exports: [StorageService],
})
export class UploadModule { }
