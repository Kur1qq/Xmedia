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
exports.AdminLogService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
let AdminLogService = class AdminLogService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async log(adminId, action, entity, entityId, detail, ip) {
        let resolvedId = adminId && adminId > 0 ? adminId : null;
        if (!resolvedId) {
            const first = await this.prisma.admin.findFirst({ where: { role: 'SUPER_ADMIN' }, select: { id: true } });
            if (!first)
                return;
            resolvedId = first.id;
        }
        return this.prisma.adminLog.create({
            data: { adminId: resolvedId, action, entity, entityId, detail, ip },
        });
    }
    async findAll(opts) {
        const where = {};
        if (opts?.adminId)
            where.adminId = opts.adminId;
        return this.prisma.adminLog.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: opts?.limit || 100,
            skip: opts?.offset || 0,
            include: { admin: { select: { id: true, username: true, image: true, role: true } } },
        });
    }
    async count(adminId) {
        return this.prisma.adminLog.count({ where: adminId ? { adminId } : undefined });
    }
};
exports.AdminLogService = AdminLogService;
exports.AdminLogService = AdminLogService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AdminLogService);
//# sourceMappingURL=admin-log.service.js.map