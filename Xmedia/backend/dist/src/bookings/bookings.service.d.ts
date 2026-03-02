import { PrismaService } from '../prisma.service';
import { BookingStatus } from '@prisma/client';
export declare class BookingsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<({
        user: {
            id: number;
            username: string;
            email: string;
            phone: string | null;
        };
        items: ({
            studio: {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                description: string | null;
                images: import("@prisma/client/runtime/client").JsonValue | null;
                address: string | null;
                sizeSqm: import("@prisma/client-runtime-utils").Decimal | null;
                capacity: number | null;
                amenities: import("@prisma/client/runtime/client").JsonValue | null;
                isAvailable: boolean;
            } | null;
            service: {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                isActive: boolean;
                description: string | null;
                price: import("@prisma/client-runtime-utils").Decimal;
                priceUnit: string;
                durationMinutes: number | null;
                portfolioImages: string | null;
                categoryId: number;
                subCategoryId: number | null;
            } | null;
            liveService: {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                image: string | null;
                isActive: boolean;
                description: string | null;
                amenities: import("@prisma/client/runtime/client").JsonValue | null;
                categoryId: number;
            } | null;
            photographerService: {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                image: string | null;
                isActive: boolean;
                description: string | null;
                amenities: import("@prisma/client/runtime/client").JsonValue | null;
                categoryId: number;
                mainTypeId: number;
                photographerSubTypeId: number | null;
            } | null;
            editService: {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                image: string | null;
                isActive: boolean;
                description: string | null;
                amenities: import("@prisma/client/runtime/client").JsonValue | null;
                categoryId: number;
                mainTypeId: number;
                subTypeId: number | null;
            } | null;
        } & {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            itemType: import("@prisma/client").$Enums.ItemType;
            quantity: number;
            unitPrice: import("@prisma/client-runtime-utils").Decimal;
            totalPrice: import("@prisma/client-runtime-utils").Decimal;
            bookingDate: Date;
            startTime: Date | null;
            endTime: Date | null;
            studioId: number | null;
            serviceId: number | null;
            photographerServiceId: number | null;
            editServiceId: number | null;
            liveServiceId: number | null;
            bookingId: number;
        })[];
        payments: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            status: import("@prisma/client").$Enums.PaymentStatus;
            bookingId: number;
            invoiceId: string;
            qpayQrText: string | null;
            qpayUrls: string | null;
            amount: import("@prisma/client-runtime-utils").Decimal;
            paidAt: Date | null;
            transactionId: string | null;
        }[];
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        userId: number;
        totalAmount: import("@prisma/client-runtime-utils").Decimal;
        status: import("@prisma/client").$Enums.BookingStatus;
        paymentStatus: import("@prisma/client").$Enums.PaymentStatus;
        notes: string | null;
    })[]>;
    createGuestBooking(dto: {
        name: string;
        phone: string;
        date: string;
        time: string;
        duration: number;
        serviceType: 'STUDIO' | 'LIVE_SERVICE' | 'PHOTOGRAPHER_SERVICE' | 'EDIT_SERVICE';
        serviceId: number;
        unitPrice: number;
        notes?: string;
    }): Promise<{
        items: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            itemType: import("@prisma/client").$Enums.ItemType;
            quantity: number;
            unitPrice: import("@prisma/client-runtime-utils").Decimal;
            totalPrice: import("@prisma/client-runtime-utils").Decimal;
            bookingDate: Date;
            startTime: Date | null;
            endTime: Date | null;
            studioId: number | null;
            serviceId: number | null;
            photographerServiceId: number | null;
            editServiceId: number | null;
            liveServiceId: number | null;
            bookingId: number;
        }[];
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        userId: number;
        totalAmount: import("@prisma/client-runtime-utils").Decimal;
        status: import("@prisma/client").$Enums.BookingStatus;
        paymentStatus: import("@prisma/client").$Enums.PaymentStatus;
        notes: string | null;
    }>;
    updateStatus(id: number, status: BookingStatus): Promise<{
        user: {
            id: number;
            username: string;
            email: string;
            phone: string | null;
            passwordHash: string;
            createdAt: Date;
            updatedAt: Date;
        };
        items: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            itemType: import("@prisma/client").$Enums.ItemType;
            quantity: number;
            unitPrice: import("@prisma/client-runtime-utils").Decimal;
            totalPrice: import("@prisma/client-runtime-utils").Decimal;
            bookingDate: Date;
            startTime: Date | null;
            endTime: Date | null;
            studioId: number | null;
            serviceId: number | null;
            photographerServiceId: number | null;
            editServiceId: number | null;
            liveServiceId: number | null;
            bookingId: number;
        }[];
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        userId: number;
        totalAmount: import("@prisma/client-runtime-utils").Decimal;
        status: import("@prisma/client").$Enums.BookingStatus;
        paymentStatus: import("@prisma/client").$Enums.PaymentStatus;
        notes: string | null;
    }>;
}
