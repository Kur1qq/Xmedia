export declare class MailService {
    private readonly logger;
    private readonly ADMIN_EMAIL;
    private sendViaBrevoApi;
    private emailLayout;
    private row;
    private table;
    private formatSchedule;
    private nowUB;
    sendInvoiceEmail(to: string, subject: string, html: string, pdfBuffer: Buffer | null, filename: string | null): Promise<void>;
    sendOrderConfirmationEmail(to: string, bookingId: number, buyerName: string, totalAmount: number, serviceDetails: string): Promise<void>;
    sendOrderCancelledEmail(bookingId: number, buyerName: string, totalAmount: number): Promise<void>;
    sendNewOrderNotificationToAdmin(bookingId: number, buyerName: string, buyerPhone: string, serviceName: string, totalAmount: number, schedule?: Array<{
        date?: string | null;
        startTime?: string | null;
        endTime?: string | null;
        serviceName?: string;
    }>): Promise<void>;
}
