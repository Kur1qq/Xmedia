import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class BundleServiceService {
    constructor(private prisma: PrismaService) { }

    async findAll() {
        return this.prisma.bundleService.findMany({
            include: {
                equipments: {
                    include: {
                        equipment: true,
                    },
                },
            },
        });
    }

    async findOne(id: number) {
        const bundleService = await this.prisma.bundleService.findUnique({
            where: { id },
            include: {
                equipments: {
                    include: {
                        equipment: true,
                    },
                },
            },
        });

        if (!bundleService) {
            throw new NotFoundException(`Багц үйлчилгээ олдсонгүй (id=${id})`);
        }

        return bundleService;
    }

    async create(data: any) {
        const { name, description, price, image, includedServices, amenities, equipments, isActive } = data;

        return this.prisma.bundleService.create({
            data: {
                name,
                description,
                price,
                image,
                includedServices: includedServices || [],
                amenities: amenities || [],
                isActive: isActive === undefined ? true : isActive,
                equipments: {
                    create: equipments?.map((eq: any) => ({
                        equipmentId: eq.equipmentId,
                        quantity: eq.quantity || 1,
                    })) || [],
                },
            },
            include: { equipments: true },
        });
    }

    async update(id: number, data: any) {
        const { name, description, price, image, includedServices, amenities, equipments, isActive } = data;

        // Check existence
        await this.findOne(id);

        // Update basic fields
        const updated = await this.prisma.bundleService.update({
            where: { id },
            data: {
                name,
                description,
                price,
                image,
                includedServices: includedServices,
                amenities: amenities,
                isActive: isActive,
            },
        });

        // Update equipment if provided
        if (equipments) {
            await this.prisma.bundleServiceEquipment.deleteMany({
                where: { bundleServiceId: id },
            });

            if (equipments.length > 0) {
                await this.prisma.bundleServiceEquipment.createMany({
                    data: equipments.map((eq: any) => ({
                        bundleServiceId: id,
                        equipmentId: eq.equipmentId,
                        quantity: eq.quantity || 1,
                    })),
                });
            }
        }

        return this.findOne(id);
    }

    async remove(id: number) {
        await this.findOne(id);
        return this.prisma.bundleService.delete({
            where: { id },
        });
    }
}
