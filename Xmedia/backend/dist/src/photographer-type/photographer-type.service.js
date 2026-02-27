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
exports.PhotographerTypeService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
let PhotographerTypeService = class PhotographerTypeService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAllMainTypes() {
        return this.prisma.photographerMainType.findMany({
            orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
            include: {
                subTypes: { orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }] },
                _count: { select: { services: true } },
            },
        });
    }
    async createMainType(data) {
        return this.prisma.photographerMainType.create({ data });
    }
    async updateMainType(id, data) {
        const existing = await this.prisma.photographerMainType.findUnique({ where: { id } });
        if (!existing)
            throw new common_1.NotFoundException(`Main type #${id} not found`);
        return this.prisma.photographerMainType.update({ where: { id }, data });
    }
    async removeMainType(id) {
        const existing = await this.prisma.photographerMainType.findUnique({ where: { id } });
        if (!existing)
            throw new common_1.NotFoundException(`Main type #${id} not found`);
        return this.prisma.photographerMainType.delete({ where: { id } });
    }
    async findSubTypesByMain(mainTypeId) {
        return this.prisma.photographerSubType.findMany({
            where: { mainTypeId },
            orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
        });
    }
    async createSubType(data) {
        return this.prisma.photographerSubType.create({ data });
    }
    async updateSubType(id, data) {
        const existing = await this.prisma.photographerSubType.findUnique({ where: { id } });
        if (!existing)
            throw new common_1.NotFoundException(`Sub type #${id} not found`);
        return this.prisma.photographerSubType.update({ where: { id }, data });
    }
    async removeSubType(id) {
        const existing = await this.prisma.photographerSubType.findUnique({ where: { id } });
        if (!existing)
            throw new common_1.NotFoundException(`Sub type #${id} not found`);
        return this.prisma.photographerSubType.delete({ where: { id } });
    }
};
exports.PhotographerTypeService = PhotographerTypeService;
exports.PhotographerTypeService = PhotographerTypeService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PhotographerTypeService);
//# sourceMappingURL=photographer-type.service.js.map