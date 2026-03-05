import { Module } from '@nestjs/common';
import { UploadController } from './upload.controller';
import { AdminModule } from '../admin/admin.module';
import { CloudinaryService } from './cloudinary.service';

@Module({
  imports: [AdminModule],
  controllers: [UploadController],
  providers: [CloudinaryService],
  exports: [CloudinaryService],
})
export class UploadModule { }
