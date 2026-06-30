"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var StorageService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.StorageService = void 0;
const common_1 = require("@nestjs/common");
const client_s3_1 = require("@aws-sdk/client-s3");
const path_1 = require("path");
const uuid_1 = require("uuid");
let StorageService = StorageService_1 = class StorageService {
    logger = new common_1.Logger(StorageService_1.name);
    client;
    bucket = process.env.R2_BUCKET ?? '';
    publicUrl = (process.env.R2_PUBLIC_URL ?? '').replace(/\/+$/, '');
    constructor() {
        this.client = new client_s3_1.S3Client({
            region: 'auto',
            endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
            credentials: {
                accessKeyId: process.env.R2_ACCESS_KEY_ID ?? '',
                secretAccessKey: process.env.R2_SECRET_ACCESS_KEY ?? '',
            },
        });
        this.logger.log(`R2 storage configured: bucket=${this.bucket}`);
    }
    async uploadFile(file) {
        if (!this.bucket || !this.publicUrl) {
            throw new common_1.InternalServerErrorException('R2 storage is not configured (R2_BUCKET / R2_PUBLIC_URL missing)');
        }
        const ext = (0, path_1.extname)(file.originalname) || this.extFromMime(file.mimetype);
        const key = `xmedia/${(0, uuid_1.v4)()}${ext}`;
        try {
            await this.client.send(new client_s3_1.PutObjectCommand({
                Bucket: this.bucket,
                Key: key,
                Body: file.buffer,
                ContentType: file.mimetype,
                CacheControl: 'public, max-age=31536000, immutable',
            }));
            const url = `${this.publicUrl}/${key}`;
            this.logger.log(`R2 upload success: ${url}`);
            return { url };
        }
        catch (error) {
            this.logger.error(`R2 upload failed: ${error?.message || 'Unknown error'}`);
            throw new common_1.InternalServerErrorException('File upload failed');
        }
    }
    extFromMime(mime) {
        const map = {
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
};
exports.StorageService = StorageService;
exports.StorageService = StorageService = StorageService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], StorageService);
//# sourceMappingURL=storage.service.js.map