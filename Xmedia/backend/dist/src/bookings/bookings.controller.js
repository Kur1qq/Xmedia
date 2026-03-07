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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var BookingsController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingsController = void 0;
const common_1 = require("@nestjs/common");
const bookings_service_1 = require("./bookings.service");
const client_1 = require("@prisma/client");
const admin_log_service_1 = require("../admin/admin-log.service");
const byl_payment_service_1 = require("./byl-payment.service");
const jwt_auth_guard_1 = require("../admin/jwt-auth.guard");
let BookingsController = BookingsController_1 = class BookingsController {
    bookingsService;
    log;
    bylPayment;
    logger = new common_1.Logger(BookingsController_1.name);
    constructor(bookingsService, log, bylPayment) {
        this.bookingsService = bookingsService;
        this.log = log;
        this.bylPayment = bylPayment;
    }
    async findAll() { return this.bookingsService.findAll(); }
    async getPendingBookings() {
        return this.bookingsService.findPending();
    }
    async getCancelledBookings() {
        return this.bookingsService.findCancelled();
    }
    async findByUser(userId) {
        return this.bookingsService.findByUserId(userId);
    }
    async getAvailableSlots(serviceType, serviceId, date) {
        const bookedTimes = await this.bookingsService.getBookedSlots(serviceType, Number(serviceId), date);
        return { bookedTimes };
    }
    async createManualBooking(dto, req) {
        const result = await this.bookingsService.createManualBooking({
            ...dto,
            serviceId: Number(dto.serviceId),
            totalAmount: Number(dto.totalAmount)
        });
        await this.log.log(req.user?.id ?? 0, 'MANUAL_BOOKING_CREATE', 'Booking', result.id, `Created manual booking by admin`, req.ip).catch(() => { });
        return result;
    }
    async createCartBooking(dto) {
        return this.bookingsService.createCartBooking(dto);
    }
    async createGuest(dto) {
        return this.bookingsService.createGuestBooking(dto);
    }
    async verifyPayment(id) {
        return this.bookingsService.verifyAndConfirmPayment(id);
    }
    async bylWebhook(body, signature) {
        this.logger.log(`Byl webhook received: type=${body?.type}, checkout_id=${body?.data?.object?.id}`);
        if (body?.type === 'checkout.completed') {
            const checkoutId = String(body.data.object.id);
            try {
                const result = await this.bookingsService.confirmPayment(checkoutId);
                this.logger.log(`Payment confirmed for booking #${result.bookingId}`);
                return { success: true };
            }
            catch (error) {
                this.logger.error(`Failed to confirm payment: ${error.message}`);
                return { success: false, error: error.message };
            }
        }
        return { success: true, message: 'Event received' };
    }
    async updateStatus(id, status, req) {
        const result = await this.bookingsService.updateStatus(id, status);
        this.log.log(req.user?.id ?? 0, 'BOOKING_STATUS_UPDATE', 'Booking', id, `status=${status}`, req.ip).catch(() => { });
        return result;
    }
    async updateNotes(id, notes, req) {
        const result = await this.bookingsService.updateNotes(id, notes);
        this.log.log(req.user?.id ?? 0, 'BOOKING_NOTES_UPDATE', 'Booking', id, `Updated notes`, req.ip).catch(() => { });
        return result;
    }
    async updatePaymentStatus(id, paymentStatus, req) {
        const result = await this.bookingsService.updatePaymentStatus(id, paymentStatus);
        this.log.log(req.user?.id ?? 0, 'BOOKING_PAYMENT_UPDATE', 'Booking', id, `paymentStatus=${paymentStatus}`, req.ip).catch(() => { });
        return result;
    }
};
exports.BookingsController = BookingsController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BookingsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('pending'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BookingsController.prototype, "getPendingBookings", null);
__decorate([
    (0, common_1.Get)('cancelled'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BookingsController.prototype, "getCancelledBookings", null);
__decorate([
    (0, common_1.Get)('user/:userId'),
    __param(0, (0, common_1.Param)('userId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], BookingsController.prototype, "findByUser", null);
__decorate([
    (0, common_1.Get)('available-slots'),
    __param(0, (0, common_1.Query)('serviceType')),
    __param(1, (0, common_1.Query)('serviceId')),
    __param(2, (0, common_1.Query)('date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], BookingsController.prototype, "getAvailableSlots", null);
__decorate([
    (0, common_1.UseGuards)((0, jwt_auth_guard_1.RolesGuard)('SUPER_ADMIN', 'ADMIN')),
    (0, common_1.Post)('admin/manual'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], BookingsController.prototype, "createManualBooking", null);
__decorate([
    (0, common_1.Post)('cart'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BookingsController.prototype, "createCartBooking", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BookingsController.prototype, "createGuest", null);
__decorate([
    (0, common_1.Post)(':id/verify-payment'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], BookingsController.prototype, "verifyPayment", null);
__decorate([
    (0, common_1.Post)('webhook/byl'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)('Byl-Signature')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], BookingsController.prototype, "bylWebhook", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)('status')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, Object]),
    __metadata("design:returntype", Promise)
], BookingsController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Patch)(':id/notes'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)('notes')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, Object]),
    __metadata("design:returntype", Promise)
], BookingsController.prototype, "updateNotes", null);
__decorate([
    (0, common_1.Patch)(':id/payment-status'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)('paymentStatus')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, Object]),
    __metadata("design:returntype", Promise)
], BookingsController.prototype, "updatePaymentStatus", null);
exports.BookingsController = BookingsController = BookingsController_1 = __decorate([
    (0, common_1.Controller)('bookings'),
    __metadata("design:paramtypes", [bookings_service_1.BookingsService,
        admin_log_service_1.AdminLogService,
        byl_payment_service_1.BylPaymentService])
], BookingsController);
//# sourceMappingURL=bookings.controller.js.map