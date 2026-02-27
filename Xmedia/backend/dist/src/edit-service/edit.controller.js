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
exports.EditServiceController = exports.EditTypeController = void 0;
const common_1 = require("@nestjs/common");
const edit_type_service_1 = require("./edit-type.service");
const edit_service_service_1 = require("./edit-service.service");
const admin_log_service_1 = require("../admin/admin-log.service");
let EditTypeController = class EditTypeController {
    editTypeService;
    log;
    constructor(editTypeService, log) {
        this.editTypeService = editTypeService;
        this.log = log;
    }
    findAllMain() { return this.editTypeService.findAllMainTypes(); }
    async createMain(body, req) {
        const r = await this.editTypeService.createMainType(body);
        this.log.log(req.user?.id ?? 0, 'EDIT_TYPE_CREATE', 'EditMainType', r?.id, body?.name, req.ip).catch(() => { });
        return r;
    }
    async updateMain(id, body, req) {
        const r = await this.editTypeService.updateMainType(+id, body);
        this.log.log(req.user?.id ?? 0, 'EDIT_TYPE_UPDATE', 'EditMainType', +id, body?.name, req.ip).catch(() => { });
        return r;
    }
    async removeMain(id, req) {
        const r = await this.editTypeService.removeMainType(+id);
        this.log.log(req.user?.id ?? 0, 'EDIT_TYPE_DELETE', 'EditMainType', +id, undefined, req.ip).catch(() => { });
        return r;
    }
    async createSub(body, req) {
        const r = await this.editTypeService.createSubType(body);
        this.log.log(req.user?.id ?? 0, 'EDIT_SUBTYPE_CREATE', 'EditSubType', r?.id, body?.name, req.ip).catch(() => { });
        return r;
    }
    async updateSub(id, body, req) {
        const r = await this.editTypeService.updateSubType(+id, body);
        this.log.log(req.user?.id ?? 0, 'EDIT_SUBTYPE_UPDATE', 'EditSubType', +id, body?.name, req.ip).catch(() => { });
        return r;
    }
    async removeSub(id, req) {
        const r = await this.editTypeService.removeSubType(+id);
        this.log.log(req.user?.id ?? 0, 'EDIT_SUBTYPE_DELETE', 'EditSubType', +id, undefined, req.ip).catch(() => { });
        return r;
    }
};
exports.EditTypeController = EditTypeController;
__decorate([
    (0, common_1.Get)('main'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], EditTypeController.prototype, "findAllMain", null);
__decorate([
    (0, common_1.Post)('main'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], EditTypeController.prototype, "createMain", null);
__decorate([
    (0, common_1.Patch)('main/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], EditTypeController.prototype, "updateMain", null);
__decorate([
    (0, common_1.Delete)('main/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], EditTypeController.prototype, "removeMain", null);
__decorate([
    (0, common_1.Post)('sub'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], EditTypeController.prototype, "createSub", null);
__decorate([
    (0, common_1.Patch)('sub/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], EditTypeController.prototype, "updateSub", null);
__decorate([
    (0, common_1.Delete)('sub/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], EditTypeController.prototype, "removeSub", null);
exports.EditTypeController = EditTypeController = __decorate([
    (0, common_1.Controller)('edit-types'),
    __metadata("design:paramtypes", [edit_type_service_1.EditTypeService,
        admin_log_service_1.AdminLogService])
], EditTypeController);
let EditServiceController = class EditServiceController {
    editServiceService;
    log;
    constructor(editServiceService, log) {
        this.editServiceService = editServiceService;
        this.log = log;
    }
    findAll() { return this.editServiceService.findAll(); }
    findOne(id) { return this.editServiceService.findOne(+id); }
    async create(body, req) {
        const r = await this.editServiceService.create(body);
        this.log.log(req.user?.id ?? 0, 'EDIT_SERVICE_CREATE', 'EditService', r?.id, body?.name, req.ip).catch(() => { });
        return r;
    }
    async update(id, body, req) {
        const r = await this.editServiceService.update(+id, body);
        this.log.log(req.user?.id ?? 0, 'EDIT_SERVICE_UPDATE', 'EditService', +id, body?.name, req.ip).catch(() => { });
        return r;
    }
    async remove(id, req) {
        const r = await this.editServiceService.remove(+id);
        this.log.log(req.user?.id ?? 0, 'EDIT_SERVICE_DELETE', 'EditService', +id, undefined, req.ip).catch(() => { });
        return r;
    }
};
exports.EditServiceController = EditServiceController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], EditServiceController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], EditServiceController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], EditServiceController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], EditServiceController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], EditServiceController.prototype, "remove", null);
exports.EditServiceController = EditServiceController = __decorate([
    (0, common_1.Controller)('edit-services'),
    __metadata("design:paramtypes", [edit_service_service_1.EditServiceService,
        admin_log_service_1.AdminLogService])
], EditServiceController);
//# sourceMappingURL=edit.controller.js.map