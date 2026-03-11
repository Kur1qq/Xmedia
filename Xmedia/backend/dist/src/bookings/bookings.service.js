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
var BookingsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingsService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const prisma_service_1 = require("../prisma.service");
const byl_payment_service_1 = require("./byl-payment.service");
const mail_service_1 = require("./mail.service");
const invoice_service_1 = require("./invoice.service");
const admin_notification_service_1 = require("../admin/admin-notification.service");
let BookingsService = BookingsService_1 = class BookingsService {
    prisma;
    bylPayment;
    mailService;
    invoiceService;
    adminNotificationService;
    logger = new common_1.Logger(BookingsService_1.name);
    constructor(prisma, bylPayment, mailService, invoiceService, adminNotificationService) {
        this.prisma = prisma;
        this.bylPayment = bylPayment;
        this.mailService = mailService;
        this.invoiceService = invoiceService;
        this.adminNotificationService = adminNotificationService;
    }
    async findAll() {
        return this.prisma.booking.findMany({
            where: { paymentStatus: 'PAID' },
            include: {
                user: { select: { id: true, username: true, email: true, phone: true } },
                items: { include: { service: true, studio: true, photographerService: true, editService: true, liveService: true } },
                payments: true,
            },
            orderBy: { createdAt: 'desc' }
        });
    }
    async findAllRaw() {
        return this.prisma.booking.findMany({
            include: {
                user: { select: { id: true, username: true, email: true, phone: true } },
                items: { include: { service: true, studio: true, photographerService: true, editService: true, liveService: true } },
                payments: true,
            },
            orderBy: { createdAt: 'desc' }
        });
    }
    async cleanupExpiredBookings() {
        this.logger.log('Running cleanup mechanism for expired pending bookings...');
        const fourteenDaysAgo = new Date();
        fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
        try {
            const expiredBookings = await this.prisma.booking.findMany({
                where: {
                    status: 'PENDING',
                    paymentStatus: 'UNPAID',
                    createdAt: {
                        lt: fourteenDaysAgo
                    }
                },
                select: { id: true }
            });
            if (expiredBookings.length === 0) {
                this.logger.log('No expired pending bookings found to clean up.');
                return;
            }
            const bookingIds = expiredBookings.map(b => b.id);
            const result = await this.prisma.booking.deleteMany({
                where: {
                    id: {
                        in: bookingIds
                    }
                }
            });
            this.logger.log(`Successfully deleted ${result.count} expired pending bookings older than 14 days: ${bookingIds.join(', ')}`);
        }
        catch (error) {
            this.logger.error('Error occurred while cleaning up expired bookings', error);
        }
    }
    async findPending() {
        return this.prisma.booking.findMany({
            where: {
                paymentStatus: { not: 'PAID' },
                status: { not: 'CANCELLED' },
            },
            include: {
                user: { select: { id: true, username: true, email: true, phone: true } },
                items: { include: { service: true, studio: true, photographerService: true, editService: true, liveService: true } },
                payments: true,
            },
            orderBy: { createdAt: 'desc' }
        });
    }
    async findCancelled() {
        return this.prisma.booking.findMany({
            where: {
                status: 'CANCELLED',
            },
            include: {
                user: { select: { id: true, username: true, email: true, phone: true } },
                items: { include: { service: true, studio: true, photographerService: true, editService: true, liveService: true } },
                payments: true,
            },
            orderBy: { createdAt: 'desc' }
        });
    }
    async findByUserId(userId) {
        return this.prisma.booking.findMany({
            where: { userId },
            include: {
                items: { include: { service: true, studio: true, photographerService: true, editService: true, liveService: true, bundleService: true } },
                payments: true,
            },
            orderBy: { createdAt: 'desc' }
        });
    }
    async createGuestBooking(dto) {
        let user = null;
        if (dto.userId) {
            user = await this.prisma.user.findUnique({ where: { id: dto.userId } });
        }
        if (!user && dto.email) {
            user = await this.prisma.user.findFirst({ where: { email: dto.email } });
        }
        if (!user) {
            user = await this.prisma.user.findFirst({ where: { phone: dto.phone } });
        }
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
        const bookingDate = dto.date.slice(0, 10);
        const [h, m] = dto.time.split(':').map(Number);
        const startDate = new Date(`1970-01-01T${dto.time}:00`);
        const endDate = new Date(startDate.getTime() + dto.duration * 3600000);
        const toTimeStr = (d) => d.toTimeString().slice(0, 8);
        const startTime = toTimeStr(startDate);
        const endTime = toTimeStr(endDate);
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
        if (dto.paymentType === 'invoice') {
            this.sendInvoiceForBooking(booking.id, dto.name, dto.email, dto.phone, [{ description: dto.serviceName || dto.serviceType, quantity: dto.duration, unitPrice: dto.unitPrice, totalPrice: total }], new Date().toISOString().slice(0, 10), { buyerOrg: dto.buyerOrg, buyerOrgReg: dto.buyerOrgReg, buyerOrgAddress: dto.buyerOrgAddress, buyerOrgPhone: dto.buyerOrgPhone }).catch(err => this.logger.error(`Failed to send invoice async: ${err.message}`));
            if (dto.email) {
                this.mailService.sendOrderConfirmationEmail(dto.email, booking.id, dto.name, total, 1)
                    .catch(err => this.logger.error(`Failed to send confirmation email async: ${err.message}`));
            }
            return { ...booking, checkoutUrl: null };
        }
        try {
            const clientBaseUrl = process.env.CLIENT_URL || 'https://xtudio-six.vercel.app';
            const checkout = await this.bylPayment.createCheckout({
                bookingId: booking.id,
                amount: total,
                serviceName: dto.serviceName || dto.serviceType,
                quantity: 1,
                customerEmail: dto.email,
                successUrl: `${clientBaseUrl}/booking/success?bookingId=${booking.id}`,
                cancelUrl: `${clientBaseUrl}/booking/cancel`,
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
            this.sendInvoiceForBooking(booking.id, dto.name, dto.email, dto.phone, [{ description: dto.serviceName || dto.serviceType, quantity: dto.duration, unitPrice: dto.unitPrice, totalPrice: total }], new Date().toISOString().slice(0, 10), { buyerOrg: dto.buyerOrg, buyerOrgReg: dto.buyerOrgReg, buyerOrgAddress: dto.buyerOrgAddress, buyerOrgPhone: dto.buyerOrgPhone }).catch(err => this.logger.error(`Failed to send invoice async: ${err.message}`));
            return { ...booking, checkoutUrl: null };
        }
    }
    async createCartBooking(dto) {
        let user = null;
        if (dto.userId) {
            user = await this.prisma.user.findUnique({ where: { id: dto.userId } });
        }
        if (!user && dto.email) {
            user = await this.prisma.user.findFirst({ where: { email: dto.email } });
        }
        if (!user) {
            user = await this.prisma.user.findFirst({ where: { phone: dto.phone } });
        }
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
            const bookingDate = item.date.slice(0, 10);
            const startDate2 = new Date(`1970-01-01T${item.time}:00`);
            const endDate2 = new Date(startDate2.getTime() + item.duration * 3600000);
            const toTimeStr2 = (d) => d.toTimeString().slice(0, 8);
            const startTime = toTimeStr2(startDate2);
            const endTime = toTimeStr2(endDate2);
            const total = item.unitPrice * item.duration;
            totalAmount += total;
            const bookingItemData = {
                itemType: item.serviceType,
                quantity: item.duration,
                unitPrice: item.unitPrice,
                totalPrice: total,
                bookingDate,
                startTime,
                endTime,
            };
            switch (item.serviceType) {
                case 'STUDIO':
                    bookingItemData.studioId = item.serviceId;
                    break;
                case 'LIVE_SERVICE':
                    bookingItemData.liveServiceId = item.serviceId;
                    break;
                case 'PHOTOGRAPHER_SERVICE':
                    bookingItemData.photographerServiceId = item.serviceId;
                    break;
                case 'EDIT_SERVICE':
                    bookingItemData.editServiceId = item.serviceId;
                    break;
                case 'BUNDLE_SERVICE':
                    bookingItemData.bundleServiceId = item.serviceId;
                    break;
            }
            return bookingItemData;
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
        if (dto.paymentType === 'invoice') {
            const invoiceItems = dto.items.map(i => ({
                description: i.serviceName || i.serviceType,
                quantity: i.duration,
                unitPrice: i.unitPrice,
                totalPrice: i.unitPrice * i.duration,
            }));
            this.sendInvoiceForBooking(booking.id, dto.name, dto.email, dto.phone, invoiceItems, new Date().toISOString().slice(0, 10)).catch(err => this.logger.error(`Failed to send invoice async: ${err.message}`));
            if (dto.email) {
                this.mailService.sendOrderConfirmationEmail(dto.email, booking.id, dto.name, totalAmount, dto.items.length)
                    .catch(err => this.logger.error(`Failed to send confirmation email async: ${err.message}`));
            }
            return { ...booking, checkoutUrl: null };
        }
        try {
            const clientBaseUrl = process.env.CLIENT_URL || 'https://xtudio-six.vercel.app';
            const checkout = await this.bylPayment.createCheckout({
                bookingId: booking.id,
                amount: totalAmount,
                serviceName: `Xmedia багц (${dto.items.length} үйлчилгээ)`,
                items: dto.items.map(i => ({
                    name: i.serviceName || i.serviceType,
                    amount: i.unitPrice,
                    quantity: i.duration,
                })),
                quantity: 1,
                customerEmail: dto.email,
                successUrl: `${clientBaseUrl}/booking/success?bookingId=${booking.id}`,
                cancelUrl: `${clientBaseUrl}/booking/cancel`,
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
            const invoiceItems = dto.items.map(i => ({
                description: i.serviceName || i.serviceType,
                quantity: i.duration,
                unitPrice: i.unitPrice,
                totalPrice: i.unitPrice * i.duration,
            }));
            this.sendInvoiceForBooking(booking.id, dto.name, dto.email, dto.phone, invoiceItems, dto.items[0]?.date || new Date().toISOString().slice(0, 10)).catch(err => this.logger.error(`Failed to send invoice async: ${err.message}`));
            return { ...booking, checkoutUrl: null };
        }
    }
    async sendInvoiceForBooking(bookingId, buyerName, buyerEmail, buyerPhone, items, invoiceDate, buyerOrgInfo) {
        if (!buyerEmail || !buyerEmail.includes('@')) {
            this.logger.warn(`No valid email for booking #${bookingId} (email: ${buyerEmail}), skipping`);
            return;
        }
        const invoiceData = {
            invoiceNumber: String(bookingId).padStart(5, '0'),
            invoiceDate,
            payByDate: '5 хоног',
            sellerName: process.env.COMPANY_NAME || 'Отек менежмент ХХК',
            sellerAddress: process.env.COMPANY_ADDRESS || 'Улаанбаатар хот',
            sellerPhone: process.env.COMPANY_PHONE || '95905686',
            sellerBank: process.env.COMPANY_BANK || 'Голомт банк',
            sellerBank2: process.env.COMPANY_BANK2 || 'М банк',
            sellerAccount: process.env.COMPANY_ACCOUNT || 'MN-61001500 – 2025138994',
            sellerAccount2: process.env.COMPANY_ACCOUNT2 || 'MN-85003900 - 8000666677',
            sellerReg: process.env.COMPANY_REG || '6959709',
            buyerName: buyerOrgInfo?.buyerOrg ? buyerOrgInfo.buyerOrg : buyerName,
            buyerEmail,
            buyerPhone: buyerOrgInfo?.buyerOrgPhone || buyerPhone,
            buyerReg: buyerOrgInfo?.buyerOrgReg || '',
            buyerAddress: buyerOrgInfo?.buyerOrgAddress || '',
            buyerPersonName: buyerName,
            items,
        };
        const total = items.reduce((s, i) => s + i.totalPrice, 0);
        const subject = `Нэхэмжлэх #${invoiceData.invoiceNumber} — Xmedia`;
        const htmlBody = `
            <div style="font-family:Arial,sans-serif;color:#222;max-width:620px;margin:0 auto">
                <h2 style="color:#e11d48">Xmedia — Нэхэмжлэх</h2>
                <p>Сайн байна уу, <b>${buyerName}</b>!</p>
                <p>Таны <b>₮${total.toLocaleString()}</b> дүнтэй нэхэмжлэхийг хавсаргав (PDF хавсарлаасаа харна уу).</p>
                <p>Нэхэмжлэхийн дугаар: <b>#${invoiceData.invoiceNumber}</b></p>
                <p>Банк: <b>${invoiceData.sellerBank}</b>, Данс: <b>${invoiceData.sellerAccount}</b></p>
                <p>Холбоо барих: <b>${invoiceData.sellerPhone}</b></p>
                <hr style="border:none;border-top:1px solid #eee;margin:16px 0">
                ${this.invoiceService.generateInvoiceHtml(invoiceData)}
            </div>`;
        let pdfBuffer = null;
        try {
            pdfBuffer = await this.invoiceService.generateInvoicePdf(invoiceData);
            this.logger.log(`PDF generated for booking #${bookingId}, size=${pdfBuffer.length}`);
        }
        catch (pdfErr) {
            this.logger.error(`PDF generation failed for #${bookingId}: ${pdfErr.message}`);
        }
        try {
            if (pdfBuffer) {
                await this.mailService.sendInvoiceEmail(buyerEmail, subject, htmlBody, pdfBuffer, `invoice-${bookingId}.pdf`);
            }
            else {
                await this.mailService.sendInvoiceEmail(buyerEmail, subject, htmlBody, null, null);
            }
            this.logger.log(`Invoice email sent to ${buyerEmail} for booking #${bookingId}`);
        }
        catch (mailErr) {
            this.logger.error(`SMTP failed for booking #${bookingId}: ${mailErr.message}`);
        }
    }
    async createManualBooking(dto) {
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
        const bookingDate = dto.date.slice(0, 10);
        const start = new Date(`1970-01-01T${dto.startTime}:00`);
        const end = new Date(`1970-01-01T${dto.endTime}:00`);
        const durationHours = (end.getTime() - start.getTime()) / 3600000;
        const unitPrice = dto.totalAmount / (durationHours || 1);
        const itemData = {
            itemType: dto.serviceType,
            quantity: durationHours,
            unitPrice,
            totalPrice: dto.totalAmount,
            bookingDate,
            startTime: `${dto.startTime}:00`,
            endTime: `${dto.endTime}:00`,
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
                totalAmount: dto.totalAmount,
                notes: dto.notes,
                status: dto.status,
                paymentStatus: dto.paymentStatus,
                items: { create: [itemData] },
            },
            include: { items: true, user: true }
        });
        return booking;
    }
    async confirmPayment(bylCheckoutId) {
        const payment = await this.prisma.payment.findUnique({
            where: { invoiceId: bylCheckoutId },
            include: { booking: { include: { user: true, items: true } } },
        });
        if (!payment) {
            throw new common_1.NotFoundException(`Payment with Byl checkout ID ${bylCheckoutId} not found`);
        }
        const wasAlreadyPaid = payment.status === 'PAID';
        await this.prisma.payment.update({
            where: { id: payment.id },
            data: {
                status: 'PAID',
                paidAt: new Date(),
            },
        });
        const updatedBooking = await this.prisma.booking.update({
            where: { id: payment.bookingId },
            data: {
                paymentStatus: 'PAID',
                status: 'CONFIRMED',
            },
            include: { user: true, items: true }
        });
        if (!wasAlreadyPaid && updatedBooking.user?.email) {
            this.mailService.sendOrderConfirmationEmail(updatedBooking.user.email, updatedBooking.id, updatedBooking.user.username, Number(updatedBooking.totalAmount), updatedBooking.items.length).catch(err => this.logger.error(`Async email failed: ${err.message}`));
        }
        return { success: true, bookingId: payment.bookingId };
    }
    async verifyAndConfirmPayment(bookingId) {
        const payment = await this.prisma.payment.findFirst({
            where: { bookingId },
            include: { booking: { include: { user: true, items: true } } },
        });
        if (!payment) {
            throw new common_1.NotFoundException(`Payment for booking #${bookingId} not found`);
        }
        if (payment.status === 'PAID') {
            const booking = payment.booking;
            if (booking?.user?.email) {
                await this.mailService.sendOrderConfirmationEmail(booking.user.email, bookingId, booking.user.username, Number(booking.totalAmount), booking.items?.length ?? 1).catch(err => this.logger.warn(`Email resend failed for booking #${bookingId}: ${err.message}`));
            }
            return { success: true, bookingId, alreadyPaid: true };
        }
        const bylStatus = await this.bylPayment.getCheckoutStatus(payment.invoiceId);
        const statusStr = bylStatus?.status?.toLowerCase();
        if (statusStr === 'complete' || statusStr === 'paid' || statusStr === 'success') {
            return this.confirmPayment(payment.invoiceId);
        }
        return {
            success: false,
            bookingId,
            bylStatus: bylStatus.status,
            message: `Checkout status: ${bylStatus.status}`,
        };
    }
    async getBookedSlots(serviceType, serviceId, date) {
        const bookingDate = new Date(date).toISOString().slice(0, 10);
        const serviceWhere = { itemType: serviceType, bookingDate };
        if (serviceType === 'STUDIO')
            serviceWhere.studioId = serviceId;
        if (serviceType === 'LIVE_SERVICE')
            serviceWhere.liveServiceId = serviceId;
        if (serviceType === 'PHOTOGRAPHER_SERVICE')
            serviceWhere.photographerServiceId = serviceId;
        if (serviceType === 'EDIT_SERVICE')
            serviceWhere.serviceId = serviceId;
        const items = await this.prisma.bookingItem.findMany({
            where: {
                ...serviceWhere,
                booking: { status: { not: 'CANCELLED' } },
                startTime: { not: null },
                endTime: { not: null },
            },
            select: { startTime: true, endTime: true },
        });
        const ALL_TIMES = [
            '09:00', '10:00', '11:00', '12:00', '13:00',
            '14:00', '15:00', '16:00', '17:00', '18:00',
            '19:00', '20:00', '21:00',
        ];
        const bookedTimes = [];
        for (const time of ALL_TIMES) {
            const [h, m] = time.split(':').map(Number);
            const slotStart = h * 60 + m;
            const slotEnd = slotStart + 60;
            const overlaps = items.some(item => {
                if (!item.startTime || !item.endTime)
                    return false;
                const s = new Date(`1970-01-01T${item.startTime}`);
                const e = new Date(`1970-01-01T${item.endTime}`);
                const bookedStart = s.getHours() * 60 + s.getMinutes();
                const bookedEnd = e.getHours() * 60 + e.getMinutes();
                return slotStart < bookedEnd && slotEnd > bookedStart;
            });
            if (overlaps)
                bookedTimes.push(time);
        }
        return bookedTimes;
    }
    async updateStatus(id, status) {
        const booking = await this.prisma.booking.findUnique({ where: { id } });
        if (!booking) {
            throw new common_1.NotFoundException(`Booking with ID ${id} not found`);
        }
        const updated = await this.prisma.booking.update({
            where: { id },
            data: { status },
            include: {
                user: true,
                items: true,
            }
        });
        if (status === 'CANCELLED') {
            await this.adminNotificationService.createNotification('ORDER_CANCELLED', `Захиалга ORD-${id.toString().padStart(4, '0')} цуцлагдлаа`, id);
        }
        if (status === 'CONFIRMED' && booking.status !== 'CONFIRMED' && updated.user?.email) {
            await this.mailService.sendOrderConfirmationEmail(updated.user.email, updated.id, updated.user.username, Number(updated.totalAmount), updated.items.length);
        }
        return updated;
    }
    async updateNotes(id, notes) {
        const booking = await this.prisma.booking.findUnique({ where: { id } });
        if (!booking) {
            throw new common_1.NotFoundException(`Booking with ID ${id} not found`);
        }
        const updated = await this.prisma.booking.update({
            where: { id },
            data: { notes },
            include: {
                user: true,
                items: true,
            }
        });
        return updated;
    }
    async updatePaymentStatus(id, paymentStatus) {
        const booking = await this.prisma.booking.findUnique({ where: { id }, include: { user: true, items: true } });
        if (!booking) {
            throw new common_1.NotFoundException(`Booking with ID ${id} not found`);
        }
        const updated = await this.prisma.booking.update({
            where: { id },
            data: { paymentStatus },
            include: {
                user: true,
                items: true,
            }
        });
        if (paymentStatus === 'PAID' && booking.paymentStatus !== 'PAID') {
            if (updated.user?.email) {
                await this.mailService.sendOrderConfirmationEmail(updated.user.email, updated.id, updated.user.username, Number(updated.totalAmount), updated.items.length);
            }
        }
        return updated;
    }
};
exports.BookingsService = BookingsService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_MIDNIGHT),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BookingsService.prototype, "cleanupExpiredBookings", null);
exports.BookingsService = BookingsService = BookingsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        byl_payment_service_1.BylPaymentService,
        mail_service_1.MailService,
        invoice_service_1.InvoiceService,
        admin_notification_service_1.AdminNotificationService])
], BookingsService);
//# sourceMappingURL=bookings.service.js.map