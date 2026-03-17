import { PrismaService } from '../prisma.service';
export declare class SettingsService {
    private prisma;
    constructor(prisma: PrismaService);
    private getOrCreate;
    findSettings(): Promise<{
        id: number;
        snowEffect: boolean;
        headerNav: import("@prisma/client/runtime/library").JsonValue | null;
        homeCards: import("@prisma/client/runtime/library").JsonValue | null;
        contactInfo: import("@prisma/client/runtime/library").JsonValue | null;
        presentationUrl: string | null;
        updatedAt: Date;
    }>;
    updateSettings(data: {
        snowEffect?: boolean;
        headerNav?: any;
        homeCards?: any;
        contactInfo?: any;
        presentationUrl?: string;
    }): Promise<{
        id: number;
        snowEffect: boolean;
        headerNav: import("@prisma/client/runtime/library").JsonValue | null;
        homeCards: import("@prisma/client/runtime/library").JsonValue | null;
        contactInfo: import("@prisma/client/runtime/library").JsonValue | null;
        presentationUrl: string | null;
        updatedAt: Date;
    }>;
}
