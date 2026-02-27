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
exports.StudioController = void 0;
const common_1 = require("@nestjs/common");
const studio_service_1 = require("./studio.service");
const admin_log_service_1 = require("../admin/admin-log.service");
let StudioController = class StudioController {
    studioService;
    log;
    constructor(studioService, log) {
        this.studioService = studioService;
        this.log = log;
    }
    async create(dto, req) {
        const result = await this.studioService.create(dto);
        this.log.log(req.user?.id ?? 0, 'STUDIO_CREATE', 'Studio', result?.id, result?.name, req.ip).catch(() => { });
        return result;
    }
    findAll() { return this.studioService.findAll(); }
    findOne(id) { return this.studioService.findOne(+id); }
    async update(id, dto, req) {
        const result = await this.studioService.update(+id, dto);
        this.log.log(req.user?.id ?? 0, 'STUDIO_UPDATE', 'Studio', +id, dto?.name, req.ip).catch(() => { });
        return result;
    }
    async remove(id, req) {
        const result = await this.studioService.remove(+id);
        this.log.log(req.user?.id ?? 0, 'STUDIO_DELETE', 'Studio', +id, undefined, req.ip).catch(() => { });
        return result;
    }
};
exports.StudioController = StudioController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], StudioController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], StudioController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], StudioController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], StudioController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], StudioController.prototype, "remove", null);
exports.StudioController = StudioController = __decorate([
    (0, common_1.Controller)('studio'),
    __metadata("design:paramtypes", [studio_service_1.StudioService,
        admin_log_service_1.AdminLogService])
], StudioController);
//# sourceMappingURL=studio.controller.js.map