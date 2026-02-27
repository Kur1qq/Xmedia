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
exports.EditTypeService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
let EditTypeService = class EditTypeService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAllMainTypes() {
        return this.prisma.editMainType.findMany({
            orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
            include: {
                subTypes: { orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }] },
                _count: { select: { services: true } },
            },
        });
    }
    async createMainType(data) {
        return this.prisma.editMainType.create({ data });
    }
    async updateMainType(id, data) {
        const existing = await this.prisma.editMainType.findUnique({ where: { id } });
        if (!existing)
            throw new common_1.NotFoundException(`EditMainType #${id} not found`);
        return this.prisma.editMainType.update({ where: { id }, data });
    }
    async removeMainType(id) {
        const existing = await this.prisma.editMainType.findUnique({ where: { id } });
        if (!existing)
            throw new common_1.NotFoundException(`EditMainType #${id} not found`);
        return this.prisma.editMainType.delete({ where: { id } });
    }
    async createSubType(data) {
        return this.prisma.editSubType.create({ data });
    }
    async updateSubType(id, data) {
        const existing = await this.prisma.editSubType.findUnique({ where: { id } });
        if (!existing)
            throw new common_1.NotFoundException(`EditSubType #${id} not found`);
        return this.prisma.editSubType.update({ where: { id }, data });
    }
    async removeSubType(id) {
        const existing = await this.prisma.editSubType.findUnique({ where: { id } });
        if (!existing)
            throw new common_1.NotFoundException(`EditSubType #${id} not found`);
        return this.prisma.editSubType.delete({ where: { id } });
    }
};
exports.EditTypeService = EditTypeService;
exports.EditTypeService = EditTypeService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], EditTypeService);
//# sourceMappingURL=edit-type.service.js.map