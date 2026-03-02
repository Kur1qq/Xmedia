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
exports.StudioService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
let StudioService = class StudioService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        const { equipmentIds, packages, ...studioData } = data;
        return this.prisma.studio.create({
            data: {
                ...studioData,
                equipment: equipmentIds?.length > 0 ? {
                    create: equipmentIds.map((id) => ({ equipmentId: id }))
                } : undefined,
                packages: packages?.length > 0 ? {
                    create: packages.map((pkg) => ({
                        hours: pkg.hours,
                        price: pkg.price
                    }))
                } : undefined
            },
            include: { equipment: { include: { equipment: true } }, packages: true }
        });
    }
    async findAll() {
        return this.prisma.studio.findMany({
            orderBy: { createdAt: 'desc' },
            include: { equipment: { include: { equipment: true } }, packages: true }
        });
    }
    async findOne(id) {
        const studio = await this.prisma.studio.findUnique({
            where: { id },
            include: { equipment: { include: { equipment: true } }, packages: true }
        });
        if (!studio) {
            throw new common_1.NotFoundException(`Studio with ID ${id} not found`);
        }
        return studio;
    }
    async update(id, data) {
        await this.findOne(id);
        const { equipmentIds, packages, ...studioData } = data;
        if (equipmentIds !== undefined) {
            await this.prisma.studioEquipment.deleteMany({
                where: { studioId: id }
            });
        }
        if (packages !== undefined) {
            await this.prisma.studioPackage.deleteMany({
                where: { studioId: id }
            });
        }
        return this.prisma.studio.update({
            where: { id },
            data: {
                ...studioData,
                ...(equipmentIds !== undefined ? {
                    equipment: {
                        create: equipmentIds.map((eid) => ({ equipmentId: eid }))
                    }
                } : {}),
                ...(packages !== undefined ? {
                    packages: {
                        create: packages.map((pkg) => ({
                            hours: pkg.hours,
                            price: pkg.price
                        }))
                    }
                } : {})
            },
            include: { equipment: { include: { equipment: true } }, packages: true }
        });
    }
    async remove(id) {
        await this.findOne(id);
        return this.prisma.studio.delete({
            where: { id },
        });
    }
};
exports.StudioService = StudioService;
exports.StudioService = StudioService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], StudioService);
//# sourceMappingURL=studio.service.js.map