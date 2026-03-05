import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { BookingStatus, ItemType, PaymentStatus } from '@prisma/client';
import { BylPaymentService } from './byl-payment.service';

@Injectable()
export class BookingsService {
    constructor(
        private prisma: PrismaService,
        private bylPayment: BylPaymentService,
    ) { }

    // Find all bookings
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

        // Create Byl checkout
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
            // If Byl fails, still return booking but without checkout URL
            return { ...booking, checkoutUrl: null, paymentError: error.message };
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

        // Create Byl checkout
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
            return { ...booking, checkoutUrl: null, paymentError: error.message };
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
