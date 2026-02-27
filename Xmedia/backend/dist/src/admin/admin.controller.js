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
exports.AdminController = void 0;
const common_1 = require("@nestjs/common");
const admin_service_1 = require("./admin.service");
const admin_log_service_1 = require("./admin-log.service");
const jwt_auth_guard_1 = require("./jwt-auth.guard");
let AdminController = class AdminController {
    adminService;
    logService;
    constructor(adminService, logService) {
        this.adminService = adminService;
        this.logService = logService;
    }
    async login(body, req) {
        const result = await this.adminService.login(body.username, body.password);
        await this.logService.log(result.admin.id, 'LOGIN', 'Admin', result.admin.id, undefined, req.ip);
        return result;
    }
    getLogs(adminId, limit, offset) {
        return this.logService.findAll({
            adminId: adminId ? parseInt(adminId) : undefined,
            limit: limit ? parseInt(limit) : 100,
            offset: offset ? parseInt(offset) : 0,
        });
    }
    findAll() { return this.adminService.findAll(); }
    findOne(id) { return this.adminService.findOne(+id); }
    async create(body, req) {
        const result = await this.adminService.create(body);
        await this.logService.log(req.user?.id, 'ADMIN_CREATE', 'Admin', result.id, `username=${result.username}`, req.ip);
        return result;
    }
    async update(id, body, req) {
        const result = await this.adminService.update(+id, body);
        await this.logService.log(req.user?.id, 'ADMIN_UPDATE', 'Admin', +id, undefined, req.ip);
        return result;
    }
    async remove(id, req) {
        const result = await this.adminService.remove(+id);
        await this.logService.log(req.user?.id, 'ADMIN_DELETE', 'Admin', +id, undefined, req.ip);
        return result;
    }
};
exports.AdminController = AdminController;
__decorate([
    (0, common_1.Post)('login'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "login", null);
__decorate([
    (0, common_1.UseGuards)((0, jwt_auth_guard_1.RolesGuard)('SUPER_ADMIN', 'ADMIN')),
    (0, common_1.Get)('logs'),
    __param(0, (0, common_1.Query)('adminId')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('offset')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getLogs", null);
__decorate([
    (0, common_1.UseGuards)((0, jwt_auth_guard_1.RolesGuard)('SUPER_ADMIN', 'ADMIN')),
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "findAll", null);
__decorate([
    (0, common_1.UseGuards)((0, jwt_auth_guard_1.RolesGuard)('SUPER_ADMIN', 'ADMIN')),
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "findOne", null);
__decorate([
    (0, common_1.UseGuards)((0, jwt_auth_guard_1.RolesGuard)('SUPER_ADMIN')),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "create", null);
__decorate([
    (0, common_1.UseGuards)((0, jwt_auth_guard_1.RolesGuard)('SUPER_ADMIN')),
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "update", null);
__decorate([
    (0, common_1.UseGuards)((0, jwt_auth_guard_1.RolesGuard)('SUPER_ADMIN')),
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "remove", null);
exports.AdminController = AdminController = __decorate([
    (0, common_1.Controller)('admin'),
    __metadata("design:paramtypes", [admin_service_1.AdminService,
        admin_log_service_1.AdminLogService])
], AdminController);
//# sourceMappingURL=admin.controller.js.map