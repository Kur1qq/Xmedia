import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ServiceService {
    constructor(private prisma: PrismaService) { }

    async create(data: any) {
        return this.prisma.service.create({
            data,
            include: { category: true, subCategory: true },
        });
    }

    async findAll() {
        return this.prisma.service.findMany({
            orderBy: { createdAt: 'desc' },
            include: { category: true, subCategory: true },
        });
    }

    async findOne(id: number) {
        const service = await this.prisma.service.findUnique({
            where: { id },
            include: { category: true, subCategory: true },
        });

        if (!service) {
            throw new NotFoundException(`Service with ID ${id} not found`);
        }

        return service;
    }

    async update(id: number, data: any) {
        await this.findOne(id); // Ensure exists

        return this.prisma.service.update({
            where: { id },
            data,
            include: { category: true, subCategory: true },
        });
    }

    async remove(id: number) {
        await this.findOne(id); // Ensure exists

        return this.prisma.service.delete({
            where: { id },
        });
    }
}
