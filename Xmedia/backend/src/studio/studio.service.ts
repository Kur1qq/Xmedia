import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class StudioService {
    constructor(private prisma: PrismaService) { }

    async create(data: any) {
        const { equipmentIds, packages, ...studioData } = data;
        return this.prisma.studio.create({
            data: {
                ...studioData,
                equipment: equipmentIds?.length > 0 ? {
                    create: equipmentIds.map((id: number) => ({ equipmentId: id }))
                } : undefined,
                packages: packages?.length > 0 ? {
                    create: packages.map((pkg: any) => ({
                        hours: pkg.hours,
                        price: pkg.price
                    }))
                } : undefined
            },
            include: { equipment: { include: { equipment: true } }, packages: true }
        });
    }

    async findAll() {
        return this.prisma.studio.findMany({
            orderBy: { createdAt: 'desc' },
            include: { equipment: { include: { equipment: true } }, packages: true }
        });
    }

    async findOne(id: number) {
        const studio = await this.prisma.studio.findUnique({
            where: { id },
            include: { equipment: { include: { equipment: true } }, packages: true }
        });

        if (!studio) {
            throw new NotFoundException(`Studio with ID ${id} not found`);
        }

        return studio;
    }

    async update(id: number, data: any) {
        await this.findOne(id); // Ensure exists

        const { equipmentIds, packages, ...studioData } = data;

        if (equipmentIds !== undefined) {
            await this.prisma.studioEquipment.deleteMany({
                where: { studioId: id }
            });
        }

        if (packages !== undefined) {
            await this.prisma.studioPackage.deleteMany({
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
                } : {}),
                ...(packages !== undefined ? {
                    packages: {
                        create: packages.map((pkg: any) => ({
                            hours: pkg.hours,
                            price: pkg.price
                        }))
                    }
                } : {})
            },
            include: { equipment: { include: { equipment: true } }, packages: true }
        });
    }

    async remove(id: number) {
        await this.findOne(id); // Ensure exists

        return this.prisma.studio.delete({
            where: { id },
        });
    }
}
