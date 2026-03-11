import { SettingsService } from './settings.service';
export declare class SettingsController {
    private readonly settingsService;
    constructor(settingsService: SettingsService);
    findAll(): Promise<{
        id: number;
        updatedAt: Date;
        snowEffect: boolean;
    }>;
    update(body: {
        snowEffect?: boolean;
    }): Promise<{
        id: number;
        updatedAt: Date;
        snowEffect: boolean;
    }>;
}
