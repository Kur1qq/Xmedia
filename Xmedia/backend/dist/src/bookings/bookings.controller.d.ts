import { BookingsService } from './bookings.service';
import { BookingStatus } from '@prisma/client';
import { AdminLogService } from '../admin/admin-log.service';
import { BylPaymentService } from './byl-payment.service';
export declare class BookingsController {
    private readonly bookingsService;
    private readonly log;
    private readonly bylPayment;
    private readonly logger;
    constructor(bookingsService: BookingsService, log: AdminLogService, bylPayment: BylPaymentService);
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
                amenities: import("@prisma/client/runtime/client").JsonValue | null;
                images: import("@prisma/client/runtime/client").JsonValue | null;
                address: string | null;
                sizeSqm: import("@prisma/client-runtime-utils").Decimal | null;
                capacity: number | null;
                isAvailable: boolean;
            } | null;
            service: {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                description: string | null;
                price: import("@prisma/client-runtime-utils").Decimal;
                isActive: boolean;
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
                description: string | null;
                image: string | null;
                amenities: import("@prisma/client/runtime/client").JsonValue | null;
                isActive: boolean;
                categoryId: number;
            } | null;
            photographerService: {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                description: string | null;
                image: string | null;
                amenities: import("@prisma/client/runtime/client").JsonValue | null;
                isActive: boolean;
                categoryId: number;
                mainTypeId: number;
                photographerSubTypeId: number | null;
            } | null;
            editService: {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                description: string | null;
                image: string | null;
                amenities: import("@prisma/client/runtime/client").JsonValue | null;
                isActive: boolean;
                categoryId: number;
                mainTypeId: number;
                subTypeId: number | null;
            } | null;
        } & {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            quantity: number;
            bundleServiceId: number | null;
            itemType: import("@prisma/client").$Enums.ItemType;
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
    getPendingBookings(): Promise<({
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
                amenities: import("@prisma/client/runtime/client").JsonValue | null;
                images: import("@prisma/client/runtime/client").JsonValue | null;
                address: string | null;
                sizeSqm: import("@prisma/client-runtime-utils").Decimal | null;
                capacity: number | null;
                isAvailable: boolean;
            } | null;
            service: {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                description: string | null;
                price: import("@prisma/client-runtime-utils").Decimal;
                isActive: boolean;
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
                description: string | null;
                image: string | null;
                amenities: import("@prisma/client/runtime/client").JsonValue | null;
                isActive: boolean;
                categoryId: number;
            } | null;
            photographerService: {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                description: string | null;
                image: string | null;
                amenities: import("@prisma/client/runtime/client").JsonValue | null;
                isActive: boolean;
                categoryId: number;
                mainTypeId: number;
                photographerSubTypeId: number | null;
            } | null;
            editService: {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                description: string | null;
                image: string | null;
                amenities: import("@prisma/client/runtime/client").JsonValue | null;
                isActive: boolean;
                categoryId: number;
                mainTypeId: number;
                subTypeId: number | null;
            } | null;
        } & {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            quantity: number;
            bundleServiceId: number | null;
            itemType: import("@prisma/client").$Enums.ItemType;
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
    getCancelledBookings(): Promise<({
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
                amenities: import("@prisma/client/runtime/client").JsonValue | null;
                images: import("@prisma/client/runtime/client").JsonValue | null;
                address: string | null;
                sizeSqm: import("@prisma/client-runtime-utils").Decimal | null;
                capacity: number | null;
                isAvailable: boolean;
            } | null;
            service: {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                description: string | null;
                price: import("@prisma/client-runtime-utils").Decimal;
                isActive: boolean;
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
                description: string | null;
                image: string | null;
                amenities: import("@prisma/client/runtime/client").JsonValue | null;
                isActive: boolean;
                categoryId: number;
            } | null;
            photographerService: {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                description: string | null;
                image: string | null;
                amenities: import("@prisma/client/runtime/client").JsonValue | null;
                isActive: boolean;
                categoryId: number;
                mainTypeId: number;
                photographerSubTypeId: number | null;
            } | null;
            editService: {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                description: string | null;
                image: string | null;
                amenities: import("@prisma/client/runtime/client").JsonValue | null;
                isActive: boolean;
                categoryId: number;
                mainTypeId: number;
                subTypeId: number | null;
            } | null;
        } & {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            quantity: number;
            bundleServiceId: number | null;
            itemType: import("@prisma/client").$Enums.ItemType;
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
    findByUser(userId: number): Promise<({
        items: ({
            studio: {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                description: string | null;
                amenities: import("@prisma/client/runtime/client").JsonValue | null;
                images: import("@prisma/client/runtime/client").JsonValue | null;
                address: string | null;
                sizeSqm: import("@prisma/client-runtime-utils").Decimal | null;
                capacity: number | null;
                isAvailable: boolean;
            } | null;
            service: {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                description: string | null;
                price: import("@prisma/client-runtime-utils").Decimal;
                isActive: boolean;
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
                description: string | null;
                image: string | null;
                amenities: import("@prisma/client/runtime/client").JsonValue | null;
                isActive: boolean;
                categoryId: number;
            } | null;
            photographerService: {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                description: string | null;
                image: string | null;
                amenities: import("@prisma/client/runtime/client").JsonValue | null;
                isActive: boolean;
                categoryId: number;
                mainTypeId: number;
                photographerSubTypeId: number | null;
            } | null;
            editService: {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                description: string | null;
                image: string | null;
                amenities: import("@prisma/client/runtime/client").JsonValue | null;
                isActive: boolean;
                categoryId: number;
                mainTypeId: number;
                subTypeId: number | null;
            } | null;
            bundleService: {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                description: string | null;
                price: import("@prisma/client-runtime-utils").Decimal;
                image: string | null;
                includedServices: import("@prisma/client/runtime/client").JsonValue | null;
                amenities: import("@prisma/client/runtime/client").JsonValue | null;
                isActive: boolean;
            } | null;
        } & {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            quantity: number;
            bundleServiceId: number | null;
            itemType: import("@prisma/client").$Enums.ItemType;
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
    getAvailableSlots(serviceType: 'STUDIO' | 'LIVE_SERVICE' | 'PHOTOGRAPHER_SERVICE' | 'EDIT_SERVICE', serviceId: string, date: string): Promise<{
        bookedTimes: string[];
    }>;
    createManualBooking(dto: any, req: any): Promise<{
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
            quantity: number;
            bundleServiceId: number | null;
            itemType: import("@prisma/client").$Enums.ItemType;
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
    createCartBooking(dto: any): Promise<{
        checkoutUrl: null;
        items: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            quantity: number;
            bundleServiceId: number | null;
            itemType: import("@prisma/client").$Enums.ItemType;
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
        id: number;
        createdAt: Date;
        updatedAt: Date;
        userId: number;
        totalAmount: import("@prisma/client-runtime-utils").Decimal;
        status: import("@prisma/client").$Enums.BookingStatus;
        paymentStatus: import("@prisma/client").$Enums.PaymentStatus;
        notes: string | null;
    } | {
        checkoutUrl: string;
        items: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            quantity: number;
            bundleServiceId: number | null;
            itemType: import("@prisma/client").$Enums.ItemType;
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
        id: number;
        createdAt: Date;
        updatedAt: Date;
        userId: number;
        totalAmount: import("@prisma/client-runtime-utils").Decimal;
        status: import("@prisma/client").$Enums.BookingStatus;
        paymentStatus: import("@prisma/client").$Enums.PaymentStatus;
        notes: string | null;
    }>;
    createGuest(dto: any): Promise<{
        checkoutUrl: null;
        items: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            quantity: number;
            bundleServiceId: number | null;
            itemType: import("@prisma/client").$Enums.ItemType;
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
        id: number;
        createdAt: Date;
        updatedAt: Date;
        userId: number;
        totalAmount: import("@prisma/client-runtime-utils").Decimal;
        status: import("@prisma/client").$Enums.BookingStatus;
        paymentStatus: import("@prisma/client").$Enums.PaymentStatus;
        notes: string | null;
    } | {
        checkoutUrl: string;
        items: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            quantity: number;
            bundleServiceId: number | null;
            itemType: import("@prisma/client").$Enums.ItemType;
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
        id: number;
        createdAt: Date;
        updatedAt: Date;
        userId: number;
        totalAmount: import("@prisma/client-runtime-utils").Decimal;
        status: import("@prisma/client").$Enums.BookingStatus;
        paymentStatus: import("@prisma/client").$Enums.PaymentStatus;
        notes: string | null;
    }>;
    verifyPayment(id: number): Promise<{
        success: boolean;
        bookingId: number;
    } | {
        success: boolean;
        bookingId: number;
        alreadyPaid: boolean;
        bylStatus?: undefined;
        message?: undefined;
    } | {
        success: boolean;
        bookingId: number;
        bylStatus: string;
        message: string;
        alreadyPaid?: undefined;
    }>;
    bylWebhook(body: any, signature: string): Promise<{
        success: boolean;
        error?: undefined;
        message?: undefined;
    } | {
        success: boolean;
        error: any;
        message?: undefined;
    } | {
        success: boolean;
        message: string;
        error?: undefined;
    }>;
    updateStatus(id: number, status: BookingStatus, req: any): Promise<{
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
            quantity: number;
            bundleServiceId: number | null;
            itemType: import("@prisma/client").$Enums.ItemType;
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
    updateNotes(id: number, notes: string, req: any): Promise<{
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
            quantity: number;
            bundleServiceId: number | null;
            itemType: import("@prisma/client").$Enums.ItemType;
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
    updatePaymentStatus(id: number, paymentStatus: string, req: any): Promise<{
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
            quantity: number;
            bundleServiceId: number | null;
            itemType: import("@prisma/client").$Enums.ItemType;
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
