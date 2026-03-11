import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma.service';
import { BundleServiceService } from '../bundle-service/bundle-service.service';
import { BookingStatus, ItemType, PaymentStatus } from '@prisma/client';
import { BylPaymentService } from './byl-payment.service';
import { MailService } from './mail.service';
import { InvoiceService } from './invoice.service';
import { AdminNotificationService } from '../admin/admin-notification.service';

@Injectable()
export class BookingsService {
    private readonly logger = new Logger(BookingsService.name);
    constructor(
        private prisma: PrismaService,
        private bylPayment: BylPaymentService,
        private mailService: MailService,
        private invoiceService: InvoiceService,
        private adminNotificationService: AdminNotificationService,
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

    // Cron job to automatically delete PENDING & UNPAID bookings older than 14 days
    // Runs every day at midnight server time.
    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    async cleanupExpiredBookings() {
        this.logger.log('Running cleanup mechanism for expired pending bookings...');

        // Calculate the date 14 days ago
        const fourteenDaysAgo = new Date();
        fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

        try {
            // Find bookings that meet the criteria
            const expiredBookings = await this.prisma.booking.findMany({
                where: {
                    status: 'PENDING',
                    paymentStatus: 'UNPAID',
                    createdAt: {
                        lt: fourteenDaysAgo // Older than 14 days
                    }
                },
                select: { id: true }
            });

            if (expiredBookings.length === 0) {
                this.logger.log('No expired pending bookings found to clean up.');
                return;
            }

            // Extract IDs
            const bookingIds = expiredBookings.map(b => b.id);

            // Delete them in bulk
            // Assuming Prisma schema has onDelete: Cascade for items and payments
            const result = await this.prisma.booking.deleteMany({
                where: {
                    id: {
                        in: bookingIds
                    }
                }
            });

            this.logger.log(`Successfully deleted ${result.count} expired pending bookings older than 14 days: ${bookingIds.join(', ')}`);
        } catch (error) {
            this.logger.error('Error occurred while cleaning up expired bookings', error);
        }
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

    // Find cancelled bookings (Admin tab)
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

    // Find bookings by user ID
    async findByUserId(userId: number) {
        return this.prisma.booking.findMany({
            where: { userId },
            include: {
                items: { include: { service: true, studio: true, photographerService: true, editService: true, liveService: true, bundleService: true } },
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
        userId?: number; // Use explicit user logic if logged in
        // Buyer organization fields (optional, for invoice)
        buyerOrg?: string;
        buyerOrgReg?: string;
        buyerOrgAddress?: string;
        buyerOrgPhone?: string;
    }) {
        // Find by explicit userId first
        let user: any = null;
        if (dto.userId) {
            user = await this.prisma.user.findUnique({ where: { id: dto.userId } });
        }

        // Fallback to guest logic
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
        // Build startTime/endTime as plain strings to avoid timezone issues
        const startHour = h;
        const endHour = h + dto.duration;
        const startTime = `${String(startHour).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`;
        const endTime = `${String(endHour).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`;
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
            this.sendInvoiceForBooking(
                booking.id, dto.name, dto.email, dto.phone,
                [{ description: dto.serviceName || dto.serviceType, quantity: dto.duration, unitPrice: dto.unitPrice, totalPrice: total }],
                new Date().toISOString().slice(0, 10),
                { buyerOrg: dto.buyerOrg, buyerOrgReg: dto.buyerOrgReg, buyerOrgAddress: dto.buyerOrgAddress, buyerOrgPhone: dto.buyerOrgPhone },
            ).catch(err => this.logger.error(`Failed to send invoice async: ${err.message}`));
            if (dto.email) {
                this.mailService.sendOrderConfirmationEmail(dto.email, booking.id, dto.name, total, 1)
                    .catch(err => this.logger.error(`Failed to send confirmation email async: ${err.message}`));
            }
            return { ...booking, checkoutUrl: null };
        }

        // QPay path — create Byl checkout
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
            this.sendInvoiceForBooking(
                booking.id, dto.name, dto.email, dto.phone,
                [{ description: dto.serviceName || dto.serviceType, quantity: dto.duration, unitPrice: dto.unitPrice, totalPrice: total }],
                new Date().toISOString().slice(0, 10),
                { buyerOrg: dto.buyerOrg, buyerOrgReg: dto.buyerOrgReg, buyerOrgAddress: dto.buyerOrgAddress, buyerOrgPhone: dto.buyerOrgPhone },
            ).catch(err => this.logger.error(`Failed to send invoice async: ${err.message}`));
            return { ...booking, checkoutUrl: null };
        }
    }

    // Cart booking — multi-items, guest or auth
    // Each item in the cart creates a SEPARATE booking record
    async createCartBooking(dto: {
        name: string;
        phone: string;
        email?: string;
        notes?: string;
        items: Array<{
            date: string;     // 'YYYY-MM-DD'
            time: string;     // 'HH:MM'
            duration: number; // hours
            serviceType: 'STUDIO' | 'LIVE_SERVICE' | 'PHOTOGRAPHER_SERVICE' | 'EDIT_SERVICE' | 'BUNDLE_SERVICE';
            serviceId: number;
            unitPrice: number;
            serviceName?: string;
        }>;
        paymentType?: 'qpay' | 'invoice';
        userId?: number;
    }) {
        let user: any = null;
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

        const clientBaseUrl = process.env.CLIENT_URL || 'https://xtudio-six.vercel.app';
        const createdBookings: any[] = [];

        // Create a SEPARATE booking for each cart item
        for (const item of dto.items) {
            const bookingDate = item.date.slice(0, 10);
            const [ih, im] = item.time.split(':').map(Number);
            // Build startTime/endTime as plain strings to avoid timezone issues
            const startTime = `${String(ih).padStart(2, '0')}:${String(im).padStart(2, '0')}:00`;
            const endTime = `${String(ih + item.duration).padStart(2, '0')}:${String(im).padStart(2, '0')}:00`;
            const total = item.unitPrice * item.duration;

            const bookingItemData: any = {
                itemType: item.serviceType as ItemType,
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

            const booking = await this.prisma.booking.create({
                data: {
                    userId: user.id,
                    totalAmount: total,
                    notes: dto.notes,
                    items: { create: [bookingItemData] },
                },
                include: { items: true }
            });

            createdBookings.push({ booking, item, total });
        }

        const totalAmount = createdBookings.reduce((sum, b) => sum + b.total, 0);
        const firstBooking = createdBookings[0].booking;

        // Invoice path — send one combined invoice PDF
        if (dto.paymentType === 'invoice') {
            const invoiceItems = createdBookings.map(b => ({
                description: b.item.serviceName || b.item.serviceType,
                quantity: b.item.duration,
                unitPrice: b.item.unitPrice,
                totalPrice: b.total,
            }));
            this.sendInvoiceForBooking(
                firstBooking.id, dto.name, dto.email, dto.phone,
                invoiceItems, new Date().toISOString().slice(0, 10),
            ).catch(err => this.logger.error(`Failed to send invoice async: ${err.message}`));
            if (dto.email) {
                this.mailService.sendOrderConfirmationEmail(dto.email, firstBooking.id, dto.name, totalAmount, createdBookings.length)
                    .catch(err => this.logger.error(`Failed to send confirmation email async: ${err.message}`));
            }
            return { ...firstBooking, checkoutUrl: null, bookingIds: createdBookings.map(b => b.booking.id) };
        }

        // QPay path — create one Byl checkout for the combined amount
        try {
            const checkout = await this.bylPayment.createCheckout({
                bookingId: firstBooking.id,
                amount: totalAmount,
                serviceName: `Xmedia багц (${createdBookings.length} үйлчилгээ)`,
                items: createdBookings.map(b => ({
                    name: b.item.serviceName || b.item.serviceType,
                    amount: b.item.unitPrice,
                    quantity: b.item.duration,
                })),
                quantity: 1,
                customerEmail: dto.email,
                successUrl: `${clientBaseUrl}/booking/success?bookingId=${firstBooking.id}`,
                cancelUrl: `${clientBaseUrl}/booking/cancel`,
            });

            // Save checkout ID — store other booking IDs for group confirmation
            const otherBookingIds = createdBookings.slice(1).map(b => b.booking.id);
            await this.prisma.payment.create({
                data: {
                    bookingId: firstBooking.id,
                    invoiceId: String(checkout.checkoutId),
                    amount: totalAmount,
                    status: 'UNPAID',
                    linkedBookingIds: otherBookingIds.length > 0 ? JSON.stringify(otherBookingIds) : null,
                }
            });

            return { ...firstBooking, checkoutUrl: checkout.checkoutUrl, bookingIds: createdBookings.map(b => b.booking.id) };
        } catch (error) {
            // Byl failed — send invoice PDF by email instead
            const invoiceItems = createdBookings.map(b => ({
                description: b.item.serviceName || b.item.serviceType,
                quantity: b.item.duration,
                unitPrice: b.item.unitPrice,
                totalPrice: b.total,
            }));
            this.sendInvoiceForBooking(
                firstBooking.id, dto.name, dto.email, dto.phone,
                invoiceItems, createdBookings[0]?.item.date || new Date().toISOString().slice(0, 10),
            ).catch(err => this.logger.error(`Failed to send invoice async: ${err.message}`));
            return { ...firstBooking, checkoutUrl: null, bookingIds: createdBookings.map(b => b.booking.id) };
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
        buyerOrgInfo?: { buyerOrg?: string; buyerOrgReg?: string; buyerOrgAddress?: string; buyerOrgPhone?: string },
    ) {
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
            // Buyer details — use org data if passed, fallback to personal info
            buyerName: buyerOrgInfo?.buyerOrg ? buyerOrgInfo.buyerOrg : buyerName,
            buyerEmail,
            buyerPhone: buyerOrgInfo?.buyerOrgPhone || buyerPhone,
            buyerReg: buyerOrgInfo?.buyerOrgReg || '',
            buyerAddress: buyerOrgInfo?.buyerOrgAddress || '',
            // Store original person name for greeting
            buyerPersonName: buyerName,
            items,
        };

        const total = items.reduce((s, i) => s + i.totalPrice, 0);
        const subject = `Нэхэмжлэх #${invoiceData.invoiceNumber} — Xmedia`;

        // Build HTML body (always available)
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

        // Try to generate PDF, fall back to HTML-only if it fails
        let pdfBuffer: Buffer | null = null;
        try {
            pdfBuffer = await this.invoiceService.generateInvoicePdf(invoiceData);
            this.logger.log(`PDF generated for booking #${bookingId}, size=${pdfBuffer.length}`);
        } catch (pdfErr) {
            this.logger.error(`PDF generation failed for #${bookingId}: ${pdfErr.message}`);
        }

        try {
            if (pdfBuffer) {
                await this.mailService.sendInvoiceEmail(buyerEmail, subject, htmlBody, pdfBuffer, `invoice-${bookingId}.pdf`);
            } else {
                // HTML-only fallback (no attachment)
                await this.mailService.sendInvoiceEmail(buyerEmail, subject, htmlBody, null, null);
            }
            this.logger.log(`Invoice email sent to ${buyerEmail} for booking #${bookingId}`);
        } catch (mailErr) {
            this.logger.error(`SMTP failed for booking #${bookingId}: ${mailErr.message}`);
        }
    }

    // Manual booking creation (for Admin use)
    async createManualBooking(dto: {
        name: string;
        phone: string;
        email?: string;
        date: string;     // 'YYYY-MM-DD'
        startTime: string; // 'HH:MM'
        endTime: string;   // 'HH:MM'
        serviceType: 'STUDIO' | 'LIVE_SERVICE' | 'PHOTOGRAPHER_SERVICE' | 'EDIT_SERVICE';
        serviceId: number;
        totalAmount: number;
        status: BookingStatus;
        paymentStatus: 'UNPAID' | 'PAID' | 'REFUNDED';
        notes?: string;
    }) {
        // Find or create user
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

        // Calculate duration in hours
        const durationHours = (end.getTime() - start.getTime()) / 3600000;
        const unitPrice = dto.totalAmount / (durationHours || 1);

        const itemData: any = {
            itemType: dto.serviceType as ItemType,
            quantity: durationHours,
            unitPrice,
            totalPrice: dto.totalAmount,
            bookingDate,
            startTime: `${dto.startTime}:00`,
            endTime: `${dto.endTime}:00`,
        };

        if (dto.serviceType === 'STUDIO') itemData.studioId = dto.serviceId;
        if (dto.serviceType === 'LIVE_SERVICE') itemData.liveServiceId = dto.serviceId;
        if (dto.serviceType === 'PHOTOGRAPHER_SERVICE') itemData.photographerServiceId = dto.serviceId;
        if (dto.serviceType === 'EDIT_SERVICE') itemData.serviceId = dto.serviceId;

        const booking = await this.prisma.booking.create({
            data: {
                userId: user.id,
                totalAmount: dto.totalAmount,
                notes: dto.notes,
                status: dto.status,
                paymentStatus: dto.paymentStatus as any,
                items: { create: [itemData] },
            },
            include: { items: true, user: true }
        });

        // Trigger email/invoice generation if marked PAID?
        // Admins can trigger this themselves if needed, or we just rely on standard flows.

        return booking;
    }

    // Confirm payment from webhook
    async confirmPayment(bylCheckoutId: string) {
        // Find payment by Byl checkout ID (stored as invoiceId)
        const payment = await this.prisma.payment.findUnique({
            where: { invoiceId: bylCheckoutId },
            include: { booking: { include: { user: true, items: true } } },
        });

        if (!payment) {
            throw new NotFoundException(`Payment with Byl checkout ID ${bylCheckoutId} not found`);
        }

        // Capture whether this was already paid BEFORE updating
        const wasAlreadyPaid = payment.status === 'PAID';

        // Update payment status
        await this.prisma.payment.update({
            where: { id: payment.id },
            data: {
                status: 'PAID',
                paidAt: new Date(),
            },
        });

        // Update the primary booking status
        const updatedBooking = await this.prisma.booking.update({
            where: { id: payment.bookingId },
            data: {
                paymentStatus: 'PAID',
                status: 'CONFIRMED',
            },
            include: { user: true, items: true }
        });

        // Also confirm all linked bookings from the same cart session
        if (payment.linkedBookingIds) {
            try {
                const linkedIds: number[] = JSON.parse(payment.linkedBookingIds);
                if (linkedIds.length > 0) {
                    await this.prisma.booking.updateMany({
                        where: { id: { in: linkedIds } },
                        data: {
                            paymentStatus: 'PAID',
                            status: 'CONFIRMED',
                        },
                    });
                    this.logger.log(`Confirmed linked bookings: ${linkedIds.join(', ')} along with booking #${payment.bookingId}`);
                }
            } catch (e) {
                this.logger.error(`Failed to parse/confirm linkedBookingIds for payment #${payment.id}: ${e.message}`);
            }
        }

        // Send success email only if payment was NOT already paid before this call
        if (!wasAlreadyPaid && updatedBooking.user?.email) {
            this.mailService.sendOrderConfirmationEmail(
                updatedBooking.user.email,
                updatedBooking.id,
                updatedBooking.user.username,
                Number(updatedBooking.totalAmount),
                updatedBooking.items.length
            ).catch(err => this.logger.error(`Async email failed: ${err.message}`));
        }

        return { success: true, bookingId: payment.bookingId };
    }

    // Verify payment status from Byl.mn API and confirm if paid
    async verifyAndConfirmPayment(bookingId: number) {
        // Find the payment record for this booking
        const payment = await this.prisma.payment.findFirst({
            where: { bookingId },
            include: { booking: { include: { user: true, items: true } } },
        });

        if (!payment) {
            throw new NotFoundException(`Payment for booking #${bookingId} not found`);
        }

        // Already paid — webhook already confirmed, just send confirmation email if needed
        if (payment.status === 'PAID') {
            // Ensure success email is sent (in case webhook confirmed but email failed)
            const booking = (payment as any).booking;
            if (booking?.user?.email) {
                await this.mailService.sendOrderConfirmationEmail(
                    booking.user.email,
                    bookingId,
                    booking.user.username,
                    Number(booking.totalAmount),
                    booking.items?.length ?? 1,
                ).catch(err => this.logger.warn(`Email resend failed for booking #${bookingId}: ${err.message}`));
            }
            return { success: true, bookingId, alreadyPaid: true };
        }

        // Check status from Byl.mn API
        const bylStatus = await this.bylPayment.getCheckoutStatus(payment.invoiceId);
        const statusStr = bylStatus?.status?.toLowerCase();

        if (statusStr === 'complete' || statusStr === 'paid' || statusStr === 'success') {
            // Confirm the payment (will also send email)
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
        const bookingDate = date.slice(0, 10);

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
                // Parse time string directly to avoid timezone issues
                // startTime/endTime stored as "HH:MM:SS" — just split and parse
                const [sh, sm] = item.startTime.split(':').map(Number);
                const [eh, em] = item.endTime.split(':').map(Number);
                const bookedStart = sh * 60 + sm;
                const bookedEnd = eh * 60 + em;
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

        const updated = await this.prisma.booking.update({
            where: { id },
            data: { status },
            include: {
                user: true,
                items: true,
            }
        });

        // Trigger an admin notification when an order is cancelled
        if (status === 'CANCELLED') {
            await this.adminNotificationService.createNotification(
                'ORDER_CANCELLED',
                `Захиалга ORD-${id.toString().padStart(4, '0')} цуцлагдлаа`,
                id
            );
        }

        // Send confirmation email when status is set to CONFIRMED
        if (status === 'CONFIRMED' && booking.status !== 'CONFIRMED' && updated.user?.email) {
            await this.mailService.sendOrderConfirmationEmail(
                updated.user.email,
                updated.id,
                updated.user.username,
                Number(updated.totalAmount),
                updated.items.length
            );
        }

        return updated;
    }

    // Update internal notes for a booking from admin
    async updateNotes(id: number, notes: string) {
        const booking = await this.prisma.booking.findUnique({ where: { id } });

        if (!booking) {
            throw new NotFoundException(`Booking with ID ${id} not found`);
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

    // Update custom payment status from admin
    async updatePaymentStatus(id: number, paymentStatus: PaymentStatus) {
        const booking = await this.prisma.booking.findUnique({ where: { id }, include: { user: true, items: true } });

        if (!booking) {
            throw new NotFoundException(`Booking with ID ${id} not found`);
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
                await this.mailService.sendOrderConfirmationEmail(
                    updated.user.email,
                    updated.id,
                    updated.user.username,
                    Number(updated.totalAmount),
                    updated.items.length
                );
            }
        }

        return updated;
    }
}
