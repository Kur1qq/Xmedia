import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class EditTypeService {
    constructor(private prisma: PrismaService) { }

    // ===================== MAIN TYPES =====================
    async findAllMainTypes() {
        return this.prisma.editMainType.findMany({
            orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
            include: {
                subTypes: { orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }] },
                _count: { select: { services: true } },
            },
        });
    }

    async createMainType(data: any) {
        return this.prisma.editMainType.create({ data });
    }

    async updateMainType(id: number, data: any) {
        const existing = await this.prisma.editMainType.findUnique({ where: { id } });
        if (!existing) throw new NotFoundException(`EditMainType #${id} not found`);
        return this.prisma.editMainType.update({ where: { id }, data });
    }

    async removeMainType(id: number) {
        const existing = await this.prisma.editMainType.findUnique({ where: { id } });
        if (!existing) throw new NotFoundException(`EditMainType #${id} not found`);
        return this.prisma.editMainType.delete({ where: { id } });
    }

    // ===================== SUB TYPES =====================
    async createSubType(data: any) {
        return this.prisma.editSubType.create({ data });
    }

    async updateSubType(id: number, data: any) {
        const existing = await this.prisma.editSubType.findUnique({ where: { id } });
        if (!existing) throw new NotFoundException(`EditSubType #${id} not found`);
        return this.prisma.editSubType.update({ where: { id }, data });
    }

    async removeSubType(id: number) {
        const existing = await this.prisma.editSubType.findUnique({ where: { id } });
        if (!existing) throw new NotFoundException(`EditSubType #${id} not found`);
        return this.prisma.editSubType.delete({ where: { id } });
    }
}
