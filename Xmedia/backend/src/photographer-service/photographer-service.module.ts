import { Module } from '@nestjs/common';
import { PhotographerServiceService } from './photographer-service.service';
import { PhotographerServiceController } from './photographer-service.controller';
import { PrismaModule } from '../prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [PhotographerServiceController],
    providers: [PhotographerServiceService],
})
export class PhotographerServiceModule { }
