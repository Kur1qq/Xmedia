import { Injectable, Logger } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';

@Injectable()
export class CloudinaryService {
    private readonly logger = new Logger(CloudinaryService.name);

    constructor() {
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
        });
        this.logger.log(`Cloudinary configured: cloud=${process.env.CLOUDINARY_CLOUD_NAME}`);
    }

    async uploadFile(file: Express.Multer.File): Promise<UploadApiResponse> {
        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: 'xmedia',
                    resource_type: 'image',
                },
                (error, result) => {
                    if (error || !result) {
                        this.logger.error(`Cloudinary upload failed: ${error?.message || 'Unknown error'}`);
                        return reject(error || new Error('Upload returned no result'));
                    }
                    this.logger.log(`Cloudinary upload success: ${result.secure_url}`);
                    resolve(result);
                },
            );
            uploadStream.end(file.buffer);
        });
    }
}
