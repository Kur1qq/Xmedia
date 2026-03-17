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
    }>;
}
