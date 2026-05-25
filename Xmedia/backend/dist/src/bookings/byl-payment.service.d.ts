export declare class BylPaymentService {
    private readonly logger;
    private readonly bylId;
    private readonly bylToken;
    private readonly apiBase;
    constructor();
    createCheckout(params: {
        bookingId: number;
        amount: number;
        serviceName: string;
        quantity?: number;
        customerEmail?: string;
        successUrl?: string;
        cancelUrl?: string;
        items?: Array<{
            name: string;
            amount: number;
            quantity: number;
        }>;
        description?: string;
    }): Promise<{
        checkoutId: number;
        checkoutUrl: string;
    }>;
    getCheckoutStatus(checkoutId: string): Promise<{
        status: string;
        data: any;
    }>;
    verifySignature(payload: string, signature: string, secret: string): boolean;
}
