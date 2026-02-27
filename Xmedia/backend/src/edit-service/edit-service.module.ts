import { Module } from '@nestjs/common';
import { EditTypeService } from './edit-type.service';
import { EditServiceService } from './edit-service.service';
import { EditTypeController, EditServiceController } from './edit.controller';
import { PrismaModule } from '../prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [EditTypeController, EditServiceController],
    providers: [EditTypeService, EditServiceService],
})
export class EditServiceModule { }
