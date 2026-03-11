import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class SettingsService {
    constructor(private prisma: PrismaService) { }

    private async getOrCreate() {
        const existing = await this.prisma.siteSettings.findFirst();
        if (existing) return existing;
        return this.prisma.siteSettings.create({ data: { snowEffect: false } });
    }

    async findSettings() {
        return this.getOrCreate();
    }

    async updateSettings(data: { snowEffect?: boolean }) {
        const settings = await this.getOrCreate();
        return this.prisma.siteSettings.update({
            where: { id: settings.id },
            data,
        });
    }
}
