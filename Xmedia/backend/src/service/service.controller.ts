import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ServiceService } from './service.service';
import { RolesGuard } from '../admin/jwt-auth.guard';

@Controller('services')
export class ServiceController {
    constructor(private readonly serviceService: ServiceService) { }

    @UseGuards(RolesGuard('SUPER_ADMIN', 'ADMIN'))
    @Post()
    create(@Body() createServiceDto: any) {
        return this.serviceService.create(createServiceDto);
    }

    @Get()
    findAll() {
        return this.serviceService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.serviceService.findOne(+id);
    }

    @UseGuards(RolesGuard('SUPER_ADMIN', 'ADMIN'))
    @Patch(':id')
    update(@Param('id') id: string, @Body() updateServiceDto: any) {
        return this.serviceService.update(+id, updateServiceDto);
    }

    @UseGuards(RolesGuard('SUPER_ADMIN', 'ADMIN'))
    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.serviceService.remove(+id);
    }
}
