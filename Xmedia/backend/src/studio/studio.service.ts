import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class StudioService {
    constructor(private prisma: PrismaService) { }

    async create(data: any) {
        const { equipmentIds, ...studioData } = data;
        return this.prisma.studio.create({
            data: {
                ...studioData,
                equipment: equipmentIds?.length > 0 ? {
                    create: equipmentIds.map((id: number) => ({ equipmentId: id }))
                } : undefined
            },
            include: { equipment: { include: { equipment: true } } }
        });
    }

    async findAll() {
        return this.prisma.studio.findMany({
            orderBy: { createdAt: 'desc' },
            include: { equipment: { include: { equipment: true } } }
        });
    }

    async findOne(id: number) {
        const studio = await this.prisma.studio.findUnique({
            where: { id },
            include: { equipment: { include: { equipment: true } } }
        });

        if (!studio) {
            throw new NotFoundException(`Studio with ID ${id} not found`);
        }

        return studio;
    }

    async update(id: number, data: any) {
        await this.findOne(id); // Ensure exists

        const { equipmentIds, ...studioData } = data;

        if (equipmentIds !== undefined) {
            await this.prisma.studioEquipment.deleteMany({
                where: { studioId: id }
            });
        }

        return this.prisma.studio.update({
            where: { id },
            data: {
                ...studioData,
                ...(equipmentIds !== undefined ? {
                    equipment: {
                        create: equipmentIds.map((eid: number) => ({ equipmentId: eid }))
                    }
                } : {})
            },
            include: { equipment: { include: { equipment: true } } }
        });
    }

    async remove(id: number) {
        await this.findOne(id); // Ensure exists

        return this.prisma.studio.delete({
            where: { id },
        });
    }
}
