import { SettingsService } from './settings.service';
export declare class SettingsController {
    private readonly settingsService;
    constructor(settingsService: SettingsService);
    findAll(): Promise<{
        id: number;
        updatedAt: Date;
        snowEffect: boolean;
        headerNav: import("@prisma/client/runtime/library").JsonValue | null;
        homeCards: import("@prisma/client/runtime/library").JsonValue | null;
        contactInfo: import("@prisma/client/runtime/library").JsonValue | null;
        presentationUrl: string | null;
    }>;
    update(body: {
        snowEffect?: boolean;
        headerNav?: any;
        homeCards?: any;
        contactInfo?: any;
        presentationUrl?: string;
    }): Promise<{
        id: number;
        updatedAt: Date;
        snowEffect: boolean;
        headerNav: import("@prisma/client/runtime/library").JsonValue | null;
        homeCards: import("@prisma/client/runtime/library").JsonValue | null;
        contactInfo: import("@prisma/client/runtime/library").JsonValue | null;
        presentationUrl: string | null;
    }>;
}
