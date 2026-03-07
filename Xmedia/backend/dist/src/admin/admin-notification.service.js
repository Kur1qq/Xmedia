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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminNotificationService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
let AdminNotificationService = class AdminNotificationService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getNotifications() {
        return this.prisma.adminNotification.findMany({
            orderBy: { createdAt: 'desc' },
            take: 50,
        });
    }
    async createNotification(type, message, referenceId) {
        return this.prisma.adminNotification.create({
            data: {
                type,
                message,
                referenceId,
                isRead: false,
            }
        });
    }
    async markAsRead(id) {
        const notification = await this.prisma.adminNotification.findUnique({ where: { id } });
        if (!notification) {
            throw new common_1.NotFoundException(`Notification with ID ${id} not found`);
        }
        return this.prisma.adminNotification.update({
            where: { id },
            data: { isRead: true }
        });
    }
    async markAllAsRead() {
        return this.prisma.adminNotification.updateMany({
            where: { isRead: false },
            data: { isRead: true }
        });
    }
};
exports.AdminNotificationService = AdminNotificationService;
exports.AdminNotificationService = AdminNotificationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AdminNotificationService);
//# sourceMappingURL=admin-notification.service.js.map