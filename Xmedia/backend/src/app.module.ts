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
import { StudioModule } from './studio/studio.module';
import { ServiceModule } from './service/service.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { LiveServiceModule } from './live-service/live-service.module';
import { PhotographerServiceModule } from './photographer-service/photographer-service.module';
import { PhotographerTypeModule } from './photographer-type/photographer-type.module';
import { EditServiceModule } from './edit-service/edit-service.module';
import { AdminModule } from './admin/admin.module';
import { LogModule } from './log/log.module';
import { PortfolioModule } from './portfolio/portfolio.module';

@Module({
  imports: [
    LogModule,
    PrismaModule,
    UsersModule,
    BookingsModule,
    EquipmentModule,
    CategoryModule,
    UploadModule,
    StudioModule,
    ServiceModule,
    DashboardModule,
    LiveServiceModule,
    PhotographerServiceModule,
    PhotographerTypeModule,
    EditServiceModule,
    AdminModule,
    PortfolioModule,
  ],
  controllers: [AppController, HealthController],
  providers: [AppService],
})
export class AppModule { }
