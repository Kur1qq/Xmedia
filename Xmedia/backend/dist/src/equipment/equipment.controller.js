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
exports.EquipmentController = void 0;
const common_1 = require("@nestjs/common");
const equipment_service_1 = require("./equipment.service");
const admin_log_service_1 = require("../admin/admin-log.service");
let EquipmentController = class EquipmentController {
    equipmentService;
    log;
    constructor(equipmentService, log) {
        this.equipmentService = equipmentService;
        this.log = log;
    }
    async create(createData, req) {
        const result = await this.equipmentService.create(createData);
        this.log.log(req.user?.id ?? 0, 'EQUIPMENT_CREATE', 'Equipment', result?.id, createData.name, req.ip).catch(() => { });
        return result;
    }
    findAll() { return this.equipmentService.findAll(); }
    findOne(id) { return this.equipmentService.findOne(id); }
    async update(id, updateData, req) {
        const result = await this.equipmentService.update(id, updateData);
        this.log.log(req.user?.id ?? 0, 'EQUIPMENT_UPDATE', 'Equipment', id, updateData.name, req.ip).catch(() => { });
        return result;
    }
    async remove(id, req) {
        const result = await this.equipmentService.remove(id);
        this.log.log(req.user?.id ?? 0, 'EQUIPMENT_DELETE', 'Equipment', id, undefined, req.ip).catch(() => { });
        return result;
    }
};
exports.EquipmentController = EquipmentController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], EquipmentController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], EquipmentController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], EquipmentController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, Object]),
    __metadata("design:returntype", Promise)
], EquipmentController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], EquipmentController.prototype, "remove", null);
exports.EquipmentController = EquipmentController = __decorate([
    (0, common_1.Controller)('equipment'),
    __metadata("design:paramtypes", [equipment_service_1.EquipmentService,
        admin_log_service_1.AdminLogService])
], EquipmentController);
//# sourceMappingURL=equipment.controller.js.map