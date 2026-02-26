import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { EquipmentType } from '@prisma/client';

@Injectable()
export class EquipmentService {
    constructor(private prisma: PrismaService) { }

    async create(data: { name: string; description?: string; type?: EquipmentType; images?: string }) {
        return this.prisma.equipment.create({ data });
    }

    async findAll() {
        return this.prisma.equipment.findMany({
            orderBy: { createdAt: 'desc' },
        });
    }

    async findOne(id: number) {
        const equipment = await this.prisma.equipment.findUnique({ where: { id } });
        if (!equipment) throw new NotFoundException('Equipment not found');
        return equipment;
    }

    async update(id: number, data: { name?: string; description?: string; type?: EquipmentType; images?: string }) {
        await this.findOne(id); // Ensure exists
        return this.prisma.equipment.update({
            where: { id },
            data,
        });
    }

    async remove(id: number) {
        await this.findOne(id); // Ensure exists
        return this.prisma.equipment.delete({ where: { id } });
    }
}
