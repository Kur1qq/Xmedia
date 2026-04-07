export declare class MailService {
    private readonly logger;
    private readonly ADMIN_EMAIL;
    private sendViaBrevoApi;
    private emailLayout;
    private row;
    private table;
    sendInvoiceEmail(to: string, subject: string, html: string, pdfBuffer: Buffer | null, filename: string | null): Promise<void>;
    sendOrderConfirmationEmail(to: string, bookingId: number, buyerName: string, totalAmount: number, itemsCount: number): Promise<void>;
    sendOrderCancelledEmail(bookingId: number, buyerName: string, totalAmount: number): Promise<void>;
    sendNewOrderNotificationToAdmin(bookingId: number, buyerName: string, buyerPhone: string, serviceName: string, totalAmount: number): Promise<void>;
}
