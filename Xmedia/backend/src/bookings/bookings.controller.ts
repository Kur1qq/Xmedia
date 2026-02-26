import { Controller, Get, Param, Patch, Body, ParseIntPipe } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { BookingStatus } from '@prisma/client';

@Controller('api/bookings')
export class BookingsController {
    constructor(private readonly bookingsService: BookingsService) { }

    @Get()
    async findAll() {
        return this.bookingsService.findAll();
    }

    @Patch(':id/status')
    async updateStatus(
        @Param('id', ParseIntPipe) id: number,
        @Body('status') status: BookingStatus,
    ) {
        return this.bookingsService.updateStatus(id, status);
    }
}
