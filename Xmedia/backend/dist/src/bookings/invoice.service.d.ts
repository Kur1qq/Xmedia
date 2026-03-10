export interface InvoiceItem {
    description: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
}
export interface InvoiceData {
    invoiceNumber: string;
    invoiceDate: string;
    payByDate?: string;
    sellerName: string;
    sellerAddress: string;
    sellerPhone: string;
    sellerBank: string;
    sellerAccount: string;
    sellerReg: string;
    buyerName: string;
    buyerEmail?: string;
    buyerPhone?: string;
    buyerReg?: string;
    buyerAddress?: string;
    buyerPersonName?: string;
    items: InvoiceItem[];
    notes?: string;
}
export declare class InvoiceService {
    private readonly logger;
    private fontPath;
    private fontReady;
    constructor();
    private downloadFile;
    private prepareFont;
    generateInvoicePdf(data: InvoiceData): Promise<Buffer>;
    generateInvoiceHtml(data: InvoiceData): string;
}
