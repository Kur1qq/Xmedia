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
const admin_notification_service_1 = require("./admin-notification.service");
let AdminController = class AdminController {
    adminService;
    adminLogService;
    adminNotificationService;
    constructor(adminService, adminLogService, adminNotificationService) {
        this.adminService = adminService;
        this.adminLogService = adminLogService;
        this.adminNotificationService = adminNotificationService;
    }
    async login(body, req) {
        try {
            const result = await this.adminService.login(body.username, body.password);
            try {
                await this.adminLogService.log(result.admin.id, 'LOGIN', 'Admin', result.admin.id, undefined, req.ip);
            }
            catch (logErr) {
                console.error('Login log failed:', logErr);
            }
            return result;
        }
        catch (err) {
            console.error('Login error:', err);
            throw err;
        }
    }
    async getLogs(page, limit, adminId, action, startDate, endDate) {
        return this.adminLogService.findAll({
            limit,
            adminId: adminId ? parseInt(adminId, 10) : undefined,
        });
    }
    async getNotifications() {
        return this.adminNotificationService.getNotifications();
    }
    async markAllNotificationsAsRead() {
        return this.adminNotificationService.markAllAsRead();
    }
    async markNotificationAsRead(id) {
        return this.adminNotificationService.markAsRead(id);
    }
    getRoles() { return this.adminService.findAllRoles(); }
    async createRole(body, req) {
        const result = await this.adminService.createRole(body);
        await this.adminLogService.log(req.user?.id, 'ROLE_CREATE', 'AdminPermissionRole', result.id, `name=${result.name}`, req.ip);
        return result;
    }
    async updateRole(id, body, req) {
        const result = await this.adminService.updateRole(+id, body);
        await this.adminLogService.log(req.user?.id, 'ROLE_UPDATE', 'AdminPermissionRole', +id, `name=${result.name}`, req.ip);
        return result;
    }
    async removeRole(id, req) {
        const result = await this.adminService.removeRole(+id);
        await this.adminLogService.log(req.user?.id, 'ROLE_DELETE', 'AdminPermissionRole', +id, undefined, req.ip);
        return result;
    }
    findAll() { return this.adminService.findAll(); }
    findOne(id) { return this.adminService.findOne(+id); }
    async create(body, req) {
        const result = await this.adminService.create(body);
        await this.adminLogService.log(req.admin.id, 'CREATE', 'AdminUser', result.id, `Created ${result.username}`, req.ip);
        return result;
    }
    async update(id, body, req) {
        const result = await this.adminService.update(+id, body);
        await this.adminLogService.log(req.admin.id, 'UPDATE', 'Admin', +id, undefined, req.ip);
        return result;
    }
    async remove(id, req) {
        const result = await this.adminService.remove(+id);
        await this.adminLogService.log(req.admin.id, 'DELETE', 'Admin', +id, undefined, req.ip);
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
    __param(0, (0, common_1.Query)('page', new common_1.DefaultValuePipe(1), common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)('limit', new common_1.DefaultValuePipe(10), common_1.ParseIntPipe)),
    __param(2, (0, common_1.Query)('adminId')),
    __param(3, (0, common_1.Query)('action')),
    __param(4, (0, common_1.Query)('startDate')),
    __param(5, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, String, String, String, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getLogs", null);
__decorate([
    (0, common_1.UseGuards)((0, jwt_auth_guard_1.RolesGuard)('SUPER_ADMIN', 'ADMIN')),
    (0, common_1.Get)('notifications'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getNotifications", null);
__decorate([
    (0, common_1.UseGuards)((0, jwt_auth_guard_1.RolesGuard)('SUPER_ADMIN', 'ADMIN')),
    (0, common_1.Patch)('notifications/read-all'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "markAllNotificationsAsRead", null);
__decorate([
    (0, common_1.UseGuards)((0, jwt_auth_guard_1.RolesGuard)('SUPER_ADMIN', 'ADMIN')),
    (0, common_1.Patch)('notifications/:id/read'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "markNotificationAsRead", null);
__decorate([
    (0, common_1.UseGuards)((0, jwt_auth_guard_1.RolesGuard)('SUPER_ADMIN', 'ADMIN')),
    (0, common_1.Get)('roles'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getRoles", null);
__decorate([
    (0, common_1.UseGuards)((0, jwt_auth_guard_1.RolesGuard)('SUPER_ADMIN')),
    (0, common_1.Post)('roles'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "createRole", null);
__decorate([
    (0, common_1.UseGuards)((0, jwt_auth_guard_1.RolesGuard)('SUPER_ADMIN')),
    (0, common_1.Patch)('roles/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updateRole", null);
__decorate([
    (0, common_1.UseGuards)((0, jwt_auth_guard_1.RolesGuard)('SUPER_ADMIN')),
    (0, common_1.Delete)('roles/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "removeRole", null);
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
        admin_log_service_1.AdminLogService,
        admin_notification_service_1.AdminNotificationService])
], AdminController);
//# sourceMappingURL=admin.controller.js.map