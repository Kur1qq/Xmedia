import { Module, OnModuleInit } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { PrismaModule } from '../prisma.module';
import { AdminService } from './admin.service';
import { AdminLogService } from './admin-log.service';
import { AdminController } from './admin.controller';
import { JwtStrategy, JWT_SECRET, JWT_EXPIRES_IN } from './jwt.strategy';

@Module({
    imports: [
        PrismaModule,
        PassportModule,
        JwtModule.register({
            secret: JWT_SECRET,
            signOptions: { expiresIn: JWT_EXPIRES_IN as any },
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
