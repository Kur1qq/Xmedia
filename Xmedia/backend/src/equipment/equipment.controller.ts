import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Req } from '@nestjs/common';
import { EquipmentService } from './equipment.service';
import { EquipmentType } from '@prisma/client';
import { AdminLogService } from '../admin/admin-log.service';

@Controller('equipment')
export class EquipmentController {
    constructor(
        private readonly equipmentService: EquipmentService,
        private readonly log: AdminLogService,
    ) { }

    @Post()
    async create(@Body() createData: { name: string; description?: string; type?: EquipmentType; images?: string }, @Req() req: any) {
        const result = await this.equipmentService.create(createData);
        this.log.log(req.user?.id ?? 0, 'EQUIPMENT_CREATE', 'Equipment', result?.id, createData.name, req.ip).catch(() => { });
        return result;
    }

    @Get()
    findAll() { return this.equipmentService.findAll(); }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) { return this.equipmentService.findOne(id); }

    @Patch(':id')
    async update(@Param('id', ParseIntPipe) id: number, @Body() updateData: { name?: string; description?: string; type?: EquipmentType; images?: string }, @Req() req: any) {
        const result = await this.equipmentService.update(id, updateData);
        this.log.log(req.user?.id ?? 0, 'EQUIPMENT_UPDATE', 'Equipment', id, updateData.name, req.ip).catch(() => { });
        return result;
    }

    @Delete(':id')
    async remove(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
        const result = await this.equipmentService.remove(id);
        this.log.log(req.user?.id ?? 0, 'EQUIPMENT_DELETE', 'Equipment', id, undefined, req.ip).catch(() => { });
        return result;
    }
}
