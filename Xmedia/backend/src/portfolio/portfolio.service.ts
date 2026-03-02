import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { PortfolioServiceType } from '@prisma/client';

@Injectable()
export class PortfolioService {
    constructor(private prisma: PrismaService) { }

    async findAll(serviceType?: PortfolioServiceType) {
        return this.prisma.portfolioItem.findMany({
            where: serviceType ? { serviceType } : undefined,
            orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
        });
    }

    async findOne(id: number) {
        const item = await this.prisma.portfolioItem.findUnique({ where: { id } });
        if (!item) throw new NotFoundException('Portfolio item not found');
        return item;
    }

    async create(data: {
        serviceType: PortfolioServiceType;
        title: string;
        description?: string;
        images: string[];
        tags?: string[];
        isPublished?: boolean;
        sortOrder?: number;
        // LIVE fields
        liveDate?: Date;
        viewCount?: number;
        youtubeUrl?: string;
        facebookUrl?: string;
    }) {
        return this.prisma.portfolioItem.create({ data });
    }

    async update(id: number, data: {
        serviceType?: PortfolioServiceType;
        title?: string;
        description?: string;
        images?: string[];
        tags?: string[];
        isPublished?: boolean;
        sortOrder?: number;
        // LIVE fields
        liveDate?: Date | null;
        viewCount?: number | null;
        youtubeUrl?: string | null;
        facebookUrl?: string | null;
    }) {
        await this.findOne(id);
        return this.prisma.portfolioItem.update({ where: { id }, data });
    }

    async remove(id: number) {
        await this.findOne(id);
        return this.prisma.portfolioItem.delete({ where: { id } });
    }
}
