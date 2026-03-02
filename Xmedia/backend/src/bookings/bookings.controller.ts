import { Controller, Get, Post, Param, Patch, Body, ParseIntPipe, Req } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { BookingStatus } from '@prisma/client';
import { AdminLogService } from '../admin/admin-log.service';

@Controller('api/bookings')
export class BookingsController {
    constructor(
        private readonly bookingsService: BookingsService,
        private readonly log: AdminLogService,
    ) { }

    @Get()
    async findAll() { return this.bookingsService.findAll(); }

    // Public guest booking — no auth required
    @Post()
    async createGuest(@Body() dto: any) {
        return this.bookingsService.createGuestBooking(dto);
    }

    @Patch(':id/status')
    async updateStatus(
        @Param('id', ParseIntPipe) id: number,
        @Body('status') status: BookingStatus,
        @Req() req: any,
    ) {
        const result = await this.bookingsService.updateStatus(id, status);
        this.log.log(req.user?.id ?? 0, 'BOOKING_STATUS_UPDATE', 'Booking', id, `status=${status}`, req.ip).catch(() => { });
        return result;
    }
}

