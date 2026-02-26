import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) { }

    async findAll() {
        return this.prisma.user.findMany({
            select: { id: true, username: true, email: true, phone: true, createdAt: true, updatedAt: true }
        });
    }

    async findOne(id: number) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            select: { id: true, username: true, email: true, phone: true, createdAt: true, updatedAt: true }
        });

        if (!user) throw new NotFoundException('User not found');
        return user;
    }

    async create(data: { username: string; email: string; phone?: string; passwordHash: string }) {
        return this.prisma.user.create({
            data,
            select: { id: true, username: true, email: true, phone: true, createdAt: true }
        });
    }

    async update(id: number, data: { username?: string; email?: string; phone?: string; passwordHash?: string }) {
        return this.prisma.user.update({
            where: { id },
            data,
            select: { id: true, username: true, email: true, phone: true, updatedAt: true }
        });
    }

    async remove(id: number) {
        return this.prisma.user.delete({
            where: { id },
            select: { id: true, username: true }
        });
    }
}
