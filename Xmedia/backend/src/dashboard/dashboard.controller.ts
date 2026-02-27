import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Controller('dashboard')
export class DashboardController {
    constructor(private readonly prisma: PrismaService) { }

    @Get('summary')
    async getSummary() {
        const [
            totalUsers,
            totalBookings,
            totalRevenue,
            activeStudios,
            activeEquipment
        ] = await Promise.all([
            this.prisma.user.count(),
            this.prisma.booking.count(),
            this.prisma.booking.aggregate({
                _sum: { totalAmount: true },
                where: { paymentStatus: 'PAID' }
            }),
            this.prisma.studio.count({ where: { isAvailable: true } }),
            this.prisma.equipment.count()
        ]);

        return {
            totalUsers,
            totalBookings,
            totalRevenue: totalRevenue._sum.totalAmount || 0,
            activeStudios,
            activeEquipment
        };
    }
}
