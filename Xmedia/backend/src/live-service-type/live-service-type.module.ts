import { Module } from '@nestjs/common';
import { LiveServiceTypeService } from './live-service-type.service';
import { LiveServiceTypeController } from './live-service-type.controller';
import { PrismaModule } from '../prisma.module';
import { AdminModule } from '../admin/admin.module';

@Module({
    imports: [PrismaModule, AdminModule],
    controllers: [LiveServiceTypeController],
    providers: [LiveServiceTypeService],
})
export class LiveServiceTypeModule { }
