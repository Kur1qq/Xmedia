import { Controller, Get, Post, Body, Patch, Param, Delete, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Post()
    create(@Body() body: { username: string; email: string; phone?: string; passwordHash: string }) {
        return this.usersService.create(body);
    }

    @Post('check-email')
    async checkEmail(@Body() body: { email: string }) {
        const user = await this.usersService.findByEmail(body.email);
        return { exists: !!user };
    }

    @Post('reset-password')
    async resetPassword(@Body() body: { email: string; passwordHash: string }) {
        const user = await this.usersService.findByEmail(body.email);
        if (!user) {
            throw new Error('User not found');
        }
        await this.usersService.resetPassword(body.email, body.passwordHash);
        return { success: true };
    }

    @Post('login')
    async login(@Body() body: { email: string; passwordHash: string }) {
        try {
            return await this.usersService.login(body.email, body.passwordHash);
        } catch (error) {
            throw new UnauthorizedException('Нэвтрэх нэр эсвэл нууц үг буруу байна');
        }
    }

    @Get()
    findAll() {
        return this.usersService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.usersService.findOne(+id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() body: { username?: string; email?: string; phone?: string; passwordHash?: string }) {
        return this.usersService.update(+id, body);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        throw new ForbiddenException('Хэрэглэгчийг устгах боломжгүй.');
    }
}
