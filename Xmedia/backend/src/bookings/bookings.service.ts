import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { BookingStatus, ItemType, PaymentStatus } from '@prisma/client';
import { BylPaymentService } from './byl-payment.service';
import { MailService } from './mail.service';
import { InvoiceService } from './invoice.service';

@Injectable()
export class BookingsService {
    private readonly logger = new Logger(BookingsService.name);
    constructor(
        private prisma: PrismaService,
        private bylPayment: BylPaymentService,
        private mailService: MailService,
        private invoiceService: InvoiceService,
    ) { }

    // Find all bookings (only PAID — for admin bookings section)
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

    // Find ALL bookings regardless of payment status (internal use)
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

    // Find pending (invoice/unpaid) bookings
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

    // Find bookings by user ID
    async findByUserId(userId: number) {
        return this.prisma.booking.findMany({
            where: { userId },
            include: {
                items: { include: { service: true, studio: true, photographerService: true, editService: true, liveService: true } },
                payments: true,
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    // Guest booking — no auth required, returns checkout URL
    async createGuestBooking(dto: {
        name: string;
        phone: string;
        email?: string;
        date: string;     // 'YYYY-MM-DD'
        time: string;     // 'HH:MM'
        duration: number; // hours
        serviceType: 'STUDIO' | 'LIVE_SERVICE' | 'PHOTOGRAPHER_SERVICE' | 'EDIT_SERVICE';
        serviceId: number;
        unitPrice: number;
        notes?: string;
        serviceName?: string;
        paymentType?: 'qpay' | 'invoice'; // new
    }) {
        // Find or create a guest user by phone
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

        const itemData: any = {
            itemType: dto.serviceType as ItemType,
            quantity: dto.duration,
            unitPrice: dto.unitPrice,
            totalPrice: total,
            bookingDate,
            startTime,
            endTime,
        };

        if (dto.serviceType === 'STUDIO') itemData.studioId = dto.serviceId;
        if (dto.serviceType === 'LIVE_SERVICE') itemData.liveServiceId = dto.serviceId;
        if (dto.serviceType === 'PHOTOGRAPHER_SERVICE') itemData.photographerServiceId = dto.serviceId;
        if (dto.serviceType === 'EDIT_SERVICE') itemData.serviceId = dto.serviceId;

        const booking = await this.prisma.booking.create({
            data: {
                userId: user.id,
                totalAmount: total,
                notes: dto.notes,
                items: { create: [itemData] },
            },
            include: { items: true }
        });

        // Invoice path — skip Byl, email PDF directly
        if (dto.paymentType === 'invoice') {
            await this.sendInvoiceForBooking(
                booking.id, dto.name, dto.email, dto.phone,
                [{ description: dto.serviceName || dto.serviceType, quantity: dto.duration, unitPrice: dto.unitPrice, totalPrice: total }],
                dto.date,
            );
            return { ...booking, checkoutUrl: null };
        }

        // QPay path — create Byl checkout
        try {
            const clientBaseUrl = process.env.CLIENT_URL || 'https://xmedia-six.vercel.app';
            const checkout = await this.bylPayment.createCheckout({
                bookingId: booking.id,
                amount: total,
                serviceName: dto.serviceName || dto.serviceType,
                quantity: 1,
                customerEmail: dto.email,
                successUrl: `${clientBaseUrl}/booking/success?bookingId=${booking.id}`,
                cancelUrl: `${clientBaseUrl}/booking/cancel`,
            });

            // Save checkout ID in payment record
            await this.prisma.payment.create({
                data: {
                    bookingId: booking.id,
                    invoiceId: String(checkout.checkoutId),
                    amount: total,
                    status: 'UNPAID',
                }
            });

            return { ...booking, checkoutUrl: checkout.checkoutUrl };
        } catch (error) {
            // Byl failed — send invoice PDF by email instead
            await this.sendInvoiceForBooking(
                booking.id, dto.name, dto.email, dto.phone,
                [{ description: dto.serviceName || dto.serviceType, quantity: dto.duration, unitPrice: dto.unitPrice, totalPrice: total }],
                dto.date,
            );
            return { ...booking, checkoutUrl: null };
        }
    }

    // Cart booking — multi-items, guest or auth
    async createCartBooking(dto: {
        name: string;
        phone: string;
        email?: string;
        notes?: string;
        items: Array<{
            date: string;     // 'YYYY-MM-DD'
            time: string;     // 'HH:MM'
            duration: number; // hours
            serviceType: 'STUDIO' | 'LIVE_SERVICE' | 'PHOTOGRAPHER_SERVICE' | 'EDIT_SERVICE';
            serviceId: number;
            unitPrice: number;
            serviceName?: string;
        }>;
        paymentType?: 'qpay' | 'invoice'; // new
    }) {
        // Find or create a user by phone
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

            const itemData: any = {
                itemType: item.serviceType as ItemType,
                quantity: item.duration,
                unitPrice: item.unitPrice,
                totalPrice: total,
                bookingDate,
                startTime,
                endTime,
            };

            if (item.serviceType === 'STUDIO') itemData.studioId = item.serviceId;
            if (item.serviceType === 'LIVE_SERVICE') itemData.liveServiceId = item.serviceId;
            if (item.serviceType === 'PHOTOGRAPHER_SERVICE') itemData.photographerServiceId = item.serviceId;
            if (item.serviceType === 'EDIT_SERVICE') itemData.serviceId = item.serviceId;

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

        // Invoice path — skip Byl, send invoice PDF directly
        if (dto.paymentType === 'invoice') {
            const invoiceItems = dto.items.map(i => ({
                description: i.serviceName || i.serviceType,
                quantity: i.duration,
                unitPrice: i.unitPrice,
                totalPrice: i.unitPrice * i.duration,
            }));
            await this.sendInvoiceForBooking(
                booking.id, dto.name, dto.email, dto.phone,
                invoiceItems, dto.items[0]?.date || new Date().toISOString().slice(0, 10),
            );
            return { ...booking, checkoutUrl: null };
        }

        // QPay path — create Byl checkout
        try {
            const clientBaseUrl = process.env.CLIENT_URL || 'https://xmedia-six.vercel.app';
            const checkout = await this.bylPayment.createCheckout({
                bookingId: booking.id,
                amount: totalAmount,
                serviceName: `Xmedia багц (${dto.items.length} үйлчилгээ)`,
                quantity: 1,
                customerEmail: dto.email,
                successUrl: `${clientBaseUrl}/booking/success?bookingId=${booking.id}`,
                cancelUrl: `${clientBaseUrl}/booking/cancel`,
            });

            // Save checkout ID in payment record
            await this.prisma.payment.create({
                data: {
                    bookingId: booking.id,
                    invoiceId: String(checkout.checkoutId),
                    amount: totalAmount,
                    status: 'UNPAID',
                }
            });

            return { ...booking, checkoutUrl: checkout.checkoutUrl };
        } catch (error) {
            // Byl failed — send invoice PDF by email instead
            const invoiceItems = dto.items.map(i => ({
                description: i.serviceName || i.serviceType,
                quantity: i.duration,
                unitPrice: i.unitPrice,
                totalPrice: i.unitPrice * i.duration,
            }));
            await this.sendInvoiceForBooking(
                booking.id, dto.name, dto.email, dto.phone,
                invoiceItems, dto.items[0]?.date || new Date().toISOString().slice(0, 10),
            );
            return { ...booking, checkoutUrl: null };
        }
    }

    // ─── Private: send invoice PDF email ────────────────────────────────────
    private async sendInvoiceForBooking(
        bookingId: number,
        buyerName: string,
        buyerEmail: string | undefined,
        buyerPhone: string,
        items: { description: string; quantity: number; unitPrice: number; totalPrice: number }[],
        invoiceDate: string,
    ) {
        if (!buyerEmail || !buyerEmail.includes('@') || buyerEmail.includes('@xmedia.guest')) {
            this.logger.warn(`No valid email for booking #${bookingId}, skipping invoice email`);
            return;
        }
        try {
            const pdfBuffer = await this.invoiceService.generateInvoicePdf({
                invoiceNumber: String(bookingId).padStart(5, '0'),
                invoiceDate,
                payByDate: '14 хоног',
                sellerName: process.env.COMPANY_NAME || 'Xmedia Media Production',
                sellerAddress: process.env.COMPANY_ADDRESS || 'Улаанбаатар хот',
                sellerPhone: process.env.COMPANY_PHONE || '99001100',
                sellerBank: process.env.COMPANY_BANK || 'Хаан банк',
                sellerAccount: process.env.COMPANY_ACCOUNT || '5000000000',
                sellerReg: process.env.COMPANY_REG || '1234567',
                buyerName,
                buyerEmail,
                buyerPhone,
                items,
            });
            const filename = `invoice-${bookingId}.pdf`;
            const total = items.reduce((s, i) => s + i.totalPrice, 0);
            await this.mailService.sendInvoiceEmail(
                buyerEmail,
                `Нэхэмжлэх #${String(bookingId).padStart(5, '0')} — Xmedia`,
                `
                    <div style="font-family:sans-serif;font-size:15px;color:#222;">
                        <h2 style="color:#e11d48;">Xmedia — Нэхэмжлэх</h2>
                        <p>Сайн байна уу, <strong>${buyerName}</strong>!</p>
                        <p>Таны <strong>₮${total.toLocaleString()}</strong> дүнтэй нэхэмжлэхийг хавсаргав.</p>
                        <p>Нэхэмжлэхийн дугаар: <strong>#${String(bookingId).padStart(5, '0')}</strong></p>
                        <p>Холбоо барих: <strong>99001100</strong></p>
                        <hr style="border:none;border-top:1px solid #eee;margin:16px 0;">
                        <p style="font-size:12px;color:#888;">Энэхүү имэйл автоматаар үүссэн. Асуух зүйл байвал бидэнтэй холбогдоно уу.</p>
                    </div>
                `,
                pdfBuffer,
                filename,
            );
            this.logger.log(`Invoice email sent for booking #${bookingId}`);
        } catch (err) {
            this.logger.error(`Invoice email failed for booking #${bookingId}`, err);
        }
    }

    // Confirm payment from webhook
    async confirmPayment(bylCheckoutId: string) {
        // Find payment by Byl checkout ID (stored as invoiceId)
        const payment = await this.prisma.payment.findUnique({
            where: { invoiceId: bylCheckoutId },
            include: { booking: true },
        });

        if (!payment) {
            throw new NotFoundException(`Payment with Byl checkout ID ${bylCheckoutId} not found`);
        }

        // Update payment status
        await this.prisma.payment.update({
            where: { id: payment.id },
            data: {
                status: 'PAID',
                paidAt: new Date(),
            },
        });

        // Update booking status
        await this.prisma.booking.update({
            where: { id: payment.bookingId },
            data: {
                paymentStatus: 'PAID',
                status: 'CONFIRMED',
            },
        });

        return { success: true, bookingId: payment.bookingId };
    }

    // Verify payment status from Byl.mn API and confirm if paid
    async verifyAndConfirmPayment(bookingId: number) {
        // Find the payment record for this booking
        const payment = await this.prisma.payment.findFirst({
            where: { bookingId },
            include: { booking: true },
        });

        if (!payment) {
            throw new NotFoundException(`Payment for booking #${bookingId} not found`);
        }

        // Already paid — no need to check again
        if (payment.status === 'PAID') {
            return { success: true, bookingId, alreadyPaid: true };
        }

        // Check status from Byl.mn API
        const bylStatus = await this.bylPayment.getCheckoutStatus(payment.invoiceId);

        if (bylStatus.status === 'complete') {
            // Confirm the payment
            return this.confirmPayment(payment.invoiceId);
        }

        return {
            success: false,
            bookingId,
            bylStatus: bylStatus.status,
            message: `Checkout status: ${bylStatus.status}`,
        };
    }

    // Get booked time slots for a service on a given date
    async getBookedSlots(
        serviceType: 'STUDIO' | 'LIVE_SERVICE' | 'PHOTOGRAPHER_SERVICE' | 'EDIT_SERVICE',
        serviceId: number,
        date: string, // 'YYYY-MM-DD'
    ): Promise<string[]> {
        const bookingDate = new Date(date);

        // Build where clause for the specific service
        const serviceWhere: any = { itemType: serviceType, bookingDate };
        if (serviceType === 'STUDIO') serviceWhere.studioId = serviceId;
        if (serviceType === 'LIVE_SERVICE') serviceWhere.liveServiceId = serviceId;
        if (serviceType === 'PHOTOGRAPHER_SERVICE') serviceWhere.photographerServiceId = serviceId;
        if (serviceType === 'EDIT_SERVICE') serviceWhere.serviceId = serviceId;

        const items = await this.prisma.bookingItem.findMany({
            where: {
                ...serviceWhere,
                booking: { status: { not: 'CANCELLED' } },
                startTime: { not: null },
                endTime: { not: null },
            },
            select: { startTime: true, endTime: true },
        });

        // All possible time slots (09:00 – 21:00)
        const ALL_TIMES = [
            '09:00', '10:00', '11:00', '12:00', '13:00',
            '14:00', '15:00', '16:00', '17:00', '18:00',
            '19:00', '20:00', '21:00',
        ];

        const bookedTimes: string[] = [];

        for (const time of ALL_TIMES) {
            const [h, m] = time.split(':').map(Number);
            const slotStart = h * 60 + m; // minutes from midnight
            const slotEnd = slotStart + 60; // 1-hour slot

            const overlaps = items.some(item => {
                if (!item.startTime || !item.endTime) return false;
                const s = item.startTime as Date;
                const e = item.endTime as Date;
                const bookedStart = s.getHours() * 60 + s.getMinutes();
                const bookedEnd = e.getHours() * 60 + e.getMinutes();
                // Overlap: slot starts before booking ends AND slot ends after booking starts
                return slotStart < bookedEnd && slotEnd > bookedStart;
            });

            if (overlaps) bookedTimes.push(time);
        }

        return bookedTimes;
    }

    // Update booking status
    async updateStatus(id: number, status: BookingStatus) {
        const booking = await this.prisma.booking.findUnique({ where: { id } });

        if (!booking) {
            throw new NotFoundException(`Booking with ID ${id} not found`);
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
}
