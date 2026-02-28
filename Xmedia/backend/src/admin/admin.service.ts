import { Injectable, UnauthorizedException, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminService {
    constructor(private prisma: PrismaService, private jwt: JwtService) { }

    async login(username: string, password: string) {
        const admin = await this.prisma.admin.findUnique({ where: { username } });
        if (!admin || !admin.isActive) throw new UnauthorizedException('Нэвтрэх нэр эсвэл нууц үг буруу байна.');
        const valid = await bcrypt.compare(password, admin.password);
        if (!valid) throw new UnauthorizedException('Нэвтрэх нэр эсвэл нууц үг буруу байна.');

        const token = this.jwt.sign({ sub: admin.id, username: admin.username, role: admin.role });
        return {
            token,
            admin: { id: admin.id, username: admin.username, image: admin.image, role: admin.role },
        };
    }

    async findAll() {
        return this.prisma.admin.findMany({
            orderBy: { createdAt: 'asc' },
            select: { id: true, username: true, image: true, role: true, isActive: true, createdAt: true },
        });
    }

    async findOne(id: number) {
        const admin = await this.prisma.admin.findUnique({
            where: { id },
            select: { id: true, username: true, image: true, role: true, isActive: true, createdAt: true },
        });
        if (!admin) throw new NotFoundException('Админ олдсонгүй.');
        return admin;
    }

    async create(data: { username: string; password: string; role?: string; image?: string }) {
        const exists = await this.prisma.admin.findUnique({ where: { username: data.username } });
        if (exists) throw new ConflictException('Тухайн нэвтрэх нэр аль хэдийн бүртгэлтэй байна.');
        const hash = await bcrypt.hash(data.password, 12);
        return this.prisma.admin.create({
            data: { username: data.username, password: hash, role: (data.role as any) || 'ADMIN', image: data.image },
            select: { id: true, username: true, image: true, role: true, isActive: true, createdAt: true },
        });
    }

    async update(id: number, data: { username?: string; password?: string; role?: string; image?: string; isActive?: boolean }) {
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
            select: { id: true, username: true, image: true, role: true, isActive: true, createdAt: true },
        });
    }

    async remove(id: number) {
        await this.findOne(id);
        return this.prisma.admin.delete({ where: { id } });
    }

    // Called on startup to ensure at least one SUPER_ADMIN exists
    async seed() {
        const count = await this.prisma.admin.count();
        if (count === 0) {
            const seedPassword = process.env.ADMIN_SEED_PASSWORD;
            if (!seedPassword) throw new Error('ADMIN_SEED_PASSWORD environment variable is not set!');
            const hash = await bcrypt.hash(seedPassword, 12);
            await this.prisma.admin.create({
                data: { username: 'admin', password: hash, role: 'SUPER_ADMIN' },
            });
            console.log('✅ Default SUPER_ADMIN created: username=admin (password from ADMIN_SEED_PASSWORD env)');
        }
    }
}
