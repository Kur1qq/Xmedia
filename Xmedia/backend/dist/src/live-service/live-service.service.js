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
exports.LiveServiceService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
let LiveServiceService = class LiveServiceService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll() {
        return this.prisma.liveService.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                category: true,
                priceTiers: { orderBy: { cameraCount: 'asc' } },
                equipments: { include: { equipment: true } },
            },
        });
    }
    async findOne(id) {
        const item = await this.prisma.liveService.findUnique({
            where: { id },
            include: {
                category: true,
                priceTiers: { orderBy: { cameraCount: 'asc' } },
                equipments: { include: { equipment: true } },
            },
        });
        if (!item)
            throw new common_1.NotFoundException(`LiveService #${id} not found`);
        return item;
    }
    async create(data) {
        const { priceTiers, equipmentIds, categoryId, ...rest } = data;
        return this.prisma.liveService.create({
            data: {
                ...rest,
                category: { connect: { id: categoryId } },
                priceTiers: priceTiers?.length
                    ? { create: priceTiers.map((t) => ({ cameraCount: t.cameraCount, label: t.label || null, price: t.price })) }
                    : undefined,
                equipments: equipmentIds?.length
                    ? { create: equipmentIds.map((eid) => ({ equipment: { connect: { id: eid } } })) }
                    : undefined,
            },
            include: {
                category: true,
                priceTiers: { orderBy: { cameraCount: 'asc' } },
                equipments: { include: { equipment: true } },
            },
        });
    }
    async update(id, data) {
        await this.findOne(id);
        const { priceTiers, equipmentIds, categoryId, ...rest } = data;
        await this.prisma.liveServiceCameraTier.deleteMany({ where: { liveServiceId: id } });
        await this.prisma.liveServiceEquipment.deleteMany({ where: { liveServiceId: id } });
        return this.prisma.liveService.update({
            where: { id },
            data: {
                ...rest,
                ...(categoryId ? { category: { connect: { id: categoryId } } } : {}),
                priceTiers: priceTiers?.length
                    ? { create: priceTiers.map((t) => ({ cameraCount: t.cameraCount, label: t.label || null, price: t.price })) }
                    : undefined,
                equipments: equipmentIds?.length
                    ? { create: equipmentIds.map((eid) => ({ equipment: { connect: { id: eid } } })) }
                    : undefined,
            },
            include: {
                category: true,
                priceTiers: { orderBy: { cameraCount: 'asc' } },
                equipments: { include: { equipment: true } },
            },
        });
    }
    async remove(id) {
        await this.findOne(id);
        return this.prisma.liveService.delete({ where: { id } });
    }
};
exports.LiveServiceService = LiveServiceService;
exports.LiveServiceService = LiveServiceService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], LiveServiceService);
//# sourceMappingURL=live-service.service.js.map