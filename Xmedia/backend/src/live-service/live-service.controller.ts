import { Controller, Get, Post, Body, Patch, Param, Delete, Req } from '@nestjs/common';
import { LiveServiceService } from './live-service.service';
import { AdminLogService } from '../admin/admin-log.service';

@Controller('live-services')
export class LiveServiceController {
    constructor(
        private readonly liveServiceService: LiveServiceService,
        private readonly log: AdminLogService,
    ) { }

    @Post()
    async create(@Body() body: any, @Req() req: any) {
        const result = await this.liveServiceService.create(body);
        this.log.log(req.user?.id ?? 0, 'LIVE_SERVICE_CREATE', 'LiveService', result?.id, body?.name, req.ip).catch(() => { });
        return result;
    }

    @Get()
    findAll() { return this.liveServiceService.findAll(); }

    @Get(':id')
    findOne(@Param('id') id: string) { return this.liveServiceService.findOne(+id); }

    @Patch(':id')
    async update(@Param('id') id: string, @Body() body: any, @Req() req: any) {
        const result = await this.liveServiceService.update(+id, body);
        this.log.log(req.user?.id ?? 0, 'LIVE_SERVICE_UPDATE', 'LiveService', +id, body?.name, req.ip).catch(() => { });
        return result;
    }

    @Delete(':id')
    async remove(@Param('id') id: string, @Req() req: any) {
        const result = await this.liveServiceService.remove(+id);
        this.log.log(req.user?.id ?? 0, 'LIVE_SERVICE_DELETE', 'LiveService', +id, undefined, req.ip).catch(() => { });
        return result;
    }
}
