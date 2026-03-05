import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class BylPaymentService {
    private readonly logger = new Logger(BylPaymentService.name);
    private readonly bylId: string;
    private readonly bylToken: string;
    private readonly apiBase = 'https://byl.mn/api/v1';

    constructor() {
        this.bylId = process.env.BYL_ID || '';
        this.bylToken = process.env.BYL_TOKEN || '';
    }

    /**
     * BYL.mn Checkout session үүсгэнэ
     * @returns { checkoutId, checkoutUrl }
     */
    async createCheckout(params: {
        bookingId: number;
        amount: number;
        serviceName: string;
        quantity?: number;
        customerEmail?: string;
        successUrl?: string;
        cancelUrl?: string;
    }): Promise<{ checkoutId: number; checkoutUrl: string }> {
        // Prefer explicit CLIENT_URL, then try to find a non-local URL in CORS_ORIGINS, then hardcode Vercel prod
        let clientBaseUrl = process.env.CLIENT_URL || 'https://xmedia-six.vercel.app';
        if (process.env.CORS_ORIGINS && !process.env.CLIENT_URL) {
            const origins = process.env.CORS_ORIGINS.split(',');
            const remoteOrigin = origins.find(o => !o.includes('localhost') && !o.includes('127.0.0.1'));
            if (remoteOrigin) clientBaseUrl = remoteOrigin.trim();
        }

        const body = {
            success_url: params.successUrl || `${clientBaseUrl}/booking/success?bookingId=${params.bookingId}`,
            cancel_url: params.cancelUrl || `${clientBaseUrl}/booking/cancel?bookingId=${params.bookingId}`,
            client_reference_id: String(params.bookingId),
            customer_email: params.customerEmail || undefined,
            items: [
                {
                    price_data: {
                        unit_amount: params.amount,
                        product_data: {
                            name: params.serviceName,
                            client_reference_id: String(params.bookingId),
                        },
                    },
                    quantity: params.quantity || 1,
                },
            ],
        };

        const url = `${this.apiBase}/projects/${this.bylId}/checkouts`;

        this.logger.log(`Creating Byl checkout for booking #${params.bookingId}, amount: ${params.amount}`);

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.bylToken}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const errorText = await response.text();
            this.logger.error(`Byl API error: ${response.status} ${errorText}`);
            throw new Error(`Byl checkout creation failed: ${response.status}`);
        }

        const data = await response.json();
        // Response: { data: { id: 123, url: "https://byl.mn/h/checkout/123/abc" } }

        this.logger.log(`Byl checkout created: id=${data.data.id}, url=${data.data.url}`);

        return {
            checkoutId: data.data.id,
            checkoutUrl: data.data.url,
        };
    }

    /**
     * Checkout-н төлөв шалгах (Byl.mn API-аас)
     * @returns checkout status: 'open' | 'complete' | 'expired'
     */
    async getCheckoutStatus(checkoutId: string): Promise<{ status: string; data: any }> {
        const url = `${this.apiBase}/projects/${this.bylId}/checkouts/${checkoutId}`;

        this.logger.log(`Checking Byl checkout status: ${checkoutId}`);

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${this.bylToken}`,
                'Accept': 'application/json',
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            this.logger.error(`Byl API error: ${response.status} ${errorText}`);
            throw new Error(`Byl checkout status check failed: ${response.status}`);
        }

        const data = await response.json();
        this.logger.log(`Byl checkout ${checkoutId} status: ${data.data?.status}`);

        return {
            status: data.data?.status || 'unknown',
            data: data.data,
        };
    }

    /**
     * Webhook signature шалгах
     */
    verifySignature(payload: string, signature: string, secret: string): boolean {
        const crypto = require('crypto');
        const computed = crypto
            .createHmac('sha256', secret)
            .update(payload)
            .digest('hex');
        return computed === signature;
    }
}
