import { Controller, Get, Query } from '@nestjs/common';
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
            recentWeeklyBookings,
            groupedRevenueData
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
            }),
            this.prisma.bookingItem.groupBy({
                by: ['itemType'],
                where: {
                    booking: {
                        paymentStatus: 'PAID'
                    }
                },
                _sum: {
                    totalPrice: true
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

        let studioRevenue = 0;
        let liveRevenue = 0;
        let editRevenue = 0;
        let bundleRevenue = 0;
        let photographerRevenue = 0;

        groupedRevenueData.forEach(item => {
            const amount = Number(item._sum.totalPrice || 0);
            switch (item.itemType) {
                case 'STUDIO':
                    studioRevenue += amount;
                    break;
                case 'LIVE_SERVICE':
                    liveRevenue += amount;
                    break;
                case 'EDIT_SERVICE':
                    editRevenue += amount;
                    break;
                case 'BUNDLE_SERVICE':
                    bundleRevenue += amount;
                    break;
                case 'SERVICE':
                case 'PHOTOGRAPHER_SERVICE':
                    photographerRevenue += amount;
                    break;
            }
        });

        return {
            totalUsers,
            totalBookings,
            totalRevenue: totalRevenue._sum.totalAmount || 0,
            activeStudios,
            activeEquipment,
            revenueChart,
            weeklyRevenueChart,
            pendingInvoiceUsers,
            breakdown: {
                studioRevenue,
                liveRevenue,
                editRevenue,
                bundleRevenue,
                photographerRevenue
            }
        };
    }

    @Get('custom-revenue')
    async getCustomRevenue(
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
        @Query('serviceType') serviceType?: string
    ) {
        let dateFilter: any = {};
        if (startDate && endDate) {
            // Include entire end date by setting time to 23:59:59.999
            const start = new Date(startDate);
            start.setHours(0, 0, 0, 0);
            
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            
            dateFilter = {
                gte: start,
                lte: end
            };
        } else if (startDate) {
            const start = new Date(startDate);
            start.setHours(0, 0, 0, 0);
            dateFilter = { gte: start };
        } else if (endDate) {
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            dateFilter = { lte: end };
        }

        let itemTypeFilter: any = undefined;
        if (serviceType && serviceType !== 'ALL') {
             if (serviceType === 'PHOTOGRAPHER_SERVICE') {
                 itemTypeFilter = { in: ['SERVICE', 'PHOTOGRAPHER_SERVICE'] };
             } else {
                 itemTypeFilter = serviceType;
             }
        }

        const whereClause: any = {
            paymentStatus: 'PAID'
        };

        if (Object.keys(dateFilter).length > 0) {
            whereClause.createdAt = dateFilter;
        }

        const result = await this.prisma.bookingItem.aggregate({
            _sum: {
                totalPrice: true
            },
            where: {
                booking: whereClause,
                ...(itemTypeFilter ? { itemType: itemTypeFilter } : {})
            }
        });

        // Fetch granular details for Excel export
        const items = await this.prisma.bookingItem.findMany({
            where: {
                booking: whereClause,
                ...(itemTypeFilter ? { itemType: itemTypeFilter } : {})
            },
            include: {
                booking: {
                    include: {
                        user: { select: { username: true, phone: true } }
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        const details = items.map(item => ({
            id: item.id,
            bookingId: item.bookingId,
            userName: item.booking?.user?.username || 'Тодорхойгүй',
            userPhone: item.booking?.user?.phone || 'Тодорхойгүй',
            serviceType: item.itemType,
            totalPrice: Number(item.totalPrice),
            date: item.createdAt,
            bookingDate: item.bookingDate
        }));

        return {
            customRevenue: result._sum.totalPrice || 0,
            details
        };
    }
}
