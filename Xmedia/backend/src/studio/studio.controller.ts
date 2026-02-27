import { Controller, Get, Post, Body, Patch, Param, Delete, Req } from '@nestjs/common';
import { StudioService } from './studio.service';
import { AdminLogService } from '../admin/admin-log.service';

@Controller('studio')
export class StudioController {
    constructor(
        private readonly studioService: StudioService,
        private readonly log: AdminLogService,
    ) { }

    @Post()
    async create(@Body() dto: any, @Req() req: any) {
        const result = await this.studioService.create(dto);
        this.log.log(req.user?.id ?? 0, 'STUDIO_CREATE', 'Studio', result?.id, result?.name, req.ip).catch(() => { });
        return result;
    }

    @Get()
    findAll() { return this.studioService.findAll(); }

    @Get(':id')
    findOne(@Param('id') id: string) { return this.studioService.findOne(+id); }

    @Patch(':id')
    async update(@Param('id') id: string, @Body() dto: any, @Req() req: any) {
        const result = await this.studioService.update(+id, dto);
        this.log.log(req.user?.id ?? 0, 'STUDIO_UPDATE', 'Studio', +id, dto?.name, req.ip).catch(() => { });
        return result;
    }

    @Delete(':id')
    async remove(@Param('id') id: string, @Req() req: any) {
        const result = await this.studioService.remove(+id);
        this.log.log(req.user?.id ?? 0, 'STUDIO_DELETE', 'Studio', +id, undefined, req.ip).catch(() => { });
        return result;
    }
}
