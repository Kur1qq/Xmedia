import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class EditServiceService {
    constructor(private prisma: PrismaService) { }

    async findAll() {
        return this.prisma.editService.findMany({
            orderBy: { createdAt: 'desc' },
            include: { category: true, mainType: true, subType: true },
        });
    }

    async findOne(id: number) {
        const item = await this.prisma.editService.findUnique({
            where: { id },
            include: { category: true, mainType: true, subType: true },
        });
        if (!item) throw new NotFoundException(`EditService #${id} not found`);
        return item;
    }

    async create(data: any) {
        const { categoryId, mainTypeId, subTypeId, ...rest } = data;
        return this.prisma.editService.create({
            data: {
                ...rest,
                category: { connect: { id: categoryId } },
                mainType: { connect: { id: mainTypeId } },
                ...(subTypeId ? { subType: { connect: { id: subTypeId } } } : {}),
            },
            include: { category: true, mainType: true, subType: true },
        });
    }

    async update(id: number, data: any) {
        await this.findOne(id);
        const { categoryId, mainTypeId, subTypeId, ...rest } = data;
        return this.prisma.editService.update({
            where: { id },
            data: {
                ...rest,
                ...(categoryId ? { category: { connect: { id: categoryId } } } : {}),
                ...(mainTypeId ? { mainType: { connect: { id: mainTypeId } } } : {}),
                ...(subTypeId === null ? { subType: { disconnect: true } } : subTypeId ? { subType: { connect: { id: subTypeId } } } : {}),
            },
            include: { category: true, mainType: true, subType: true },
        });
    }

    async remove(id: number) {
        await this.findOne(id);
        return this.prisma.editService.delete({ where: { id } });
    }
}
