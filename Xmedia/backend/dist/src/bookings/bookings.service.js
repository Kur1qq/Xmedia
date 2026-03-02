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
exports.BookingsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
let BookingsService = class BookingsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll() {
        return this.prisma.booking.findMany({
            include: {
                user: { select: { id: true, username: true, email: true, phone: true } },
                items: { include: { service: true, studio: true, photographerService: true, editService: true, liveService: true } },
                payments: true,
            },
            orderBy: { createdAt: 'desc' }
        });
    }
    async createGuestBooking(dto) {
        let user = await this.prisma.user.findFirst({ where: { phone: dto.phone } });
        if (!user) {
            user = await this.prisma.user.create({
                data: {
                    username: dto.name,
                    email: `guest_${dto.phone}@xmedia.guest`,
                    phone: dto.phone,
                    passwordHash: 'GUEST',
                }
            });
        }
        const bookingDate = new Date(dto.date);
        const [h, m] = dto.time.split(':').map(Number);
        const startTime = new Date(`1970-01-01T${dto.time}:00`);
        const endTime = new Date(startTime.getTime() + dto.duration * 3600000);
        const total = dto.unitPrice * dto.duration;
        const itemData = {
            itemType: dto.serviceType,
            quantity: dto.duration,
            unitPrice: dto.unitPrice,
            totalPrice: total,
            bookingDate,
            startTime,
            endTime,
        };
        if (dto.serviceType === 'STUDIO')
            itemData.studioId = dto.serviceId;
        if (dto.serviceType === 'LIVE_SERVICE')
            itemData.liveServiceId = dto.serviceId;
        if (dto.serviceType === 'PHOTOGRAPHER_SERVICE')
            itemData.photographerServiceId = dto.serviceId;
        if (dto.serviceType === 'EDIT_SERVICE')
            itemData.serviceId = dto.serviceId;
        return this.prisma.booking.create({
            data: {
                userId: user.id,
                totalAmount: total,
                notes: dto.notes,
                items: { create: [itemData] },
            },
            include: { items: true }
        });
    }
    async updateStatus(id, status) {
        const booking = await this.prisma.booking.findUnique({ where: { id } });
        if (!booking) {
            throw new common_1.NotFoundException(`Booking with ID ${id} not found`);
        }
        return this.prisma.booking.update({
            where: { id },
            data: { status },
            include: {
                user: true,
                items: true,
            }
        });
    }
};
exports.BookingsService = BookingsService;
exports.BookingsService = BookingsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], BookingsService);
//# sourceMappingURL=bookings.service.js.map