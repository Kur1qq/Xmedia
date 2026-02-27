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
exports.PhotographerServiceController = void 0;
const common_1 = require("@nestjs/common");
const photographer_service_service_1 = require("./photographer-service.service");
const admin_log_service_1 = require("../admin/admin-log.service");
let PhotographerServiceController = class PhotographerServiceController {
    photographerServiceService;
    log;
    constructor(photographerServiceService, log) {
        this.photographerServiceService = photographerServiceService;
        this.log = log;
    }
    async create(body, req) {
        const result = await this.photographerServiceService.create(body);
        this.log.log(req.user?.id ?? 0, 'PHOTOGRAPHER_SERVICE_CREATE', 'PhotographerService', result?.id, body?.name, req.ip).catch(() => { });
        return result;
    }
    findAll() { return this.photographerServiceService.findAll(); }
    findOne(id) { return this.photographerServiceService.findOne(+id); }
    async update(id, body, req) {
        const result = await this.photographerServiceService.update(+id, body);
        this.log.log(req.user?.id ?? 0, 'PHOTOGRAPHER_SERVICE_UPDATE', 'PhotographerService', +id, body?.name, req.ip).catch(() => { });
        return result;
    }
    async remove(id, req) {
        const result = await this.photographerServiceService.remove(+id);
        this.log.log(req.user?.id ?? 0, 'PHOTOGRAPHER_SERVICE_DELETE', 'PhotographerService', +id, undefined, req.ip).catch(() => { });
        return result;
    }
};
exports.PhotographerServiceController = PhotographerServiceController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PhotographerServiceController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PhotographerServiceController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PhotographerServiceController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], PhotographerServiceController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PhotographerServiceController.prototype, "remove", null);
exports.PhotographerServiceController = PhotographerServiceController = __decorate([
    (0, common_1.Controller)('photographer-services'),
    __metadata("design:paramtypes", [photographer_service_service_1.PhotographerServiceService,
        admin_log_service_1.AdminLogService])
], PhotographerServiceController);
//# sourceMappingURL=photographer-service.controller.js.map