import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { BookingStatus, ItemType } from '@prisma/client';

@Injectable()
export class BookingsService {
    constructor(private prisma: PrismaService) { }

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

    // Guest booking — no auth required
    async createGuestBooking(dto: {
        name: string;
        phone: string;
        date: string;     // 'YYYY-MM-DD'
        time: string;     // 'HH:MM'
        duration: number; // hours
        serviceType: 'STUDIO' | 'LIVE_SERVICE' | 'PHOTOGRAPHER_SERVICE' | 'EDIT_SERVICE';
        serviceId: number;
        unitPrice: number;
        notes?: string;
    }) {
        // Find or create a guest user by phone
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
