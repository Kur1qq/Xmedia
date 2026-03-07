import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Prisma } from '@prisma/client';

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

    async findByEmail(email: string) {
        const user = await this.prisma.user.findUnique({
            where: { email },
            select: { id: true, email: true }
        });
        return user;
    }

    async resetPassword(email: string, passwordHash: string) {
        return this.prisma.user.update({
            where: { email },
            data: { passwordHash },
            select: { id: true, email: true }
        });
    }

    async login(email: string, passwordHash: string) {
        const user = await this.prisma.user.findUnique({
            where: { email }
        });

        if (!user || user.passwordHash !== passwordHash) {
            throw new Error('Invalid credentials');
        }

        const { passwordHash: _, ...result } = user;
        return result;
    }

    async create(data: { username: string; email: string; phone?: string; passwordHash: string }) {
        try {
            return await this.prisma.user.create({
                data,
                select: { id: true, username: true, email: true, phone: true, createdAt: true }
            });
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === 'P2002') {
                    throw new ConflictException('Энэ и-мэйл хаяг бүртгэгдсэн байна.');
                }
            }
            throw error;
        }
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
