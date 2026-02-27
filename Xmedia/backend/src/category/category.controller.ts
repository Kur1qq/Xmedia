import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Req } from '@nestjs/common';
import { CategoryService } from './category.service';
import { AdminLogService } from '../admin/admin-log.service';

@Controller('categories')
export class CategoryController {
    constructor(
        private readonly categoryService: CategoryService,
        private readonly log: AdminLogService,
    ) { }

    @Post()
    async create(@Body() dto: { name: string; description?: string; icon?: string }, @Req() req: any) {
        const result = await this.categoryService.create(dto);
        this.log.log(req.user?.id ?? 0, 'CATEGORY_CREATE', 'Category', result?.id, dto.name, req.ip).catch(() => { });
        return result;
    }

    @Get()
    findAll() { return this.categoryService.findAll(); }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) { return this.categoryService.findOne(id); }

    @Patch(':id')
    async update(@Param('id', ParseIntPipe) id: number, @Body() dto: { name?: string; description?: string; icon?: string }, @Req() req: any) {
        const result = await this.categoryService.update(id, dto);
        this.log.log(req.user?.id ?? 0, 'CATEGORY_UPDATE', 'Category', id, dto.name, req.ip).catch(() => { });
        return result;
    }

    @Delete(':id')
    async remove(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
        const result = await this.categoryService.remove(id);
        this.log.log(req.user?.id ?? 0, 'CATEGORY_DELETE', 'Category', id, undefined, req.ip).catch(() => { });
        return result;
    }
}
