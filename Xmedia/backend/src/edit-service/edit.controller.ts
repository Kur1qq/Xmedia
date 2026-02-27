import { Controller, Get, Post, Body, Patch, Param, Delete, Req } from '@nestjs/common';
import { EditTypeService } from './edit-type.service';
import { EditServiceService } from './edit-service.service';
import { AdminLogService } from '../admin/admin-log.service';

@Controller('edit-types')
export class EditTypeController {
    constructor(
        private readonly editTypeService: EditTypeService,
        private readonly log: AdminLogService,
    ) { }

    @Get('main') findAllMain() { return this.editTypeService.findAllMainTypes(); }

    @Post('main')
    async createMain(@Body() body: any, @Req() req: any) {
        const r = await this.editTypeService.createMainType(body);
        this.log.log(req.user?.id ?? 0, 'EDIT_TYPE_CREATE', 'EditMainType', r?.id, body?.name, req.ip).catch(() => { });
        return r;
    }

    @Patch('main/:id')
    async updateMain(@Param('id') id: string, @Body() body: any, @Req() req: any) {
        const r = await this.editTypeService.updateMainType(+id, body);
        this.log.log(req.user?.id ?? 0, 'EDIT_TYPE_UPDATE', 'EditMainType', +id, body?.name, req.ip).catch(() => { });
        return r;
    }

    @Delete('main/:id')
    async removeMain(@Param('id') id: string, @Req() req: any) {
        const r = await this.editTypeService.removeMainType(+id);
        this.log.log(req.user?.id ?? 0, 'EDIT_TYPE_DELETE', 'EditMainType', +id, undefined, req.ip).catch(() => { });
        return r;
    }

    @Post('sub')
    async createSub(@Body() body: any, @Req() req: any) {
        const r = await this.editTypeService.createSubType(body);
        this.log.log(req.user?.id ?? 0, 'EDIT_SUBTYPE_CREATE', 'EditSubType', r?.id, body?.name, req.ip).catch(() => { });
        return r;
    }

    @Patch('sub/:id')
    async updateSub(@Param('id') id: string, @Body() body: any, @Req() req: any) {
        const r = await this.editTypeService.updateSubType(+id, body);
        this.log.log(req.user?.id ?? 0, 'EDIT_SUBTYPE_UPDATE', 'EditSubType', +id, body?.name, req.ip).catch(() => { });
        return r;
    }

    @Delete('sub/:id')
    async removeSub(@Param('id') id: string, @Req() req: any) {
        const r = await this.editTypeService.removeSubType(+id);
        this.log.log(req.user?.id ?? 0, 'EDIT_SUBTYPE_DELETE', 'EditSubType', +id, undefined, req.ip).catch(() => { });
        return r;
    }
}

@Controller('edit-services')
export class EditServiceController {
    constructor(
        private readonly editServiceService: EditServiceService,
        private readonly log: AdminLogService,
    ) { }

    @Get() findAll() { return this.editServiceService.findAll(); }
    @Get(':id') findOne(@Param('id') id: string) { return this.editServiceService.findOne(+id); }

    @Post()
    async create(@Body() body: any, @Req() req: any) {
        const r = await this.editServiceService.create(body);
        this.log.log(req.user?.id ?? 0, 'EDIT_SERVICE_CREATE', 'EditService', r?.id, body?.name, req.ip).catch(() => { });
        return r;
    }

    @Patch(':id')
    async update(@Param('id') id: string, @Body() body: any, @Req() req: any) {
        const r = await this.editServiceService.update(+id, body);
        this.log.log(req.user?.id ?? 0, 'EDIT_SERVICE_UPDATE', 'EditService', +id, body?.name, req.ip).catch(() => { });
        return r;
    }

    @Delete(':id')
    async remove(@Param('id') id: string, @Req() req: any) {
        const r = await this.editServiceService.remove(+id);
        this.log.log(req.user?.id ?? 0, 'EDIT_SERVICE_DELETE', 'EditService', +id, undefined, req.ip).catch(() => { });
        return r;
    }
}
