import { PrismaService } from './prisma.service';
export declare class HealthController {
    private readonly prisma;
    constructor(prisma: PrismaService);
    checkDatabase(): Promise<{
        status: string;
        message: string;
        timestamp: string;
        error?: undefined;
    } | {
        status: string;
        message: string;
        error: any;
        timestamp: string;
    }>;
}
