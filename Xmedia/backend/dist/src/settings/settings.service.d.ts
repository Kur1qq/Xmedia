import { PrismaService } from '../prisma.service';
export declare class SettingsService {
    private prisma;
    constructor(prisma: PrismaService);
    private getOrCreate;
    findSettings(): Promise<{
        id: number;
        updatedAt: Date;
        snowEffect: boolean;
    }>;
    updateSettings(data: {
        snowEffect?: boolean;
    }): Promise<{
        id: number;
        updatedAt: Date;
        snowEffect: boolean;
    }>;
}
