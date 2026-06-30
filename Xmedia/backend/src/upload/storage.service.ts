import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class StorageService {
    private readonly logger = new Logger(StorageService.name);
    private readonly client: S3Client;
    private readonly bucket = process.env.R2_BUCKET ?? '';
    // Public base URL of the bucket (r2.dev address or a custom domain), no trailing slash.
    private readonly publicUrl = (process.env.R2_PUBLIC_URL ?? '').replace(/\/+$/, '');

    constructor() {
        this.client = new S3Client({
            region: 'auto',
            endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
            credentials: {
                accessKeyId: process.env.R2_ACCESS_KEY_ID ?? '',
                secretAccessKey: process.env.R2_SECRET_ACCESS_KEY ?? '',
            },
        });
        this.logger.log(`R2 storage configured: bucket=${this.bucket}`);
    }

    async uploadFile(file: Express.Multer.File): Promise<{ url: string }> {
        if (!this.bucket || !this.publicUrl) {
            throw new InternalServerErrorException(
                'R2 storage is not configured (R2_BUCKET / R2_PUBLIC_URL missing)',
            );
        }

        const ext = extname(file.originalname) || this.extFromMime(file.mimetype);
        const key = `xmedia/${uuidv4()}${ext}`;

        try {
            await this.client.send(
                new PutObjectCommand({
                    Bucket: this.bucket,
                    Key: key,
                    Body: file.buffer,
                    ContentType: file.mimetype,
                    CacheControl: 'public, max-age=31536000, immutable',
                }),
            );
            const url = `${this.publicUrl}/${key}`;
            this.logger.log(`R2 upload success: ${url}`);
            return { url };
        } catch (error) {
            this.logger.error(`R2 upload failed: ${error?.message || 'Unknown error'}`);
            throw new InternalServerErrorException('File upload failed');
        }
    }

    // Fallback extension when the original filename has none (e.g. blobs from the browser).
    private extFromMime(mime: string): string {
        const map: Record<string, string> = {
            'image/jpeg': '.jpg',
            'image/png': '.png',
            'image/webp': '.webp',
            'image/gif': '.gif',
            'image/svg+xml': '.svg',
            'video/mp4': '.mp4',
            'video/quicktime': '.mov',
            'video/webm': '.webm',
            'application/pdf': '.pdf',
        };
        return map[mime] ?? '';
    }
}
