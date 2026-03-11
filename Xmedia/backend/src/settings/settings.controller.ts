import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { RolesGuard } from '../admin/jwt-auth.guard';

@Controller('settings')
export class SettingsController {
    constructor(private readonly settingsService: SettingsService) { }

    @Get()
    findAll() {
        return this.settingsService.findSettings();
    }

    @UseGuards(RolesGuard('SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'EDITOR'))
    @Patch()
    update(@Body() body: { snowEffect?: boolean }) {
        return this.settingsService.updateSettings(body);
    }
}
