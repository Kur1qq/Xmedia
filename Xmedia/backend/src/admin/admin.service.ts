import { Injectable, UnauthorizedException, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminService {
    constructor(private prisma: PrismaService, private jwt: JwtService) { }

    async login(username: string, password: string) {
        const admin = await this.prisma.admin.findUnique({
            where: { username },
            include: { customRole: true },
        });
        if (!admin || !admin.isActive) throw new UnauthorizedException('Нэвтрэх нэр эсвэл нууц үг буруу байна.');
        const valid = await bcrypt.compare(password, admin.password);
        if (!valid) throw new UnauthorizedException('Нэвтрэх нэр эсвэл нууц үг буруу байна.');

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

    async findOne(id: number) {
        const admin = await this.prisma.admin.findUnique({
            where: { id },
            select: {
                id: true, username: true, image: true, role: true,
                customRoleId: true,
                customRole: { select: { id: true, name: true, permissions: true } },
                isActive: true, createdAt: true,
            },
        });
        if (!admin) throw new NotFoundException('Админ олдсонгүй.');
        return admin;
    }

    async create(data: { username: string; password: string; role?: string; image?: string; customRoleId?: number }) {
        const exists = await this.prisma.admin.findUnique({ where: { username: data.username } });
        if (exists) throw new ConflictException('Тухайн нэвтрэх нэр аль хэдийн бүртгэлтэй байна.');
        const hash = await bcrypt.hash(data.password, 12);
        return this.prisma.admin.create({
            data: {
                username: data.username, password: hash,
                role: (data.role as any) || 'ADMIN',
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

    async update(id: number, data: { username?: string; password?: string; role?: string; image?: string; isActive?: boolean; customRoleId?: number | null }) {
        await this.findOne(id);
        const updateData: any = { ...data };
        if (data.password) {
            updateData.password = await bcrypt.hash(data.password, 12);
        } else {
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

    async remove(id: number) {
        await this.findOne(id);
        return this.prisma.admin.delete({ where: { id } });
    }

    // ── Role Management ─────────────────────────────────────────────────────

    async findAllRoles() {
        return this.prisma.adminPermissionRole.findMany({
            orderBy: { createdAt: 'asc' },
            include: { _count: { select: { admins: true } } },
        });
    }

    async findOneRole(id: number) {
        const role = await this.prisma.adminPermissionRole.findUnique({ where: { id } });
        if (!role) throw new NotFoundException('Эрх олдсонгүй.');
        return role;
    }

    async createRole(data: { name: string; permissions: string[] }) {
        const exists = await this.prisma.adminPermissionRole.findUnique({ where: { name: data.name } });
        if (exists) throw new ConflictException('Тухайн нэртэй эрх аль хэдийн байна.');
        return this.prisma.adminPermissionRole.create({
            data: { name: data.name, permissions: data.permissions as any },
        });
    }

    async updateRole(id: number, data: { name?: string; permissions?: string[] }) {
        await this.findOneRole(id);
        return this.prisma.adminPermissionRole.update({
            where: { id },
            data: { ...data, permissions: data.permissions as any },
        });
    }

    async removeRole(id: number) {
        await this.findOneRole(id);
        // Unlink admins that used this role before deleting
        await this.prisma.admin.updateMany({
            where: { customRoleId: id },
            data: { customRoleId: null },
        });
        return this.prisma.adminPermissionRole.delete({ where: { id } });
    }

    // Called on startup to ensure at least one SUPER_ADMIN exists
    async seed() {
        const seedPassword = process.env.ADMIN_SEED_PASSWORD;
        if (!seedPassword) throw new Error('ADMIN_SEED_PASSWORD environment variable is not set!');
        const hash = await bcrypt.hash(seedPassword, 12);

        const existing = await this.prisma.admin.findUnique({ where: { username: 'admin' } });
        if (!existing) {
            await this.prisma.admin.create({
                data: { username: 'admin', password: hash, role: 'SUPER_ADMIN' },
            });
            console.log('✅ Default SUPER_ADMIN created: username=admin (password from ADMIN_SEED_PASSWORD env)');
        } else {
            await this.prisma.admin.update({
                where: { username: 'admin' },
                data: { password: hash },
            });
            console.log('✅ Default admin password synced with ADMIN_SEED_PASSWORD env');
        }
    }
}
