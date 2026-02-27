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
exports.PhotographerTypeController = void 0;
const common_1 = require("@nestjs/common");
const photographer_type_service_1 = require("./photographer-type.service");
const admin_log_service_1 = require("../admin/admin-log.service");
let PhotographerTypeController = class PhotographerTypeController {
    service;
    log;
    constructor(service, log) {
        this.service = service;
        this.log = log;
    }
    findAllMain() { return this.service.findAllMainTypes(); }
    async createMain(body, req) {
        const r = await this.service.createMainType(body);
        this.log.log(req.user?.id ?? 0, 'PHOTOGRAPHER_TYPE_CREATE', 'PhotographerMainType', r?.id, body?.name, req.ip).catch(() => { });
        return r;
    }
    async updateMain(id, body, req) {
        const r = await this.service.updateMainType(+id, body);
        this.log.log(req.user?.id ?? 0, 'PHOTOGRAPHER_TYPE_UPDATE', 'PhotographerMainType', +id, body?.name, req.ip).catch(() => { });
        return r;
    }
    async removeMain(id, req) {
        const r = await this.service.removeMainType(+id);
        this.log.log(req.user?.id ?? 0, 'PHOTOGRAPHER_TYPE_DELETE', 'PhotographerMainType', +id, undefined, req.ip).catch(() => { });
        return r;
    }
    findSub(mainTypeId) { return this.service.findSubTypesByMain(+mainTypeId); }
    async createSub(body, req) {
        const r = await this.service.createSubType(body);
        this.log.log(req.user?.id ?? 0, 'PHOTOGRAPHER_SUBTYPE_CREATE', 'PhotographerSubType', r?.id, body?.name, req.ip).catch(() => { });
        return r;
    }
    async updateSub(id, body, req) {
        const r = await this.service.updateSubType(+id, body);
        this.log.log(req.user?.id ?? 0, 'PHOTOGRAPHER_SUBTYPE_UPDATE', 'PhotographerSubType', +id, body?.name, req.ip).catch(() => { });
        return r;
    }
    async removeSub(id, req) {
        const r = await this.service.removeSubType(+id);
        this.log.log(req.user?.id ?? 0, 'PHOTOGRAPHER_SUBTYPE_DELETE', 'PhotographerSubType', +id, undefined, req.ip).catch(() => { });
        return r;
    }
};
exports.PhotographerTypeController = PhotographerTypeController;
__decorate([
    (0, common_1.Get)('main'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PhotographerTypeController.prototype, "findAllMain", null);
__decorate([
    (0, common_1.Post)('main'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PhotographerTypeController.prototype, "createMain", null);
__decorate([
    (0, common_1.Patch)('main/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], PhotographerTypeController.prototype, "updateMain", null);
__decorate([
    (0, common_1.Delete)('main/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PhotographerTypeController.prototype, "removeMain", null);
__decorate([
    (0, common_1.Get)('sub/:mainTypeId'),
    __param(0, (0, common_1.Param)('mainTypeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PhotographerTypeController.prototype, "findSub", null);
__decorate([
    (0, common_1.Post)('sub'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PhotographerTypeController.prototype, "createSub", null);
__decorate([
    (0, common_1.Patch)('sub/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], PhotographerTypeController.prototype, "updateSub", null);
__decorate([
    (0, common_1.Delete)('sub/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PhotographerTypeController.prototype, "removeSub", null);
exports.PhotographerTypeController = PhotographerTypeController = __decorate([
    (0, common_1.Controller)('photographer-types'),
    __metadata("design:paramtypes", [photographer_type_service_1.PhotographerTypeService,
        admin_log_service_1.AdminLogService])
], PhotographerTypeController);
//# sourceMappingURL=photographer-type.controller.js.map