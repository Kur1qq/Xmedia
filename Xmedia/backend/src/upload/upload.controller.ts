import { Controller, Post, UploadedFile, UseInterceptors, UseGuards, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { RolesGuard } from '../admin/jwt-auth.guard';
import { CloudinaryService } from './cloudinary.service';

@Controller('upload')
export class UploadController {
    constructor(private readonly cloudinary: CloudinaryService) { }

    @Post()
    @UseGuards(RolesGuard('SUPER_ADMIN', 'ADMIN', 'MODERATOR'))
    @UseInterceptors(FileInterceptor('file', {
        storage: memoryStorage(),
        limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
        fileFilter: (req, file, cb) => {
            if (!file.mimetype.match(/^image\//)) {
                return cb(new BadRequestException('Зөвхөн зураг (image/*) upload хийнэ!'), false);
            }
            cb(null, true);
        },
    }))
    async uploadFile(@UploadedFile() file: Express.Multer.File) {
        if (!file) {
            return { error: 'No file uploaded' };
        }

        const result = await this.cloudinary.uploadFile(file);
        return { url: result.secure_url };
    }
}
