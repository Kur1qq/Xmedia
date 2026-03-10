"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BundleServiceService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
let BundleServiceService = class BundleServiceService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
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
    async findOne(id) {
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
            throw new common_1.NotFoundException(`Багц үйлчилгээ олдсонгүй (id=${id})`);
        }
        return bundleService;
    }
    async create(data) {
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
                    create: equipments?.map((eq) => ({
                        equipmentId: eq.equipmentId,
                        quantity: eq.quantity || 1,
                    })) || [],
                },
            },
            include: { equipments: true },
        });
    }
    async update(id, data) {
        const { name, description, price, image, includedServices, amenities, equipments, isActive } = data;
        await this.findOne(id);
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
        if (equipments) {
            await this.prisma.bundleServiceEquipment.deleteMany({
                where: { bundleServiceId: id },
            });
            if (equipments.length > 0) {
                await this.prisma.bundleServiceEquipment.createMany({
                    data: equipments.map((eq) => ({
                        bundleServiceId: id,
                        equipmentId: eq.equipmentId,
                        quantity: eq.quantity || 1,
                    })),
                });
            }
        }
        return this.findOne(id);
    }
    async remove(id) {
        await this.findOne(id);
        return this.prisma.bundleService.delete({
            where: { id },
        });
    }
};
exports.BundleServiceService = BundleServiceService;
exports.BundleServiceService = BundleServiceService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], BundleServiceService);
//# sourceMappingURL=bundle-service.service.js.map