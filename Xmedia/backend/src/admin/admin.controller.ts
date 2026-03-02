import { Controller, Post, Get, Body, Param, Patch, Delete, Req, UseGuards, Query } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminLogService } from './admin-log.service';
import { RolesGuard } from './jwt-auth.guard';

@Controller('admin')
export class AdminController {
    constructor(
        private readonly adminService: AdminService,
        private readonly logService: AdminLogService,
    ) { }

    // ---- Auth (public) ----
    @Post('login')
    async login(@Body() body: { username: string; password: string }, @Req() req: any) {
        const result = await this.adminService.login(body.username, body.password);
        await this.logService.log(result.admin.id, 'LOGIN', 'Admin', result.admin.id, undefined, req.ip);
        return result;
    }

    // ---- Logs (must come BEFORE :id routes to avoid routing conflict) ----
    @UseGuards(RolesGuard('SUPER_ADMIN', 'ADMIN'))
    @Get('logs')
    getLogs(
        @Query('adminId') adminId?: string,
        @Query('limit') limit?: string,
        @Query('offset') offset?: string,
    ) {
        return this.logService.findAll({
            adminId: adminId ? parseInt(adminId) : undefined,
            limit: limit ? parseInt(limit) : 100,
            offset: offset ? parseInt(offset) : 0,
        });
    }

    // ---- Role Management (BEFORE :id routes) ----
    @UseGuards(RolesGuard('SUPER_ADMIN', 'ADMIN'))
    @Get('roles')
    getRoles() { return this.adminService.findAllRoles(); }

    @UseGuards(RolesGuard('SUPER_ADMIN'))
    @Post('roles')
    async createRole(@Body() body: { name: string; permissions: string[] }, @Req() req: any) {
        const result = await this.adminService.createRole(body);
        await this.logService.log(req.user?.id, 'ROLE_CREATE', 'AdminPermissionRole', result.id, `name=${result.name}`, req.ip);
        return result;
    }

    @UseGuards(RolesGuard('SUPER_ADMIN'))
    @Patch('roles/:id')
    async updateRole(@Param('id') id: string, @Body() body: { name?: string; permissions?: string[] }, @Req() req: any) {
        const result = await this.adminService.updateRole(+id, body);
        await this.logService.log(req.user?.id, 'ROLE_UPDATE', 'AdminPermissionRole', +id, `name=${result.name}`, req.ip);
        return result;
    }

    @UseGuards(RolesGuard('SUPER_ADMIN'))
    @Delete('roles/:id')
    async removeRole(@Param('id') id: string, @Req() req: any) {
        const result = await this.adminService.removeRole(+id);
        await this.logService.log(req.user?.id, 'ROLE_DELETE', 'AdminPermissionRole', +id, undefined, req.ip);
        return result;
    }

    // ---- Admin CRUD ----
    @UseGuards(RolesGuard('SUPER_ADMIN', 'ADMIN'))
    @Get()
    findAll() { return this.adminService.findAll(); }

    @UseGuards(RolesGuard('SUPER_ADMIN', 'ADMIN'))
    @Get(':id')
    findOne(@Param('id') id: string) { return this.adminService.findOne(+id); }

    @UseGuards(RolesGuard('SUPER_ADMIN'))
    @Post()
    async create(@Body() body: any, @Req() req: any) {
        const result = await this.adminService.create(body);
        await this.logService.log(req.user?.id, 'ADMIN_CREATE', 'Admin', result.id, `username=${result.username}`, req.ip);
        return result;
    }

    @UseGuards(RolesGuard('SUPER_ADMIN'))
    @Patch(':id')
    async update(@Param('id') id: string, @Body() body: any, @Req() req: any) {
        const result = await this.adminService.update(+id, body);
        await this.logService.log(req.user?.id, 'ADMIN_UPDATE', 'Admin', +id, undefined, req.ip);
        return result;
    }

    @UseGuards(RolesGuard('SUPER_ADMIN'))
    @Delete(':id')
    async remove(@Param('id') id: string, @Req() req: any) {
        const result = await this.adminService.remove(+id);
        await this.logService.log(req.user?.id, 'ADMIN_DELETE', 'Admin', +id, undefined, req.ip);
        return result;
    }
}
