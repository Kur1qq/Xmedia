import { PrismaService } from '../prisma.service';
export declare class DashboardController {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getSummary(): Promise<{
        totalUsers: number;
        totalBookings: number;
        totalRevenue: number | import("@prisma/client/runtime/library").Decimal;
        activeStudios: number;
        activeEquipment: number;
        revenueChart: {
            label: string;
            amount: number;
        }[];
        weeklyRevenueChart: {
            label: string;
            amount: number;
        }[];
        pendingInvoiceUsers: number;
        breakdown: {
            studioRevenue: number;
            liveRevenue: number;
            editRevenue: number;
            bundleRevenue: number;
            photographerRevenue: number;
        };
    }>;
    getCustomRevenue(startDate?: string, endDate?: string, serviceType?: string): Promise<{
        customRevenue: number | import("@prisma/client/runtime/library").Decimal;
        details: {
            id: number;
            bookingId: number;
            userName: string;
            userPhone: string;
            serviceType: import("@prisma/client").$Enums.ItemType;
            totalPrice: number;
            date: Date;
            bookingDate: string;
        }[];
    }>;
}
