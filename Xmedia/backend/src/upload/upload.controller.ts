import { Controller, Post, UploadedFile, UseInterceptors, UseGuards, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { RolesGuard } from '../admin/jwt-auth.guard';

@Controller('upload')
export class UploadController {
    @Post()
    @UseGuards(RolesGuard('SUPER_ADMIN', 'ADMIN', 'MODERATOR'))
    @UseInterceptors(FileInterceptor('file', {
        storage: diskStorage({
            destination: './public/uploads',
            filename: (req, file, cb) => {
                const uniqueName = uuidv4() + extname(file.originalname);
                cb(null, uniqueName);
            }
        }),
        limits: { fileSize: 5 * 1024 * 1024 }, // 5MB хязгаар
        fileFilter: (req, file, cb) => {
            if (!file.mimetype.match(/^image\//)) {
                return cb(new BadRequestException('Зөвхөн зураг (image/*) upload хийнэ!'), false);
            }
            cb(null, true);
        },
    }))
    uploadFile(@UploadedFile() file: Express.Multer.File) {
        if (!file) {
            return { error: 'No file uploaded' };
        }
        const baseUrl = process.env.APP_URL || 'http://localhost:4000';
        return {
            url: `${baseUrl}/public/uploads/${file.filename}`
        };
    }
}
