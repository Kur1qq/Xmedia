import { Module } from '@nestjs/common';
import { UploadController } from './upload.controller';
import { AdminModule } from '../admin/admin.module';

@Module({
  imports: [AdminModule],
  controllers: [UploadController]
})
export class UploadModule { }
