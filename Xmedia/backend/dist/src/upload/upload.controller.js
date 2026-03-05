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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const path_1 = require("path");
const uuid_1 = require("uuid");
const jwt_auth_guard_1 = require("../admin/jwt-auth.guard");
let UploadController = class UploadController {
    uploadFile(file, req) {
        if (!file) {
            return { error: 'No file uploaded' };
        }
        let baseUrl = '';
        if (process.env.RAILWAY_PUBLIC_DOMAIN) {
            baseUrl = `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`;
        }
        else if (process.env.APP_URL && !process.env.APP_URL.includes('localhost')) {
            baseUrl = process.env.APP_URL.replace(/['"]+/g, '');
            if (baseUrl.endsWith('/'))
                baseUrl = baseUrl.slice(0, -1);
        }
        else {
            const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'http';
            const host = req.headers['x-forwarded-host'] || req.get('host') || 'localhost:4000';
            if (host.includes('localhost') && process.env.NODE_ENV === 'production') {
                baseUrl = 'https://xmedia-production.up.railway.app';
            }
            else {
                baseUrl = `${protocol}://${host}`;
            }
        }
        return {
            url: `${baseUrl}/public/uploads/${file.filename}`
        };
    }
};
exports.UploadController = UploadController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)((0, jwt_auth_guard_1.RolesGuard)('SUPER_ADMIN', 'ADMIN', 'MODERATOR')),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: (0, multer_1.diskStorage)({
            destination: './public/uploads',
            filename: (req, file, cb) => {
                const uniqueName = (0, uuid_1.v4)() + (0, path_1.extname)(file.originalname);
                cb(null, uniqueName);
            }
        }),
        limits: { fileSize: 5 * 1024 * 1024 },
        fileFilter: (req, file, cb) => {
            if (!file.mimetype.match(/^image\//)) {
                return cb(new common_1.BadRequestException('Зөвхөн зураг (image/*) upload хийнэ!'), false);
            }
            cb(null, true);
        },
    })),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], UploadController.prototype, "uploadFile", null);
exports.UploadController = UploadController = __decorate([
    (0, common_1.Controller)('upload')
], UploadController);
//# sourceMappingURL=upload.controller.js.map