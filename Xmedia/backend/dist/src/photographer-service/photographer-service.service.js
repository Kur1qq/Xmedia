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
exports.PhotographerServiceService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
let PhotographerServiceService = class PhotographerServiceService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll() {
        return this.prisma.photographerService.findMany({
            orderBy: { sortOrder: 'asc' },
            include: {
                category: true,
                mainType: true,
                packages: { include: { subType: true } },
                equipments: { include: { equipment: true } },
            },
        });
    }
    async findOne(id) {
        const item = await this.prisma.photographerService.findUnique({
            where: { id },
            include: {
                category: true, mainType: true,
                packages: { include: { subType: true } },
                equipments: { include: { equipment: true } },
            },
        });
        if (!item)
            throw new common_1.NotFoundException(`PhotographerService #${id} not found`);
        return item;
    }
    async create(data) {
        const { categoryId, mainTypeId, subTypeId, hourlyRate, dailyRate, equipmentIds, packages, sortOrder, ...rest } = data;
        return this.prisma.photographerService.create({
            data: {
                ...rest,
                sortOrder: sortOrder || 0,
                category: { connect: { id: categoryId } },
                mainType: { connect: { id: mainTypeId } },
                ...(packages?.length ? {
                    packages: {
                        create: packages.map((p) => ({
                            subTypeId: p.subTypeId,
                            price: p.price,
                            duration: p.duration !== undefined ? p.duration : 1,
                            priceLabel: p.priceLabel,
                        })),
                    },
                } : {}),
                ...(equipmentIds?.length ? {
                    equipments: {
                        create: equipmentIds.map((eId) => ({ equipmentId: eId })),
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
    async update(id, data) {
        await this.findOne(id);
        const { categoryId, mainTypeId, subTypeId, hourlyRate, dailyRate, equipmentIds, packages, ...rest } = data;
        await this.prisma.photographerService.update({
            where: { id },
            data: {
                ...rest,
                ...(categoryId ? { category: { connect: { id: categoryId } } } : {}),
                ...(mainTypeId ? { mainType: { connect: { id: mainTypeId } } } : {}),
            },
        });
        if (equipmentIds !== undefined) {
            await this.prisma.photographerServiceEquipment.deleteMany({ where: { photographerServiceId: id } });
            if (equipmentIds.length > 0) {
                await this.prisma.photographerServiceEquipment.createMany({
                    data: equipmentIds.map((eId) => ({ photographerServiceId: id, equipmentId: eId })),
                });
            }
        }
        if (packages !== undefined) {
            await this.prisma.photographerServicePackage.deleteMany({ where: { photographerServiceId: id } });
            if (packages.length > 0) {
                await this.prisma.photographerServicePackage.createMany({
                    data: packages.map((p) => ({
                        photographerServiceId: id,
                        subTypeId: p.subTypeId,
                        price: p.price,
                        duration: p.duration !== undefined ? p.duration : 1,
                        priceLabel: p.priceLabel,
                    })),
                });
            }
        }
        return this.findOne(id);
    }
    async remove(id) {
        await this.findOne(id);
        return this.prisma.photographerService.delete({ where: { id } });
    }
};
exports.PhotographerServiceService = PhotographerServiceService;
exports.PhotographerServiceService = PhotographerServiceService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PhotographerServiceService);
//# sourceMappingURL=photographer-service.service.js.map