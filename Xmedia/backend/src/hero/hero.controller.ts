import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { HeroService } from './hero.service';
import { RolesGuard } from '../admin/jwt-auth.guard';

@Controller('hero')
export class HeroController {
    constructor(private readonly heroService: HeroService) { }

    @Get()
    findAll() {
        return this.heroService.findAll();
    }

    @Get('active')
    findActive() {
        return this.heroService.findActive();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.heroService.findOne(+id);
    }

    @UseGuards(RolesGuard('SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'EDITOR'))
    @Post()
    create(@Body() createHeroDto: any) {
        return this.heroService.create(createHeroDto);
    }

    @UseGuards(RolesGuard('SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'EDITOR'))
    @Patch(':id')
    update(@Param('id') id: string, @Body() updateHeroDto: any) {
        return this.heroService.update(+id, updateHeroDto);
    }

    @UseGuards(RolesGuard('SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'EDITOR'))
    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.heroService.remove(+id);
    }
}
