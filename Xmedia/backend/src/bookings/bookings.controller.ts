import { Controller, Get, Post, Param, Patch, Body, ParseIntPipe, Req, Headers, RawBodyRequest, Logger, HttpCode } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { BookingStatus } from '@prisma/client';
import { AdminLogService } from '../admin/admin-log.service';
import { BylPaymentService } from './byl-payment.service';

@Controller('bookings')
export class BookingsController {
    private readonly logger = new Logger(BookingsController.name);

    constructor(
        private readonly bookingsService: BookingsService,
        private readonly log: AdminLogService,
        private readonly bylPayment: BylPaymentService,
    ) { }

    @Get()
    async findAll() { return this.bookingsService.findAll(); }

    // Multi-item cart booking
    @Post('cart')
    async createCartBooking(@Body() dto: any) {
        return this.bookingsService.createCartBooking(dto);
    }

    // Public guest booking — no auth required (single item)
    @Post()
    async createGuest(@Body() dto: any) {
        return this.bookingsService.createGuestBooking(dto);
    }

    // Verify payment status from Byl.mn API (called by client success page)
    @Post(':id/verify-payment')
    @HttpCode(200)
    async verifyPayment(@Param('id', ParseIntPipe) id: number) {
        return this.bookingsService.verifyAndConfirmPayment(id);
    }

    // Byl.mn webhook — checkout.completed event
    @Post('webhook/byl')
    @HttpCode(200)
    async bylWebhook(
        @Body() body: any,
        @Headers('Byl-Signature') signature: string,
    ) {
        this.logger.log(`Byl webhook received: type=${body?.type}, checkout_id=${body?.data?.object?.id}`);

        // Process checkout.completed events
        if (body?.type === 'checkout.completed') {
            const checkoutId = String(body.data.object.id);

            try {
                const result = await this.bookingsService.confirmPayment(checkoutId);
                this.logger.log(`Payment confirmed for booking #${result.bookingId}`);
                return { success: true };
            } catch (error) {
                this.logger.error(`Failed to confirm payment: ${error.message}`);
                return { success: false, error: error.message };
            }
        }

        // Acknowledge other event types
        return { success: true, message: 'Event received' };
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
