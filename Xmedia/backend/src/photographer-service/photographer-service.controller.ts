import { Controller, Get, Post, Body, Patch, Param, Delete, Req } from '@nestjs/common';
import { PhotographerServiceService } from './photographer-service.service';
import { AdminLogService } from '../admin/admin-log.service';

@Controller('photographer-services')
export class PhotographerServiceController {
    constructor(
        private readonly photographerServiceService: PhotographerServiceService,
        private readonly log: AdminLogService,
    ) { }

    @Post()
    async create(@Body() body: any, @Req() req: any) {
        const result = await this.photographerServiceService.create(body);
        this.log.log(req.user?.id ?? 0, 'PHOTOGRAPHER_SERVICE_CREATE', 'PhotographerService', result?.id, body?.name, req.ip).catch(() => { });
        return result;
    }

    @Get()
    findAll() { return this.photographerServiceService.findAll(); }

    @Get(':id')
    findOne(@Param('id') id: string) { return this.photographerServiceService.findOne(+id); }

    @Patch(':id')
    async update(@Param('id') id: string, @Body() body: any, @Req() req: any) {
        const result = await this.photographerServiceService.update(+id, body);
        this.log.log(req.user?.id ?? 0, 'PHOTOGRAPHER_SERVICE_UPDATE', 'PhotographerService', +id, body?.name, req.ip).catch(() => { });
        return result;
    }

    @Delete(':id')
    async remove(@Param('id') id: string, @Req() req: any) {
        const result = await this.photographerServiceService.remove(+id);
        this.log.log(req.user?.id ?? 0, 'PHOTOGRAPHER_SERVICE_DELETE', 'PhotographerService', +id, undefined, req.ip).catch(() => { });
        return result;
    }
}
