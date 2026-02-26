import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { EquipmentService } from './equipment.service';
import { EquipmentType } from '@prisma/client';

@Controller('equipment')
export class EquipmentController {
    constructor(private readonly equipmentService: EquipmentService) { }

    @Post()
    create(
        @Body() createData: { name: string; description?: string; type?: EquipmentType; images?: string },
    ) {
        return this.equipmentService.create(createData);
    }

    @Get()
    findAll() {
        return this.equipmentService.findAll();
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.equipmentService.findOne(id);
    }

    @Patch(':id')
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateData: { name?: string; description?: string; type?: EquipmentType; images?: string },
    ) {
        return this.equipmentService.update(id, updateData);
    }

    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.equipmentService.remove(id);
    }
}
