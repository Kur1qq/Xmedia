import { Controller, Get, Post, Body, Patch, Param, Delete, Req } from '@nestjs/common';
import { PhotographerTypeService } from './photographer-type.service';
import { AdminLogService } from '../admin/admin-log.service';

@Controller('photographer-types')
export class PhotographerTypeController {
    constructor(
        private readonly service: PhotographerTypeService,
        private readonly log: AdminLogService,
    ) { }

    // ===== MAIN TYPES =====
    @Get('main') findAllMain() { return this.service.findAllMainTypes(); }

    @Post('main')
    async createMain(@Body() body: any, @Req() req: any) {
        const r = await this.service.createMainType(body);
        this.log.log(req.user?.id ?? 0, 'PHOTOGRAPHER_TYPE_CREATE', 'PhotographerMainType', r?.id, body?.name, req.ip).catch(() => { });
        return r;
    }

    @Patch('main/:id')
    async updateMain(@Param('id') id: string, @Body() body: any, @Req() req: any) {
        const r = await this.service.updateMainType(+id, body);
        this.log.log(req.user?.id ?? 0, 'PHOTOGRAPHER_TYPE_UPDATE', 'PhotographerMainType', +id, body?.name, req.ip).catch(() => { });
        return r;
    }

    @Delete('main/:id')
    async removeMain(@Param('id') id: string, @Req() req: any) {
        const r = await this.service.removeMainType(+id);
        this.log.log(req.user?.id ?? 0, 'PHOTOGRAPHER_TYPE_DELETE', 'PhotographerMainType', +id, undefined, req.ip).catch(() => { });
        return r;
    }

    // ===== SUB TYPES =====
    @Get('sub/:mainTypeId')
    findSub(@Param('mainTypeId') mainTypeId: string) { return this.service.findSubTypesByMain(+mainTypeId); }

    @Post('sub')
    async createSub(@Body() body: any, @Req() req: any) {
        const r = await this.service.createSubType(body);
        this.log.log(req.user?.id ?? 0, 'PHOTOGRAPHER_SUBTYPE_CREATE', 'PhotographerSubType', r?.id, body?.name, req.ip).catch(() => { });
        return r;
    }

    @Patch('sub/:id')
    async updateSub(@Param('id') id: string, @Body() body: any, @Req() req: any) {
        const r = await this.service.updateSubType(+id, body);
        this.log.log(req.user?.id ?? 0, 'PHOTOGRAPHER_SUBTYPE_UPDATE', 'PhotographerSubType', +id, body?.name, req.ip).catch(() => { });
        return r;
    }

    @Delete('sub/:id')
    async removeSub(@Param('id') id: string, @Req() req: any) {
        const r = await this.service.removeSubType(+id);
        this.log.log(req.user?.id ?? 0, 'PHOTOGRAPHER_SUBTYPE_DELETE', 'PhotographerSubType', +id, undefined, req.ip).catch(() => { });
        return r;
    }
}
