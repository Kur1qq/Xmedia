import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { PaymentStatus } from '@prisma/client';

@Controller('dashboard')
export class DashboardController {
    constructor(private readonly prisma: PrismaService) { }

    @Get('summary')
    async getSummary() {
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
        sixMonthsAgo.setDate(1);
        sixMonthsAgo.setHours(0, 0, 0, 0);

        const [
            totalUsers,
            totalBookings,
            totalRevenue,
            activeStudios,
            activeEquipment,
            recentPaidBookings,
            pendingInvoiceUsers,
            recentWeeklyBookings
        ] = await Promise.all([
            this.prisma.user.count(),
            this.prisma.booking.count(),
            this.prisma.booking.aggregate({
                _sum: { totalAmount: true },
                where: { paymentStatus: 'PAID' }
            }),
            this.prisma.studio.count({ where: { isAvailable: true } }),
            this.prisma.equipment.count(),
            this.prisma.booking.findMany({
                where: {
                    paymentStatus: 'PAID',
                    createdAt: { gte: sixMonthsAgo }
                },
                select: {
                    totalAmount: true,
                    createdAt: true
                }
            }),
            this.prisma.booking.count({
                where: {
                    paymentStatus: PaymentStatus.UNPAID
                }
            }),
            this.prisma.booking.findMany({
                where: {
                    paymentStatus: 'PAID',
                    createdAt: { gte: new Date(Date.now() - 8 * 7 * 24 * 60 * 60 * 1000) }
                },
                select: {
                    totalAmount: true,
                    createdAt: true
                }
            })
        ]);

        // Build weekly chart data (last 8 weeks)
        const getWeekNum = (d: Date): number => {
            const tmp = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
            tmp.setUTCDate(tmp.getUTCDate() + 4 - (tmp.getUTCDay() || 7));
            const yearStart = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 1));
            return Math.ceil((((tmp as any) - (yearStart as any)) / 86400000 + 1) / 7);
        };
        const weeklyMap = new Map<string, number>();
        for (let i = 7; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i * 7);
            const label = `${getWeekNum(d)}-р 7 хоног`;
            weeklyMap.set(label, 0);
        }
        recentWeeklyBookings.forEach(b => {
            const label = `${getWeekNum(b.createdAt)}-р 7 хоног`;
            if (weeklyMap.has(label)) {
                weeklyMap.set(label, weeklyMap.get(label)! + Number(b.totalAmount));
            }
        });
        const weeklyRevenueChart = Array.from(weeklyMap.entries()).map(([label, amount]) => ({ label, amount }));

        const months = ['1-р сар', '2-р сар', '3-р сар', '4-р сар', '5-р сар', '6-р сар', '7-р сар', '8-р сар', '9-р сар', '10-р сар', '11-р сар', '12-р сар'];
        const revenueByMonth = new Map<string, number>();

        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            revenueByMonth.set(months[d.getMonth()], 0);
        }

        recentPaidBookings.forEach(b => {
            const m = months[b.createdAt.getMonth()];
            if (revenueByMonth.has(m)) {
                revenueByMonth.set(m, revenueByMonth.get(m)! + Number(b.totalAmount));
            }
        });

        const revenueChart = Array.from(revenueByMonth.entries()).map(([label, amount]) => ({ label, amount }));

        return {
            totalUsers,
            totalBookings,
            totalRevenue: totalRevenue._sum.totalAmount || 0,
            activeStudios,
            activeEquipment,
            revenueChart,
            weeklyRevenueChart,
            pendingInvoiceUsers
        };
    }
}
