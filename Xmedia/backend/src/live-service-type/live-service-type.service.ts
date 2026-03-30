import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class LiveServiceTypeService {
    constructor(private prisma: PrismaService) { }

    // ===================== MAIN TYPES =====================
    async findAllMainTypes() {
        return this.prisma.liveServiceType.findMany({
            orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
            include: {
                subTypes: { orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }] },
                _count: { select: { services: true } },
            },
        });
    }

    async createMainType(data: any) {
        return this.prisma.liveServiceType.create({ data });
    }

    async updateMainType(id: number, data: any) {
        const existing = await this.prisma.liveServiceType.findUnique({ where: { id } });
        if (!existing) throw new NotFoundException(`Main type #${id} not found`);
        return this.prisma.liveServiceType.update({ where: { id }, data });
    }

    async removeMainType(id: number) {
        const existing = await this.prisma.liveServiceType.findUnique({ where: { id } });
        if (!existing) throw new NotFoundException(`Main type #${id} not found`);
        return this.prisma.liveServiceType.delete({ where: { id } });
    }

    // ===================== SUB TYPES =====================
    async findSubTypesByMain(mainTypeId: number) {
        return this.prisma.liveServiceSubType.findMany({
            where: { mainTypeId },
            orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
        });
    }

    async createSubType(data: any) {
        return this.prisma.liveServiceSubType.create({ data });
    }

    async updateSubType(id: number, data: any) {
        const existing = await this.prisma.liveServiceSubType.findUnique({ where: { id } });
        if (!existing) throw new NotFoundException(`Sub type #${id} not found`);
        return this.prisma.liveServiceSubType.update({ where: { id }, data });
    }

    async removeSubType(id: number) {
        const existing = await this.prisma.liveServiceSubType.findUnique({ where: { id } });
        if (!existing) throw new NotFoundException(`Sub type #${id} not found`);
        return this.prisma.liveServiceSubType.delete({ where: { id } });
    }
}
