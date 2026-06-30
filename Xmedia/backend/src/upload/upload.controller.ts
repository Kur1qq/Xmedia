import { Controller, Post, UploadedFile, UseInterceptors, UseGuards, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { RolesGuard } from '../admin/jwt-auth.guard';
import { StorageService } from './storage.service';

@Controller('upload')
export class UploadController {
    constructor(private readonly storage: StorageService) { }

    @Post()
    @UseGuards(RolesGuard('SUPER_ADMIN', 'ADMIN', 'MODERATOR'))
    @UseInterceptors(FileInterceptor('file', {
        storage: memoryStorage(),
        limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limits for videos
        fileFilter: (req, file, cb) => {
            if (!file.mimetype.match(/^(image|video|application\/pdf)\//) && file.mimetype !== 'application/pdf') {
                return cb(new BadRequestException('Зөвхөн зураг, бичлэг эсвэл PDF (image/*, video/*, .pdf) upload хийнэ!'), false);
            }
            cb(null, true);
        },
    }))
    async uploadFile(@UploadedFile() file: Express.Multer.File) {
        if (!file) {
            return { error: 'No file uploaded' };
        }

        const { url } = await this.storage.uploadFile(file);
        return { url };
    }
}
