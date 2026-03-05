"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var BylPaymentService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BylPaymentService = void 0;
const common_1 = require("@nestjs/common");
let BylPaymentService = BylPaymentService_1 = class BylPaymentService {
    logger = new common_1.Logger(BylPaymentService_1.name);
    bylId;
    bylToken;
    apiBase = 'https://byl.mn/api/v1';
    constructor() {
        this.bylId = process.env.BYL_ID || '';
        this.bylToken = process.env.BYL_TOKEN || '';
    }
    async createCheckout(params) {
        const clientBaseUrl = process.env.CORS_ORIGINS?.split(',')[1] || 'http://localhost:3002';
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
        this.logger.log(`Byl checkout created: id=${data.data.id}, url=${data.data.url}`);
        return {
            checkoutId: data.data.id,
            checkoutUrl: data.data.url,
        };
    }
    async getCheckoutStatus(checkoutId) {
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
    verifySignature(payload, signature, secret) {
        const crypto = require('crypto');
        const computed = crypto
            .createHmac('sha256', secret)
            .update(payload)
            .digest('hex');
        return computed === signature;
    }
};
exports.BylPaymentService = BylPaymentService;
exports.BylPaymentService = BylPaymentService = BylPaymentService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], BylPaymentService);
//# sourceMappingURL=byl-payment.service.js.map