import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma.service';
import { BundleServiceService } from '../bundle-service/bundle-service.service';
import { BookingStatus, ItemType, PaymentStatus } from '@prisma/client';
import { BylPaymentService } from './byl-payment.service';
import { MailService } from './mail.service';
import { InvoiceService } from './invoice.service';
import { AdminNotificationService } from '../admin/admin-notification.service';
import { toMinutes, minutesToTime, normalizeTime, durationMinutes, shiftDate } from './time.util';

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
                    email: dto.email || `guest_${dto.phone}@xtudio.guest`,
                    phone: dto.phone,
                    passwordHash: 'GUEST',
                }
            });
        }

        const bookingDate = dto.date.slice(0, 10);
        // Build startTime/endTime as plain strings to avoid timezone issues.
        // Шөнө дамнасан үед (ж: 20:00 + 6ц) 24 цагийн модулиар нормчилно → "02:00:00"
        const startTime = normalizeTime(dto.time);
        const endTime = minutesToTime(toMinutes(dto.time) + Math.round(dto.duration * 60));
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
        if (dto.serviceType === 'EDIT_SERVICE') itemData.editServiceId = dto.serviceId;

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
                [{ description: dto.serviceName || dto.serviceType, quantity: 1, unitPrice: total, totalPrice: total }],
                new Date().toISOString().slice(0, 10),
                { buyerOrg: dto.buyerOrg, buyerOrgReg: dto.buyerOrgReg, buyerOrgAddress: dto.buyerOrgAddress, buyerOrgPhone: dto.buyerOrgPhone },
            ).catch(err => this.logger.error(`Failed to send invoice async: ${err.message}`));

            // Notify admin: new invoice request
            this.adminNotificationService.createNotification(
                'NEW_INVOICE_REQUEST',
                `Шинэ нэхэмжлэх хүсэлт: ${dto.name} — ${dto.serviceName || dto.serviceType} (${total.toLocaleString()}₮)`,
                booking.id,
            ).catch(() => {});

            // Email admin: new invoice request
            this.mailService.sendNewOrderNotificationToAdmin(
                booking.id, dto.name, dto.phone, `[НЭХЭМЖЛЭХ] ${dto.serviceName || dto.serviceType}`, total,
                [{ date: bookingDate, startTime, endTime }],
            ).catch(() => {});

            return { ...booking, checkoutUrl: null };
        }

        // QPay path — create Byl checkout
        try {
            const clientBaseUrl = process.env.CLIENT_URL || 'https://xtudio-six.vercel.app';
            const serviceName = dto.serviceName || dto.serviceType;
            const checkoutDescription = `${serviceName} | ${dto.phone} | ${dto.email || 'no-email'} | Захиалга #${booking.id}`;

            const checkout = await this.bylPayment.createCheckout({
                bookingId: booking.id,
                amount: total,
                serviceName: checkoutDescription,
                quantity: 1,
                customerEmail: dto.email,
                successUrl: `${clientBaseUrl}/booking/success?bookingId=${booking.id}`,
                cancelUrl: `${clientBaseUrl}/booking/cancel`,
                description: checkoutDescription,
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

            // Notify admin: new order created
            this.adminNotificationService.createNotification(
                'NEW_ORDER',
                `Шинэ захиалга: ${dto.name} — ${dto.serviceName || dto.serviceType} (${total.toLocaleString()}₮)`,
                booking.id,
            ).catch(() => {});

            // Email admin: new order
            this.mailService.sendNewOrderNotificationToAdmin(
                booking.id, dto.name, dto.phone, dto.serviceName || dto.serviceType, total,
                [{ date: bookingDate, startTime, endTime }],
            ).catch(() => {});

            return { ...booking, checkoutUrl: checkout.checkoutUrl };
        } catch (error) {
            // Byl failed — send invoice PDF by email instead
            this.sendInvoiceForBooking(
                booking.id, dto.name, dto.email, dto.phone,
                [{ description: dto.serviceName || dto.serviceType, quantity: 1, unitPrice: total, totalPrice: total }],
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
                    email: dto.email || `guest_${dto.phone}@xtudio.guest`,
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
            // Build startTime/endTime as plain strings to avoid timezone issues.
            // Шөнө дамнасан үед 24 цагийн модулиар нормчилно (ж: 22:00 + 4ц → "02:00:00")
            const startTime = normalizeTime(item.time);
            const endTime = minutesToTime(toMinutes(item.time) + Math.round(item.duration * 60));
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

        // Per-item schedule for the admin notification email
        const cartSchedule = createdBookings.map(b => ({
            date: b.booking.items[0]?.bookingDate,
            startTime: b.booking.items[0]?.startTime,
            endTime: b.booking.items[0]?.endTime,
            // Label each line with its service only when there is more than one
            serviceName: createdBookings.length > 1 ? (b.item.serviceName || b.item.serviceType) : undefined,
        }));

        // Invoice path — send one combined invoice PDF
        if (dto.paymentType === 'invoice') {
            const invoiceItems = createdBookings.map(b => ({
                description: b.item.serviceName || b.item.serviceType,
                quantity: 1,
                unitPrice: b.total,
                totalPrice: b.total,
            }));
            this.sendInvoiceForBooking(
                firstBooking.id, dto.name, dto.email, dto.phone,
                invoiceItems, new Date().toISOString().slice(0, 10),
            ).catch(err => this.logger.error(`Failed to send invoice async: ${err.message}`));

            // Notify admin: new invoice request (cart)
            const serviceList = createdBookings.map(b => b.item.serviceName || b.item.serviceType).join(', ');
            this.adminNotificationService.createNotification(
                'NEW_INVOICE_REQUEST',
                `Шинэ нэхэмжлэх хүсэлт: ${dto.name} — ${serviceList} (${totalAmount.toLocaleString()}₮)`,
                firstBooking.id,
            ).catch(() => {});

            // Email admin: cart invoice
            this.mailService.sendNewOrderNotificationToAdmin(
                firstBooking.id, dto.name, dto.phone, `[НЭХЭМЖЛЭХ] ${serviceList}`, totalAmount,
                cartSchedule,
            ).catch(() => {});

            return { ...firstBooking, checkoutUrl: null, bookingIds: createdBookings.map(b => b.booking.id) };
        }

        // QPay path — create one Byl checkout for the combined amount
        try {
            const serviceList = createdBookings.map(b => b.item.serviceName || b.item.serviceType).join(', ');
            const paymentDescription = `${serviceList} | ${dto.phone} | ${dto.email || 'no-email'} | Захиалга #${createdBookings.map(b => b.booking.id).join(',')}`;

            const checkout = await this.bylPayment.createCheckout({
                bookingId: firstBooking.id,
                amount: totalAmount,
                serviceName: `XTUDIO багц (${createdBookings.length} үйлчилгээ)`,
                items: createdBookings.map(b => ({
                    name: `${b.item.serviceName || b.item.serviceType} | ${dto.phone} | ${dto.email || 'no-email'} | Захиалга #${b.booking.id}`,
                    amount: b.total,
                    quantity: 1,
                })),
                quantity: 1,
                customerEmail: dto.email,
                successUrl: `${clientBaseUrl}/booking/success?bookingId=${firstBooking.id}`,
                cancelUrl: `${clientBaseUrl}/booking/cancel`,
                description: paymentDescription,
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

            // Notify admin: new cart order
            this.adminNotificationService.createNotification(
                'NEW_ORDER',
                `Шинэ захиалга: ${dto.name} — ${serviceList} (${totalAmount.toLocaleString()}₮)`,
                firstBooking.id,
            ).catch(() => {});

            // Email admin: cart order
            this.mailService.sendNewOrderNotificationToAdmin(
                firstBooking.id, dto.name, dto.phone, serviceList, totalAmount,
                cartSchedule,
            ).catch(() => {});

            return { ...firstBooking, checkoutUrl: checkout.checkoutUrl, bookingIds: createdBookings.map(b => b.booking.id) };
        } catch (error) {
            // Byl failed — send invoice PDF by email instead
            const invoiceItems = createdBookings.map(b => ({
                description: b.item.serviceName || b.item.serviceType,
                quantity: 1,
                unitPrice: b.total,
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
        const subject = `Нэхэмжлэх #${invoiceData.invoiceNumber} — XTUDIO`;

        // Build HTML body (always available)
        const htmlBody = `
            <div style="font-family:Arial,sans-serif;color:#222;max-width:620px;margin:0 auto">
                <h2 style="color:#e11d48">XTUDIO — Нэхэмжлэх</h2>
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

    /**
     * Байгаа хэрэглэгчийн холбоо барих мэдээллийг админы оруулсан утгаар шинэчилнэ.
     * Хоосон талбарыг алгасна; и-мэйл нь өөр хэрэглэгчид бүртгэлтэй бол
     * (email нь unique) алгасаж, захиалга үүсгэх үйлдлийг зогсоохгүй.
     */
    private async syncUserContact(
        user: { id: number; username: string; email: string; phone: string | null },
        dto: { name?: string; phone?: string; email?: string },
    ): Promise<void> {
        const patch: any = {};
        if (dto.name && dto.name !== user.username) patch.username = dto.name;
        if (dto.phone && dto.phone !== user.phone) patch.phone = dto.phone;
        if (dto.email && dto.email !== user.email) {
            const taken = await this.prisma.user.findFirst({
                where: { email: dto.email, NOT: { id: user.id } },
                select: { id: true },
            });
            if (!taken) patch.email = dto.email;
        }
        if (Object.keys(patch).length === 0) return;
        await this.prisma.user.update({ where: { id: user.id }, data: patch });
    }

    // Manual booking creation (for Admin use)
    async createManualBooking(dto: {
        userId?: number;   // Бүртгэлтэй хэрэглэгчийг сонгосон бол түүний ID
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
        // Find or create user.
        // 1) Админ бүртгэлтэй хэрэглэгчийг сонгосон бол шууд түүгээр холбоно
        // 2) Үгүй бол утсаар нь хайна (давхардсан хэрэглэгч үүсэхээс сэргийлнэ)
        // 3) Олдохгүй бол шинээр үүсгэнэ
        let user = dto.userId
            ? await this.prisma.user.findUnique({ where: { id: Number(dto.userId) } })
            : null;
        if (dto.userId && !user) {
            throw new NotFoundException(`User with ID ${dto.userId} not found`);
        }
        if (!user) {
            user = await this.prisma.user.findFirst({ where: { phone: dto.phone } });
        }
        if (!user) {
            user = await this.prisma.user.create({
                data: {
                    username: dto.name,
                    email: dto.email || `guest_${dto.phone}@xtudio.guest`,
                    phone: dto.phone,
                    passwordHash: 'GUEST',
                }
            });
        } else {
            // Байгаа хэрэглэгч дээр админы өөрчилсөн мэдээллийг шинэчилнэ
            await this.syncUserContact(user, dto);
        }

        const bookingDate = dto.date.slice(0, 10);

        // Calculate duration in hours (шөнө дамнасан үед 24 цагийн модулиар: 20:00–02:00 = 6ц)
        const durationMin = durationMinutes(dto.startTime, dto.endTime);
        if (durationMin === 0) {
            throw new BadRequestException('Эхлэх ба дуусах цаг ижил байж болохгүй.');
        }
        const durationHours = durationMin / 60;
        const unitPrice = dto.totalAmount / durationHours;

        const itemData: any = {
            itemType: dto.serviceType as ItemType,
            // quantity нь Int багана — 30 минутын алхмыг бүхэлчилнэ (үнэ нь unitPrice-аар яг таарна)
            quantity: Math.max(1, Math.round(durationHours)),
            unitPrice,
            totalPrice: dto.totalAmount,
            bookingDate,
            startTime: normalizeTime(dto.startTime),
            endTime: normalizeTime(dto.endTime),
        };

        if (dto.serviceType === 'STUDIO') itemData.studioId = dto.serviceId;
        if (dto.serviceType === 'LIVE_SERVICE') itemData.liveServiceId = dto.serviceId;
        if (dto.serviceType === 'PHOTOGRAPHER_SERVICE') itemData.photographerServiceId = dto.serviceId;
        if (dto.serviceType === 'EDIT_SERVICE') itemData.editServiceId = dto.serviceId;

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

    private formatServiceDetails(items: any[]): string {
        if (!items || items.length === 0) return 'Тодорхойгүй';
        
        return items.map(item => {
            let name = 'Үйлчилгээ';
            if (item.itemType === 'STUDIO') name = 'Студи';
            else if (item.itemType === 'LIVE_SERVICE') name = 'Шууд дамжуулалт';
            else if (item.itemType === 'PHOTOGRAPHER_SERVICE') name = 'Зурагчин';
            else if (item.itemType === 'EDIT_SERVICE') name = 'Видео эдит';
            else if (item.itemType === 'BUNDLE_SERVICE') name = 'Багц';
            
            if (item.studio?.name) name = item.studio.name;
            else if (item.liveService?.name) name = item.liveService.name;
            else if (item.bundleService?.name) name = item.bundleService.name;
            
            let timeStr = item.bookingDate || '';
            if (item.startTime && item.endTime) {
                timeStr += ` ${item.startTime.substring(0, 5)}-${item.endTime.substring(0, 5)}`;
            }
            return `• ${name} (${timeStr})`;
        }).join('<br/>');
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
                this.formatServiceDetails(updatedBooking.items)
            ).catch(err => this.logger.error(`Async email failed: ${err.message}`));
        }

        // Notify admin: payment confirmed
        if (!wasAlreadyPaid) {
            this.adminNotificationService.createNotification(
                'PAYMENT_CONFIRMED',
                `Төлбөр амжилттай: Захиалга #ORD-${payment.bookingId.toString().padStart(4, '0')} (${Number(payment.amount).toLocaleString()}₮)`,
                payment.bookingId,
            ).catch(() => {});
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
                    this.formatServiceDetails(booking.items || []),
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
        // Өмнөх өдрөөс шөнө дамжсан захиалга (ж: 20:00–02:00) энэ өдрийн эхний
        // цагуудыг эзэлдэг тул хоёр өдрийн захиалгыг хамт татна
        const prevDate = shiftDate(bookingDate, -1);

        // Build where clause for the specific service
        const serviceWhere: any = { itemType: serviceType, bookingDate: { in: [prevDate, bookingDate] } };
        if (serviceType === 'STUDIO') serviceWhere.studioId = serviceId;
        if (serviceType === 'LIVE_SERVICE') serviceWhere.liveServiceId = serviceId;
        if (serviceType === 'PHOTOGRAPHER_SERVICE') serviceWhere.photographerServiceId = serviceId;
        if (serviceType === 'EDIT_SERVICE') serviceWhere.editServiceId = serviceId;

        const items = await this.prisma.bookingItem.findMany({
            where: {
                ...serviceWhere,
                booking: {
                    status: 'CONFIRMED',
                    paymentStatus: 'PAID',
                },
                startTime: { not: null },
                endTime: { not: null },
            },
            select: { bookingDate: true, startTime: true, endTime: true },
        });

        // All 30-minute slots across the full 24-hour day (00:00 – 23:30)
        const ALL_TIMES = Array.from({ length: 48 }, (_, i) => {
            const h = Math.floor(i / 2);
            const m = i % 2 === 0 ? '00' : '30';
            return `${String(h).padStart(2, '0')}:${m}`;
        });

        const bookedTimes: string[] = [];

        for (const time of ALL_TIMES) {
            const [h, m] = time.split(':').map(Number);
            const slotStart = h * 60 + m; // minutes from midnight
            const slotEnd = slotStart + 30; // 30-minute slot

            const overlaps = items.some(item => {
                if (!item.startTime || !item.endTime) return false;
                // startTime/endTime stored as "HH:MM:SS" — шөнө дамнасан бол
                // үргэлжлэх хугацаа нь 24 цагийн модулиар тооцогдоно
                const duration = durationMinutes(item.startTime, item.endTime);
                if (duration === 0) return false;
                // Өмнөх өдрийн захиалгыг сөрөг тэнхлэг рүү шилжүүлнэ (ж: 22:00 → -120)
                const bookedStart = toMinutes(item.startTime) - (item.bookingDate === bookingDate ? 0 : 1440);
                const bookedEnd = bookedStart + duration;
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

            // Email admin: order cancelled
            this.mailService.sendOrderCancelledEmail(
                id,
                updated.user?.username || 'Хэрэглэгч',
                Number(updated.totalAmount ?? 0),
            ).catch(() => {});
        }

        // Send confirmation email when status is set to CONFIRMED
        if (status === 'CONFIRMED' && booking.status !== 'CONFIRMED' && updated.user?.email) {
            await this.mailService.sendOrderConfirmationEmail(
                updated.user.email,
                updated.id,
                updated.user.username,
                Number(updated.totalAmount),
                this.formatServiceDetails(updated.items)
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
                    this.formatServiceDetails(updated.items)
                );
            }
        }

        return updated;
    }

    // Admin update booking
    async updateBookingDetails(id: number, dto: any) {
        const booking = await this.prisma.booking.findUnique({
            where: { id },
            include: { user: true, items: true }
        });

        if (!booking) {
            throw new NotFoundException(`Booking with ID ${id} not found`);
        }

        // Хэрэглэгч: админ хайлтаас өөр бүртгэлтэй хэрэглэгч сонгосон бол захиалгыг
        // тэр хэрэглэгч рүү шилжүүлнэ, эс тэгвээс одоогийн хэрэглэгчийн мэдээллийг шинэчилнэ
        let targetUserId = booking.userId;
        if (dto.userId && Number(dto.userId) !== booking.userId) {
            const picked = await this.prisma.user.findUnique({ where: { id: Number(dto.userId) } });
            if (!picked) throw new NotFoundException(`User with ID ${dto.userId} not found`);
            targetUserId = picked.id;
            await this.syncUserContact(picked, dto);
        } else if (dto.name !== undefined || dto.phone !== undefined || dto.email !== undefined) {
            await this.syncUserContact(booking.user, dto);
        }

        const date = dto.date ? dto.date.slice(0, 10) : undefined;
        let durationHours = 1;

        if (dto.startTime && dto.endTime) {
            // Шөнө дамнасан үед 24 цагийн модулиар (20:00–02:00 = 6ц)
            const durationMin = durationMinutes(dto.startTime, dto.endTime);
            if (durationMin === 0) {
                throw new BadRequestException('Эхлэх ба дуусах цаг ижил байж болохгүй.');
            }
            durationHours = durationMin / 60;
        }

        const unitPrice = dto.totalAmount ? dto.totalAmount / (durationHours || 1) : undefined;

        // Update the primary order item
        if (booking.items.length > 0) {
            const itemMap: any = {};
            if (date) itemMap.bookingDate = date;
            if (dto.startTime) itemMap.startTime = normalizeTime(dto.startTime);
            if (dto.endTime) itemMap.endTime = normalizeTime(dto.endTime);
            if (unitPrice !== undefined) itemMap.unitPrice = unitPrice;
            if (dto.totalAmount !== undefined) itemMap.totalPrice = dto.totalAmount;
            if (dto.startTime && dto.endTime) itemMap.quantity = Math.max(1, Math.round(durationHours));

            if (dto.serviceType) itemMap.itemType = dto.serviceType as ItemType;

            if (dto.serviceType === 'STUDIO') { itemMap.studioId = Number(dto.serviceId); itemMap.liveServiceId = null; itemMap.photographerServiceId = null; itemMap.editServiceId = null; itemMap.bundleServiceId = null; }
            else if (dto.serviceType === 'LIVE_SERVICE') { itemMap.liveServiceId = Number(dto.serviceId); itemMap.studioId = null; itemMap.photographerServiceId = null; itemMap.editServiceId = null; itemMap.bundleServiceId = null; }
            else if (dto.serviceType === 'PHOTOGRAPHER_SERVICE') { itemMap.photographerServiceId = Number(dto.serviceId); itemMap.studioId = null; itemMap.liveServiceId = null; itemMap.editServiceId = null; itemMap.bundleServiceId = null; }
            else if (dto.serviceType === 'EDIT_SERVICE') { itemMap.editServiceId = Number(dto.serviceId); itemMap.studioId = null; itemMap.liveServiceId = null; itemMap.photographerServiceId = null; itemMap.bundleServiceId = null; }
            else if (dto.serviceType === 'BUNDLE_SERVICE') { itemMap.bundleServiceId = Number(dto.serviceId); itemMap.studioId = null; itemMap.liveServiceId = null; itemMap.photographerServiceId = null; itemMap.editServiceId = null; }

            if (Object.keys(itemMap).length > 0) {
                await this.prisma.bookingItem.update({
                    where: { id: booking.items[0].id },
                    data: itemMap
                });
            }
        }

        // Update the booking itself
        const updated = await this.prisma.booking.update({
            where: { id },
            data: {
                userId: targetUserId,
                totalAmount: dto.totalAmount !== undefined ? dto.totalAmount : booking.totalAmount,
                notes: dto.notes !== undefined ? dto.notes : booking.notes,
                status: dto.status !== undefined ? dto.status : booking.status,
                paymentStatus: dto.paymentStatus !== undefined ? dto.paymentStatus as any : booking.paymentStatus,
            },
            include: { user: true, items: true }
        });

        return updated;
    }

    // Delete booking completely (Admin hard delete)
    async deleteBooking(id: number) {
        const booking = await this.prisma.booking.findUnique({ where: { id } });
        if (!booking) {
            throw new NotFoundException(`Booking with ID ${id} not found`);
        }
        return this.prisma.booking.delete({ where: { id } });
    }
}
