export declare class MailService {
    private readonly logger;
    private sendViaBrevoApi;
    sendInvoiceEmail(to: string, subject: string, html: string, pdfBuffer: Buffer | null, filename: string | null): Promise<void>;
    sendOrderConfirmationEmail(to: string, bookingId: number, buyerName: string, totalAmount: number, itemsCount: number): Promise<void>;
}
