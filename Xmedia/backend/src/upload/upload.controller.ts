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

        let baseUrl = '';

        // 1. Check Railway's automatic public domain first
        if (process.env.RAILWAY_PUBLIC_DOMAIN) {
            baseUrl = `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`;
        }
        // 2. Fallback to manually configured APP_URL but ignore localhost in prod
        else if (process.env.APP_URL && !process.env.APP_URL.includes('localhost')) {
            baseUrl = process.env.APP_URL.replace(/['"]+/g, '');
            if (baseUrl.endsWith('/')) baseUrl = baseUrl.slice(0, -1);
        }
        // 3. Fallback to request host headers 
        else {
            const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'http';
            const host = req.headers['x-forwarded-host'] || req.get('host') || 'localhost:4000';

            // Hardcode fallback if somehow still localhost on prod
            if (host.includes('localhost') && process.env.NODE_ENV === 'production') {
                baseUrl = 'https://xmedia-production.up.railway.app';
            } else {
                baseUrl = `${protocol}://${host}`;
            }
        }

        return {
            url: `${baseUrl}/public/uploads/${file.filename}`
        };
    }
}
