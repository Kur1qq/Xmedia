import { Controller, Get, Post, Body, Put, Param, Delete, ParseIntPipe, UseGuards } from '@nestjs/common';
import { BundleServiceService } from './bundle-service.service';
import { JwtAuthGuard } from '../admin/jwt-auth.guard';

@Controller('bundle-services')
export class BundleServiceController {
    constructor(private readonly bundleServiceService: BundleServiceService) { }

    @Get()
    findAll() {
        return this.bundleServiceService.findAll();
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.bundleServiceService.findOne(id);
    }

    @Post()
    @UseGuards(JwtAuthGuard)
    create(@Body() data: any) {
        return this.bundleServiceService.create(data);
    }

    @Put(':id')
    @UseGuards(JwtAuthGuard)
    update(@Param('id', ParseIntPipe) id: number, @Body() data: any) {
        return this.bundleServiceService.update(id, data);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.bundleServiceService.remove(id);
    }
}
