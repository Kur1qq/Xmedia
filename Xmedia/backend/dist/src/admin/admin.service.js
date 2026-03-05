"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = __importStar(require("bcrypt"));
let AdminService = class AdminService {
    prisma;
    jwt;
    constructor(prisma, jwt) {
        this.prisma = prisma;
        this.jwt = jwt;
    }
    async login(username, password) {
        const admin = await this.prisma.admin.findUnique({
            where: { username },
            include: { customRole: true },
        });
        if (!admin || !admin.isActive)
            throw new common_1.UnauthorizedException('Нэвтрэх нэр эсвэл нууц үг буруу байна.');
        const valid = await bcrypt.compare(password, admin.password);
        if (!valid)
            throw new common_1.UnauthorizedException('Нэвтрэх нэр эсвэл нууц үг буруу байна.');
        const token = this.jwt.sign({ sub: admin.id, username: admin.username, role: admin.role });
        return {
            token,
            admin: {
                id: admin.id,
                username: admin.username,
                image: admin.image,
                role: admin.role,
                customRoleId: admin.customRoleId,
                customRole: admin.customRole
                    ? { id: admin.customRole.id, name: admin.customRole.name, permissions: admin.customRole.permissions }
                    : null,
            },
        };
    }
    async findAll() {
        return this.prisma.admin.findMany({
            orderBy: { createdAt: 'asc' },
            select: {
                id: true, username: true, image: true, role: true,
                customRoleId: true,
                customRole: { select: { id: true, name: true, permissions: true } },
                isActive: true, createdAt: true,
            },
        });
    }
    async findOne(id) {
        const admin = await this.prisma.admin.findUnique({
            where: { id },
            select: {
                id: true, username: true, image: true, role: true,
                customRoleId: true,
                customRole: { select: { id: true, name: true, permissions: true } },
                isActive: true, createdAt: true,
            },
        });
        if (!admin)
            throw new common_1.NotFoundException('Админ олдсонгүй.');
        return admin;
    }
    async create(data) {
        const exists = await this.prisma.admin.findUnique({ where: { username: data.username } });
        if (exists)
            throw new common_1.ConflictException('Тухайн нэвтрэх нэр аль хэдийн бүртгэлтэй байна.');
        const hash = await bcrypt.hash(data.password, 12);
        return this.prisma.admin.create({
            data: {
                username: data.username, password: hash,
                role: data.role || 'ADMIN',
                image: data.image,
                customRoleId: data.customRoleId || null,
            },
            select: {
                id: true, username: true, image: true, role: true,
                customRoleId: true,
                customRole: { select: { id: true, name: true, permissions: true } },
                isActive: true, createdAt: true,
            },
        });
    }
    async update(id, data) {
        await this.findOne(id);
        const updateData = { ...data };
        if (data.password) {
            updateData.password = await bcrypt.hash(data.password, 12);
        }
        else {
            delete updateData.password;
        }
        return this.prisma.admin.update({
            where: { id },
            data: updateData,
            select: {
                id: true, username: true, image: true, role: true,
                customRoleId: true,
                customRole: { select: { id: true, name: true, permissions: true } },
                isActive: true, createdAt: true,
            },
        });
    }
    async remove(id) {
        await this.findOne(id);
        return this.prisma.admin.delete({ where: { id } });
    }
    async findAllRoles() {
        return this.prisma.adminPermissionRole.findMany({
            orderBy: { createdAt: 'asc' },
            include: { _count: { select: { admins: true } } },
        });
    }
    async findOneRole(id) {
        const role = await this.prisma.adminPermissionRole.findUnique({ where: { id } });
        if (!role)
            throw new common_1.NotFoundException('Эрх олдсонгүй.');
        return role;
    }
    async createRole(data) {
        const exists = await this.prisma.adminPermissionRole.findUnique({ where: { name: data.name } });
        if (exists)
            throw new common_1.ConflictException('Тухайн нэртэй эрх аль хэдийн байна.');
        return this.prisma.adminPermissionRole.create({
            data: { name: data.name, permissions: data.permissions },
        });
    }
    async updateRole(id, data) {
        await this.findOneRole(id);
        return this.prisma.adminPermissionRole.update({
            where: { id },
            data: { ...data, permissions: data.permissions },
        });
    }
    async removeRole(id) {
        await this.findOneRole(id);
        await this.prisma.admin.updateMany({
            where: { customRoleId: id },
            data: { customRoleId: null },
        });
        return this.prisma.adminPermissionRole.delete({ where: { id } });
    }
    async seed() {
        const seedPassword = process.env.ADMIN_SEED_PASSWORD;
        if (!seedPassword)
            throw new Error('ADMIN_SEED_PASSWORD environment variable is not set!');
        const hash = await bcrypt.hash(seedPassword, 12);
        const existing = await this.prisma.admin.findUnique({ where: { username: 'admin' } });
        if (!existing) {
            await this.prisma.admin.create({
                data: { username: 'admin', password: hash, role: 'SUPER_ADMIN' },
            });
            console.log('✅ Default SUPER_ADMIN created: username=admin (password from ADMIN_SEED_PASSWORD env)');
        }
        else {
            await this.prisma.admin.update({
                where: { username: 'admin' },
                data: { password: hash },
            });
            console.log('✅ Default admin password synced with ADMIN_SEED_PASSWORD env');
        }
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, jwt_1.JwtService])
], AdminService);
//# sourceMappingURL=admin.service.js.map