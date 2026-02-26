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
                images: string | null;
                address: string | null;
                sizeSqm: import("@prisma/client-runtime-utils").Decimal | null;
                capacity: number | null;
                hourlyRate: import("@prisma/client-runtime-utils").Decimal;
                dailyRate: import("@prisma/client-runtime-utils").Decimal | null;
                equipmentIncluded: number | null;
                amenities: string | null;
                isAvailable: boolean;
            } | null;
            service: {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                description: string | null;
                categoryId: number;
                subCategoryId: number | null;
                price: import("@prisma/client-runtime-utils").Decimal;
                priceUnit: string;
                durationMinutes: number | null;
                portfolioImages: string | null;
                isActive: boolean;
            } | null;
        } & {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            bookingId: number;
            itemType: import("@prisma/client").$Enums.ItemType;
            studioId: number | null;
            serviceId: number | null;
            quantity: number;
            unitPrice: import("@prisma/client-runtime-utils").Decimal;
            totalPrice: import("@prisma/client-runtime-utils").Decimal;
            bookingDate: Date;
            startTime: Date | null;
            endTime: Date | null;
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
            bookingId: number;
            itemType: import("@prisma/client").$Enums.ItemType;
            studioId: number | null;
            serviceId: number | null;
            quantity: number;
            unitPrice: import("@prisma/client-runtime-utils").Decimal;
            totalPrice: import("@prisma/client-runtime-utils").Decimal;
            bookingDate: Date;
            startTime: Date | null;
            endTime: Date | null;
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
