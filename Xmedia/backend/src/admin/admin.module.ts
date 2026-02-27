import { Module, OnModuleInit } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { PrismaModule } from '../prisma.module';
import { AdminService } from './admin.service';
import { AdminLogService } from './admin-log.service';
import { AdminController } from './admin.controller';
import { JwtStrategy, JWT_SECRET } from './jwt.strategy';

@Module({
    imports: [
        PrismaModule,
        PassportModule,
        JwtModule.register({
            secret: JWT_SECRET,
            signOptions: { expiresIn: '24h' },
        }),
    ],
    controllers: [AdminController],
    providers: [AdminService, AdminLogService, JwtStrategy],
    exports: [AdminService, AdminLogService, JwtModule],
})
export class AdminModule implements OnModuleInit {
    constructor(private readonly adminService: AdminService) { }
    async onModuleInit() { await this.adminService.seed(); }
}
