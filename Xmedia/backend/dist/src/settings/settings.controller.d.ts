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
    }>;
    update(body: {
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
