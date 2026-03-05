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
const byl_payment_service_1 = require("./byl-payment.service");
let BookingsService = class BookingsService {
    prisma;
    bylPayment;
    constructor(prisma, bylPayment) {
        this.prisma = prisma;
        this.bylPayment = bylPayment;
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
                    email: dto.email || `guest_${dto.phone}@xmedia.guest`,
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
        const booking = await this.prisma.booking.create({
            data: {
                userId: user.id,
                totalAmount: total,
                notes: dto.notes,
                items: { create: [itemData] },
            },
            include: { items: true }
        });
        try {
            const checkout = await this.bylPayment.createCheckout({
                bookingId: booking.id,
                amount: total,
                serviceName: dto.serviceName || dto.serviceType,
                quantity: 1,
                customerEmail: dto.email,
            });
            await this.prisma.payment.create({
                data: {
                    bookingId: booking.id,
                    invoiceId: String(checkout.checkoutId),
                    amount: total,
                    status: 'UNPAID',
                }
            });
            return { ...booking, checkoutUrl: checkout.checkoutUrl };
        }
        catch (error) {
            return { ...booking, checkoutUrl: null, paymentError: error.message };
        }
    }
    async createCartBooking(dto) {
        let user = await this.prisma.user.findFirst({ where: { phone: dto.phone } });
        if (!user) {
            user = await this.prisma.user.create({
                data: {
                    username: dto.name,
                    email: dto.email || `guest_${dto.phone}@xmedia.guest`,
                    phone: dto.phone,
                    passwordHash: 'GUEST',
                }
            });
        }
        let totalAmount = 0;
        const prismaItems = dto.items.map(item => {
            const bookingDate = new Date(item.date);
            const startTime = new Date(`1970-01-01T${item.time}:00`);
            const endTime = new Date(startTime.getTime() + item.duration * 3600000);
            const total = item.unitPrice * item.duration;
            totalAmount += total;
            const itemData = {
                itemType: item.serviceType,
                quantity: item.duration,
                unitPrice: item.unitPrice,
                totalPrice: total,
                bookingDate,
                startTime,
                endTime,
            };
            if (item.serviceType === 'STUDIO')
                itemData.studioId = item.serviceId;
            if (item.serviceType === 'LIVE_SERVICE')
                itemData.liveServiceId = item.serviceId;
            if (item.serviceType === 'PHOTOGRAPHER_SERVICE')
                itemData.photographerServiceId = item.serviceId;
            if (item.serviceType === 'EDIT_SERVICE')
                itemData.serviceId = item.serviceId;
            return itemData;
        });
        const booking = await this.prisma.booking.create({
            data: {
                userId: user.id,
                totalAmount,
                notes: dto.notes,
                items: { create: prismaItems },
            },
            include: { items: true }
        });
        try {
            const checkout = await this.bylPayment.createCheckout({
                bookingId: booking.id,
                amount: totalAmount,
                serviceName: `Xmedia багц (${dto.items.length} үйлчилгээ)`,
                quantity: 1,
                customerEmail: dto.email,
            });
            await this.prisma.payment.create({
                data: {
                    bookingId: booking.id,
                    invoiceId: String(checkout.checkoutId),
                    amount: totalAmount,
                    status: 'UNPAID',
                }
            });
            return { ...booking, checkoutUrl: checkout.checkoutUrl };
        }
        catch (error) {
            return { ...booking, checkoutUrl: null, paymentError: error.message };
        }
    }
    async confirmPayment(bylCheckoutId) {
        const payment = await this.prisma.payment.findUnique({
            where: { invoiceId: bylCheckoutId },
            include: { booking: true },
        });
        if (!payment) {
            throw new common_1.NotFoundException(`Payment with Byl checkout ID ${bylCheckoutId} not found`);
        }
        await this.prisma.payment.update({
            where: { id: payment.id },
            data: {
                status: 'PAID',
                paidAt: new Date(),
            },
        });
        await this.prisma.booking.update({
            where: { id: payment.bookingId },
            data: {
                paymentStatus: 'PAID',
                status: 'CONFIRMED',
            },
        });
        return { success: true, bookingId: payment.bookingId };
    }
    async verifyAndConfirmPayment(bookingId) {
        const payment = await this.prisma.payment.findFirst({
            where: { bookingId },
            include: { booking: true },
        });
        if (!payment) {
            throw new common_1.NotFoundException(`Payment for booking #${bookingId} not found`);
        }
        if (payment.status === 'PAID') {
            return { success: true, bookingId, alreadyPaid: true };
        }
        const bylStatus = await this.bylPayment.getCheckoutStatus(payment.invoiceId);
        if (bylStatus.status === 'complete') {
            return this.confirmPayment(payment.invoiceId);
        }
        return {
            success: false,
            bookingId,
            bylStatus: bylStatus.status,
            message: `Checkout status: ${bylStatus.status}`,
        };
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
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        byl_payment_service_1.BylPaymentService])
], BookingsService);
//# sourceMappingURL=bookings.service.js.map