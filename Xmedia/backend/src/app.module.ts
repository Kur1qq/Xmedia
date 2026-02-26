import { Module } from '@nestjs/common';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma.module';
import { HealthController } from './health.controller';
import { UsersModule } from './users/users.module';
import { BookingsModule } from './bookings/bookings.module';
import { EquipmentModule } from './equipment/equipment.module';
import { CategoryModule } from './category/category.module';
import { UploadModule } from './upload/upload.module';

@Module({
  imports: [
    PrismaModule,
    UsersModule,
    BookingsModule,
    EquipmentModule,
    CategoryModule,
    UploadModule
  ],
  controllers: [AppController, HealthController],
  providers: [AppService],
})
export class AppModule { }
