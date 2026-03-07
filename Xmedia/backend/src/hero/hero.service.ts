import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class HeroService {
    constructor(private prisma: PrismaService) { }

    async findAll() {
        return this.prisma.heroSlide.findMany({
            orderBy: { order: 'asc' },
        });
    }

    async findActive() {
        return this.prisma.heroSlide.findMany({
            where: { isActive: true },
            orderBy: { order: 'asc' },
        });
    }

    async findOne(id: number) {
        const slide = await this.prisma.heroSlide.findUnique({
            where: { id },
        });
        if (!slide) throw new NotFoundException('Hero slide not found');
        return slide;
    }

    async create(data: any) {
        return this.prisma.heroSlide.create({
            data: {
                title: data.title || '',
                highlight: data.highlight,
                subTitle: data.subTitle,
                description: data.description,
                image: data.image || '',
                order: data.order !== undefined ? parseInt(data.order, 10) : 0,
                isActive: data.isActive !== undefined ? data.isActive : true,
            },
        });
    }

    async update(id: number, data: any) {
        await this.findOne(id);
        const updateData: any = {};
        if (data.title !== undefined) updateData.title = data.title;
        if (data.highlight !== undefined) updateData.highlight = data.highlight;
        if (data.subTitle !== undefined) updateData.subTitle = data.subTitle;
        if (data.description !== undefined) updateData.description = data.description;
        if (data.image !== undefined) updateData.image = data.image;
        if (data.order !== undefined) updateData.order = parseInt(data.order, 10);
        if (data.isActive !== undefined) updateData.isActive = data.isActive;

        return this.prisma.heroSlide.update({
            where: { id },
            data: updateData,
        });
    }

    async remove(id: number) {
        await this.findOne(id);
        return this.prisma.heroSlide.delete({
            where: { id },
        });
    }
}
