import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class CategoryService {
    constructor(private prisma: PrismaService) { }

    async create(data: { name: string; description?: string; icon?: string }) {
        return this.prisma.serviceCategory.create({ data });
    }

    async findAll() {
        return this.prisma.serviceCategory.findMany({
            include: { subCategories: true },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findOne(id: number) {
        const category = await this.prisma.serviceCategory.findUnique({
            where: { id },
            include: { subCategories: true },
        });
        if (!category) throw new NotFoundException('Category not found');
        return category;
    }

    async update(id: number, data: { name?: string; description?: string; icon?: string }) {
        await this.findOne(id);
        return this.prisma.serviceCategory.update({
            where: { id },
            data,
        });
    }

    async remove(id: number) {
        await this.findOne(id);
        return this.prisma.serviceCategory.delete({ where: { id } });
    }
}
