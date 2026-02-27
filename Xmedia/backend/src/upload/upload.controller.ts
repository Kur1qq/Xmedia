import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';

@Controller('upload')
export class UploadController {
    @Post()
    @UseInterceptors(FileInterceptor('file', {
        storage: diskStorage({
            destination: './public/uploads',
            filename: (req, file, cb) => {
                const uniqueName = uuidv4() + extname(file.originalname);
                cb(null, uniqueName);
            }
        })
    }))
    uploadFile(@UploadedFile() file: Express.Multer.File) {
        if (!file) {
            return { error: 'No file uploaded' };
        }
        // Return the URL to access the uploaded file
        return {
            url: `http://localhost:4000/public/uploads/${file.filename}`
        };
    }
}
