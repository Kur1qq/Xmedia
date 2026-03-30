import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class LiveServiceService {
    constructor(private prisma: PrismaService) { }

    async findAll() {
        return this.prisma.liveService.findMany({
            orderBy: { sortOrder: 'asc' },
            include: {
                category: true,
                serviceType: { include: { subTypes: { orderBy: { sortOrder: 'asc' } } } },
                subType: true,
                priceTiers: { orderBy: { cameraCount: 'asc' } },
                equipments: { include: { equipment: true } },
            },
        });
    }

    async findOne(id: number) {
        const item = await this.prisma.liveService.findUnique({
            where: { id },
            include: {
                category: true,
                serviceType: { include: { subTypes: { orderBy: { sortOrder: 'asc' } } } },
                subType: true,
                priceTiers: { orderBy: { cameraCount: 'asc' } },
                equipments: { include: { equipment: true } },
            },
        });
        if (!item) throw new NotFoundException(`LiveService #${id} not found`);
        return item;
    }

    async create(data: any) {
        const { priceTiers, equipmentIds, categoryId, serviceTypeId, subTypeId, ...rest } = data;

        return this.prisma.liveService.create({
            data: {
                ...rest,
                category: { connect: { id: categoryId } },
                ...(serviceTypeId ? { serviceType: { connect: { id: serviceTypeId } } } : {}),
                ...(subTypeId ? { subType: { connect: { id: subTypeId } } } : {}),
                priceTiers: priceTiers?.length
                    ? { create: priceTiers.map((t: any) => ({ cameraCount: t.cameraCount, label: t.label || null, price: t.price })) }
                    : undefined,
                equipments: equipmentIds?.length
                    ? { create: equipmentIds.map((eid: number) => ({ equipment: { connect: { id: eid } } })) }
                    : undefined,
            },
            include: {
                category: true,
                serviceType: true,
                subType: true,
                priceTiers: { orderBy: { cameraCount: 'asc' } },
                equipments: { include: { equipment: true } },
            },
        });
    }

    async update(id: number, data: any) {
        await this.findOne(id);
        const { priceTiers, equipmentIds, categoryId, serviceTypeId, subTypeId, ...rest } = data;

        // Replace tiers and equipment completely
        await this.prisma.liveServiceCameraTier.deleteMany({ where: { liveServiceId: id } });
        await this.prisma.liveServiceEquipment.deleteMany({ where: { liveServiceId: id } });

        return this.prisma.liveService.update({
            where: { id },
            data: {
                ...rest,
                ...(categoryId ? { category: { connect: { id: categoryId } } } : {}),
                serviceType: serviceTypeId ? { connect: { id: serviceTypeId } } : { disconnect: true },
                subType: subTypeId ? { connect: { id: subTypeId } } : { disconnect: true },
                priceTiers: priceTiers?.length
                    ? { create: priceTiers.map((t: any) => ({ cameraCount: t.cameraCount, label: t.label || null, price: t.price })) }
                    : undefined,
                equipments: equipmentIds?.length
                    ? { create: equipmentIds.map((eid: number) => ({ equipment: { connect: { id: eid } } })) }
                    : undefined,
            },
            include: {
                category: true,
                serviceType: true,
                subType: true,
                priceTiers: { orderBy: { cameraCount: 'asc' } },
                equipments: { include: { equipment: true } },
            },
        });
    }

    async remove(id: number) {
        await this.findOne(id);
        return this.prisma.liveService.delete({ where: { id } });
    }
}
