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
var CloudinaryService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CloudinaryService = void 0;
const common_1 = require("@nestjs/common");
const cloudinary_1 = require("cloudinary");
let CloudinaryService = CloudinaryService_1 = class CloudinaryService {
    logger = new common_1.Logger(CloudinaryService_1.name);
    constructor() {
        cloudinary_1.v2.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
        });
        this.logger.log(`Cloudinary configured: cloud=${process.env.CLOUDINARY_CLOUD_NAME}`);
    }
    async uploadFile(file) {
        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary_1.v2.uploader.upload_chunked_stream({
                folder: 'xmedia',
                resource_type: 'auto',
                chunk_size: 6048576,
            }, (error, result) => {
                if (error || !result) {
                    this.logger.error(`Cloudinary upload failed: ${error?.message || 'Unknown error'}`);
                    return reject(error || new Error('Upload returned no result'));
                }
                this.logger.log(`Cloudinary upload success: ${result.secure_url}`);
                resolve(result);
            });
            uploadStream.end(file.buffer);
        });
    }
};
exports.CloudinaryService = CloudinaryService;
exports.CloudinaryService = CloudinaryService = CloudinaryService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], CloudinaryService);
//# sourceMappingURL=cloudinary.service.js.map