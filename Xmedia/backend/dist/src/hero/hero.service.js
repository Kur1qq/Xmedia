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
exports.HeroService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
let HeroService = class HeroService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll() {
        return this.prisma.heroSlide.findMany({
            orderBy: { order: 'asc' },
        });
    }
    async findActive() {
        return this.prisma.heroSlide.findMany({
            where: { isActive: true },
            orderBy: { order: 'asc' },
        });
    }
    async findOne(id) {
        const slide = await this.prisma.heroSlide.findUnique({
            where: { id },
        });
        if (!slide)
            throw new common_1.NotFoundException('Hero slide not found');
        return slide;
    }
    async create(data) {
        return this.prisma.heroSlide.create({
            data: {
                title: data.title || '',
                highlight: data.highlight,
                subTitle: data.subTitle,
                description: data.description,
                image: data.image || '',
                order: data.order !== undefined ? parseInt(data.order, 10) : 0,
                isActive: data.isActive !== undefined ? data.isActive : true,
            },
        });
    }
    async update(id, data) {
        await this.findOne(id);
        const updateData = {};
        if (data.title !== undefined)
            updateData.title = data.title;
        if (data.highlight !== undefined)
            updateData.highlight = data.highlight;
        if (data.subTitle !== undefined)
            updateData.subTitle = data.subTitle;
        if (data.description !== undefined)
            updateData.description = data.description;
        if (data.image !== undefined)
            updateData.image = data.image;
        if (data.order !== undefined)
            updateData.order = parseInt(data.order, 10);
        if (data.isActive !== undefined)
            updateData.isActive = data.isActive;
        return this.prisma.heroSlide.update({
            where: { id },
            data: updateData,
        });
    }
    async remove(id) {
        await this.findOne(id);
        return this.prisma.heroSlide.delete({
            where: { id },
        });
    }
};
exports.HeroService = HeroService;
exports.HeroService = HeroService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], HeroService);
//# sourceMappingURL=hero.service.js.map