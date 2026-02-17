import { Controller, Get } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Controller('health')
export class HealthController {
    constructor(private readonly prisma: PrismaService) { }

    @Get('db')
    async checkDatabase() {
        try {
            // Try to execute a simple query
            await this.prisma.$queryRaw`SELECT 1`;
            return {
                status: 'success',
                message: 'Database connection is working! ✅',
                timestamp: new Date().toISOString(),
            };
        } catch (error) {
            return {
                status: 'error',
                message: 'Database connection failed! ❌',
                error: error.message,
                timestamp: new Date().toISOString(),
            };
        }
    }
}
