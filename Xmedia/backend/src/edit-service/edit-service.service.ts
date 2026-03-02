import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class EditServiceService {
    constructor(private prisma: PrismaService) { }

    async findAll() {
        return this.prisma.editService.findMany({
            orderBy: { createdAt: 'desc' },
            include: { category: true, mainType: true, subType: true, packages: { include: { subType: true } } },
        });
    }

    async findOne(id: number) {
        const item = await this.prisma.editService.findUnique({
            where: { id },
            include: { category: true, mainType: true, subType: true, packages: { include: { subType: true } } },
        });
        if (!item) throw new NotFoundException(`EditService #${id} not found`);
        return item;
    }

    async create(data: any) {
        const { categoryId, mainTypeId, subTypeId, packages, ...rest } = data;
        return this.prisma.editService.create({
            data: {
                ...rest,
                category: { connect: { id: categoryId } },
                mainType: { connect: { id: mainTypeId } },
                ...(subTypeId ? { subType: { connect: { id: subTypeId } } } : {}),
                ...(packages?.length ? {
                    packages: {
                        create: packages.map((p: any) => ({
                            subTypeId: p.subTypeId,
                            price: p.price,
                            priceLabel: p.priceLabel,
                        })),
                    },
                } : {}),
            },
            include: { category: true, mainType: true, subType: true, packages: { include: { subType: true } } },
        });
    }

    async update(id: number, data: any) {
        await this.findOne(id);
        const { categoryId, mainTypeId, subTypeId, packages, ...rest } = data;

        await this.prisma.editService.update({
            where: { id },
            data: {
                ...rest,
                ...(categoryId ? { category: { connect: { id: categoryId } } } : {}),
                ...(mainTypeId ? { mainType: { connect: { id: mainTypeId } } } : {}),
                ...(subTypeId === null ? { subType: { disconnect: true } } : subTypeId ? { subType: { connect: { id: subTypeId } } } : {}),
            },
        });

        if (packages !== undefined) {
            await this.prisma.editServicePackage.deleteMany({ where: { editServiceId: id } });
            if (packages.length > 0) {
                await this.prisma.editServicePackage.createMany({
                    data: packages.map((p: any) => ({
                        editServiceId: id,
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
        return this.prisma.editService.delete({ where: { id } });
    }
}
