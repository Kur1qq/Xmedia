export declare class MailService {
    private readonly logger;
    private transporter;
    constructor();
    sendInvoiceEmail(to: string, subject: string, html: string, pdfBuffer: Buffer | null, filename: string | null): Promise<void>;
    sendOrderConfirmationEmail(to: string, bookingId: number, buyerName: string, totalAmount: number, itemsCount: number): Promise<void>;
}
