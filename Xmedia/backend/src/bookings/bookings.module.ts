import { Module } from '@nestjs/common';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';
import { PrismaService } from '../prisma.service';
import { BylPaymentService } from './byl-payment.service';
import { PrismaModule } from '../prisma.module';
import { BundleServiceModule } from '../bundle-service/bundle-service.module';
import { MailService } from './mail.service';
import { InvoiceService } from './invoice.service';
import { AdminModule } from '../admin/admin.module';

@Module({
  imports: [PrismaModule, BundleServiceModule, AdminModule],
  controllers: [BookingsController],
  providers: [BookingsService, BylPaymentService, PrismaService, MailService, InvoiceService],
})
export class BookingsModule { }
