import { PrismaService } from '../prisma.service';
export declare class SettingsService {
    private prisma;
    constructor(prisma: PrismaService);
    private getOrCreate;
    findSettings(): Promise<{
        id: number;
        updatedAt: Date;
        snowEffect: boolean;
        headerNav: import("@prisma/client/runtime/library").JsonValue | null;
        homeCards: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    updateSettings(data: {
        snowEffect?: boolean;
        headerNav?: any;
        homeCards?: any;
    }): Promise<{
        id: number;
        updatedAt: Date;
        snowEffect: boolean;
        headerNav: import("@prisma/client/runtime/library").JsonValue | null;
        homeCards: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
}
