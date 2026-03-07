import { Module } from '@nestjs/common';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';
import { BylPaymentService } from './byl-payment.service';
import { PrismaService } from '../prisma.service';
import { MailService } from './mail.service';
import { InvoiceService } from './invoice.service';
import { AdminModule } from '../admin/admin.module';

@Module({
  imports: [AdminModule],
  controllers: [BookingsController],
  providers: [BookingsService, BylPaymentService, PrismaService, MailService, InvoiceService],
})
export class BookingsModule { }
