import {
    Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards,
} from '@nestjs/common';
import { PortfolioService } from './portfolio.service';
import { JwtAuthGuard } from '../admin/jwt-auth.guard';
import { PortfolioServiceType } from '@prisma/client';

@Controller('portfolio')
export class PortfolioController {
    constructor(private readonly portfolioService: PortfolioService) { }

    @Get()
    findAll(@Query('serviceType') serviceType?: PortfolioServiceType) {
        return this.portfolioService.findAll(serviceType);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.portfolioService.findOne(+id);
    }

    @UseGuards(JwtAuthGuard)
    @Post()
    create(@Body() body: {
        serviceType: PortfolioServiceType;
        title: string;
        description?: string;
        images: string[];
        tags?: string[];
        isPublished?: boolean;
        sortOrder?: number;
    }) {
        return this.portfolioService.create(body);
    }

    @UseGuards(JwtAuthGuard)
    @Patch(':id')
    update(@Param('id') id: string, @Body() body: {
        serviceType?: PortfolioServiceType;
        title?: string;
        description?: string;
        images?: string[];
        tags?: string[];
        isPublished?: boolean;
        sortOrder?: number;
    }) {
        return this.portfolioService.update(+id, body);
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.portfolioService.remove(+id);
    }
}
