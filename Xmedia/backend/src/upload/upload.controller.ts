import { Controller, Post, UploadedFile, UseInterceptors, UseGuards, BadRequestException, Req } from '@nestjs/common';
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
    uploadFile(@UploadedFile() file: Express.Multer.File, @Req() req: any) {
        if (!file) {
            return { error: 'No file uploaded' };
        }

        // Remove accidental quotes from APP_URL if it was set like APP_URL="http://..."
        let baseUrl = process.env.APP_URL;
        if (baseUrl) {
            baseUrl = baseUrl.replace(/['"]+/g, '');
            if (baseUrl.endsWith('/')) baseUrl = baseUrl.slice(0, -1);
        } else {
            const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'http';
            const host = req.get('host') || 'localhost:4000';
            baseUrl = `${protocol}://${host}`;
        }

        return {
            url: `${baseUrl}/public/uploads/${file.filename}`
        };
    }
}
