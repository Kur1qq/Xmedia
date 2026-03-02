import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PhotographerServiceService {
    constructor(private prisma: PrismaService) { }

    async findAll() {
        return this.prisma.photographerService.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                category: true,
                mainType: true,
                packages: { include: { subType: true } },
                equipments: { include: { equipment: true } },
            },
        });
    }

    async findOne(id: number) {
        const item = await this.prisma.photographerService.findUnique({
            where: { id },
            include: {
                category: true, mainType: true,
                packages: { include: { subType: true } },
                equipments: { include: { equipment: true } },
            },
        });
        if (!item) throw new NotFoundException(`PhotographerService #${id} not found`);
        return item;
    }

    async create(data: any) {
        const { categoryId, mainTypeId, subTypeId, hourlyRate, dailyRate, equipmentIds, packages, ...rest } = data;
        return this.prisma.photographerService.create({
            data: {
                ...rest,
                category: { connect: { id: categoryId } },
                mainType: { connect: { id: mainTypeId } },
                ...(packages?.length ? {
                    packages: {
                        create: packages.map((p: any) => ({
                            subTypeId: p.subTypeId,
                            price: p.price,
                            priceLabel: p.priceLabel,
                        })),
                    },
                } : {}),
                ...(equipmentIds?.length ? {
                    equipments: {
                        create: equipmentIds.map((eId: number) => ({ equipmentId: eId })),
                    },
                } : {}),
            },
            include: {
                category: true, mainType: true,
                packages: { include: { subType: true } },
                equipments: { include: { equipment: true } },
            },
        });
    }

    async update(id: number, data: any) {
        await this.findOne(id);
        const { categoryId, mainTypeId, subTypeId, hourlyRate, dailyRate, equipmentIds, packages, ...rest } = data;

        // Update the main record
        await this.prisma.photographerService.update({
            where: { id },
            data: {
                ...rest,
                ...(categoryId ? { category: { connect: { id: categoryId } } } : {}),
                ...(mainTypeId ? { mainType: { connect: { id: mainTypeId } } } : {}),
            },
        });

        // Always reset equipment if equipmentIds is provided
        if (equipmentIds !== undefined) {
            await this.prisma.photographerServiceEquipment.deleteMany({ where: { photographerServiceId: id } });
            if (equipmentIds.length > 0) {
                await this.prisma.photographerServiceEquipment.createMany({
                    data: equipmentIds.map((eId: number) => ({ photographerServiceId: id, equipmentId: eId })),
                });
            }
        }

        // Always reset packages if provided
        if (packages !== undefined) {
            await this.prisma.photographerServicePackage.deleteMany({ where: { photographerServiceId: id } });
            if (packages.length > 0) {
                await this.prisma.photographerServicePackage.createMany({
                    data: packages.map((p: any) => ({
                        photographerServiceId: id,
                        subTypeId: p.subTypeId,
                        price: p.price,
                        priceLabel: p.priceLabel,
                    })),
                });
            }
        }

        return this.findOne(id);
    }

    async remove(id: number) {
        await this.findOne(id);
        return this.prisma.photographerService.delete({ where: { id } });
    }
}
