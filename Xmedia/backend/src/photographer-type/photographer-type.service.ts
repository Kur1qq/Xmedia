import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PhotographerTypeService {
    constructor(private prisma: PrismaService) { }

    // ===================== MAIN TYPES =====================
    async findAllMainTypes() {
        return this.prisma.photographerMainType.findMany({
            orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
            include: {
                subTypes: { orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }] },
                _count: { select: { services: true } },
            },
        });
    }

    async createMainType(data: any) {
        return this.prisma.photographerMainType.create({ data });
    }

    async updateMainType(id: number, data: any) {
        const existing = await this.prisma.photographerMainType.findUnique({ where: { id } });
        if (!existing) throw new NotFoundException(`Main type #${id} not found`);
        return this.prisma.photographerMainType.update({ where: { id }, data });
    }

    async removeMainType(id: number) {
        const existing = await this.prisma.photographerMainType.findUnique({ where: { id } });
        if (!existing) throw new NotFoundException(`Main type #${id} not found`);
        return this.prisma.photographerMainType.delete({ where: { id } });
    }

    // ===================== SUB TYPES =====================
    async findSubTypesByMain(mainTypeId: number) {
        return this.prisma.photographerSubType.findMany({
            where: { mainTypeId },
            orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
        });
    }

    async createSubType(data: any) {
        return this.prisma.photographerSubType.create({ data });
    }

    async updateSubType(id: number, data: any) {
        const existing = await this.prisma.photographerSubType.findUnique({ where: { id } });
        if (!existing) throw new NotFoundException(`Sub type #${id} not found`);
        return this.prisma.photographerSubType.update({ where: { id }, data });
    }

    async removeSubType(id: number) {
        const existing = await this.prisma.photographerSubType.findUnique({ where: { id } });
        if (!existing) throw new NotFoundException(`Sub type #${id} not found`);
        return this.prisma.photographerSubType.delete({ where: { id } });
    }
}
