import { Module } from '@nestjs/common';
import { LiveServiceService } from './live-service.service';
import { LiveServiceController } from './live-service.controller';
import { PrismaModule } from '../prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [LiveServiceController],
    providers: [LiveServiceService],
})
export class LiveServiceModule { }
