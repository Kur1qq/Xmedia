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
exports.EditServiceService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
let EditServiceService = class EditServiceService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll() {
        return this.prisma.editService.findMany({
            orderBy: { createdAt: 'desc' },
            include: { category: true, mainType: true, subType: true },
        });
    }
    async findOne(id) {
        const item = await this.prisma.editService.findUnique({
            where: { id },
            include: { category: true, mainType: true, subType: true },
        });
        if (!item)
            throw new common_1.NotFoundException(`EditService #${id} not found`);
        return item;
    }
    async create(data) {
        const { categoryId, mainTypeId, subTypeId, ...rest } = data;
        return this.prisma.editService.create({
            data: {
                ...rest,
                category: { connect: { id: categoryId } },
                mainType: { connect: { id: mainTypeId } },
                ...(subTypeId ? { subType: { connect: { id: subTypeId } } } : {}),
            },
            include: { category: true, mainType: true, subType: true },
        });
    }
    async update(id, data) {
        await this.findOne(id);
        const { categoryId, mainTypeId, subTypeId, ...rest } = data;
        return this.prisma.editService.update({
            where: { id },
            data: {
                ...rest,
                ...(categoryId ? { category: { connect: { id: categoryId } } } : {}),
                ...(mainTypeId ? { mainType: { connect: { id: mainTypeId } } } : {}),
                ...(subTypeId === null ? { subType: { disconnect: true } } : subTypeId ? { subType: { connect: { id: subTypeId } } } : {}),
            },
            include: { category: true, mainType: true, subType: true },
        });
    }
    async remove(id) {
        await this.findOne(id);
        return this.prisma.editService.delete({ where: { id } });
    }
};
exports.EditServiceService = EditServiceService;
exports.EditServiceService = EditServiceService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], EditServiceService);
//# sourceMappingURL=edit-service.service.js.map