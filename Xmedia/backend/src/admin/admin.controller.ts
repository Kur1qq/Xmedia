import { Controller, Post, Get, Body, Param, Patch, Delete, Req, UseGuards, Query, DefaultValuePipe, ParseIntPipe } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminLogService } from './admin-log.service';
import { RolesGuard } from './jwt-auth.guard';
import { AdminNotificationService } from './admin-notification.service';

@Controller('admin')
export class AdminController {
    constructor(
        private readonly adminService: AdminService,
        private readonly adminLogService: AdminLogService,
        private readonly adminNotificationService: AdminNotificationService,
    ) { }

    // ---- Auth (public) ----
    @Post('login')
    async login(@Body() body: { username: string; password: string }, @Req() req: any) {
        try {
            const result = await this.adminService.login(body.username, body.password);
            try {
                await this.adminLogService.log(result.admin.id, 'LOGIN', 'Admin', result.admin.id, undefined, req.ip);
            } catch (logErr) {
                console.error('Login log failed:', logErr);
            }
            return result;
        } catch (err) {
            console.error('Login error:', err);
            throw err;
        }
    }

    // ---- Logs (must come BEFORE :id routes to avoid routing conflict) ----
    @UseGuards(RolesGuard('SUPER_ADMIN', 'ADMIN'))
    @Get('logs')
    async getLogs(
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
        @Query('adminId') adminId?: string,
        @Query('action') action?: string,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
    ) {
        return this.adminLogService.findAll({
            limit,
            adminId: adminId ? parseInt(adminId, 10) : undefined,
        });
    }

    // ─── Notifications ────────────────────────────────────────────────────────────

    @UseGuards(RolesGuard('SUPER_ADMIN', 'ADMIN'))
    @Get('notifications')
    async getNotifications() {
        return this.adminNotificationService.getNotifications();
    }

    @UseGuards(RolesGuard('SUPER_ADMIN', 'ADMIN'))
    @Patch('notifications/read-all')
    async markAllNotificationsAsRead() {
        return this.adminNotificationService.markAllAsRead();
    }

    @UseGuards(RolesGuard('SUPER_ADMIN', 'ADMIN'))
    @Patch('notifications/:id/read')
    async markNotificationAsRead(@Param('id', ParseIntPipe) id: number) {
        return this.adminNotificationService.markAsRead(id);
    }

    // ---- Role Management (BEFORE :id routes) ----
    @UseGuards(RolesGuard('SUPER_ADMIN', 'ADMIN'))
    @Get('roles')
    getRoles() { return this.adminService.findAllRoles(); }

    @UseGuards(RolesGuard('SUPER_ADMIN'))
    @Post('roles')
    async createRole(@Body() body: { name: string; permissions: string[] }, @Req() req: any) {
        const result = await this.adminService.createRole(body);
        await this.adminLogService.log(req.user?.id, 'ROLE_CREATE', 'AdminPermissionRole', result.id, `name=${result.name}`, req.ip);
        return result;
    }

    @UseGuards(RolesGuard('SUPER_ADMIN'))
    @Patch('roles/:id')
    async updateRole(@Param('id') id: string, @Body() body: { name?: string; permissions?: string[] }, @Req() req: any) {
        const result = await this.adminService.updateRole(+id, body);
        await this.adminLogService.log(req.user?.id, 'ROLE_UPDATE', 'AdminPermissionRole', +id, `name=${result.name}`, req.ip);
        return result;
    }

    @UseGuards(RolesGuard('SUPER_ADMIN'))
    @Delete('roles/:id')
    async removeRole(@Param('id') id: string, @Req() req: any) {
        const result = await this.adminService.removeRole(+id);
        await this.adminLogService.log(req.user?.id, 'ROLE_DELETE', 'AdminPermissionRole', +id, undefined, req.ip);
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
        await this.adminLogService.log(req.admin.id, 'CREATE', 'AdminUser', result.id, `Created ${result.username}`, req.ip);
        return result;
    }

    @UseGuards(RolesGuard('SUPER_ADMIN'))
    @Patch(':id')
    async update(@Param('id') id: string, @Body() body: any, @Req() req: any) {
        const result = await this.adminService.update(+id, body);
        await this.adminLogService.log(req.admin.id, 'UPDATE', 'Admin', +id, undefined, req.ip);
        return result;
    }

    @UseGuards(RolesGuard('SUPER_ADMIN'))
    @Delete(':id')
    async remove(@Param('id') id: string, @Req() req: any) {
        const result = await this.adminService.remove(+id);
        await this.adminLogService.log(req.admin.id, 'DELETE', 'Admin', +id, undefined, req.ip);
        return result;
    }
}
