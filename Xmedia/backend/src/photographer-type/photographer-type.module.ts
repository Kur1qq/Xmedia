import { Module } from '@nestjs/common';
import { PhotographerTypeService } from './photographer-type.service';
import { PhotographerTypeController } from './photographer-type.controller';
import { PrismaModule } from '../prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [PhotographerTypeController],
    providers: [PhotographerTypeService],
})
export class PhotographerTypeModule { }
