import { Module } from '@nestjs/common';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';
import { BylPaymentService } from './byl-payment.service';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [BookingsController],
  providers: [BookingsService, BylPaymentService, PrismaService],
})
export class BookingsModule { }
