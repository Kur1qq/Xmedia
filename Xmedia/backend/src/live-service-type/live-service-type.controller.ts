import { Controller, Get, Post, Body, Patch, Param, Delete, Req } from '@nestjs/common';
import { LiveServiceTypeService } from './live-service-type.service';
import { AdminLogService } from '../admin/admin-log.service';

@Controller('live-service-types')
export class LiveServiceTypeController {
    constructor(
        private readonly service: LiveServiceTypeService,
        private readonly log: AdminLogService,
    ) { }

    // ===== MAIN TYPES =====
    @Get('main') findAllMain() { return this.service.findAllMainTypes(); }

    @Post('main')
    async createMain(@Body() body: any, @Req() req: any) {
        const r = await this.service.createMainType(body);
        this.log.log(req.user?.id ?? 0, 'LIVE_TYPE_CREATE', 'LiveServiceType', r?.id, body?.name, req.ip).catch(() => { });
        return r;
    }

    @Patch('main/:id')
    async updateMain(@Param('id') id: string, @Body() body: any, @Req() req: any) {
        const r = await this.service.updateMainType(+id, body);
        this.log.log(req.user?.id ?? 0, 'LIVE_TYPE_UPDATE', 'LiveServiceType', +id, body?.name, req.ip).catch(() => { });
        return r;
    }

    @Delete('main/:id')
    async removeMain(@Param('id') id: string, @Req() req: any) {
        const r = await this.service.removeMainType(+id);
        this.log.log(req.user?.id ?? 0, 'LIVE_TYPE_DELETE', 'LiveServiceType', +id, undefined, req.ip).catch(() => { });
        return r;
    }

    // ===== SUB TYPES =====
    @Get('sub/:mainTypeId')
    findSub(@Param('mainTypeId') mainTypeId: string) { return this.service.findSubTypesByMain(+mainTypeId); }

    @Post('sub')
    async createSub(@Body() body: any, @Req() req: any) {
        const r = await this.service.createSubType(body);
        this.log.log(req.user?.id ?? 0, 'LIVE_SUBTYPE_CREATE', 'LiveServiceSubType', r?.id, body?.name, req.ip).catch(() => { });
        return r;
    }

    @Patch('sub/:id')
    async updateSub(@Param('id') id: string, @Body() body: any, @Req() req: any) {
        const r = await this.service.updateSubType(+id, body);
        this.log.log(req.user?.id ?? 0, 'LIVE_SUBTYPE_UPDATE', 'LiveServiceSubType', +id, body?.name, req.ip).catch(() => { });
        return r;
    }

    @Delete('sub/:id')
    async removeSub(@Param('id') id: string, @Req() req: any) {
        const r = await this.service.removeSubType(+id);
        this.log.log(req.user?.id ?? 0, 'LIVE_SUBTYPE_DELETE', 'LiveServiceSubType', +id, undefined, req.ip).catch(() => { });
        return r;
    }
}
