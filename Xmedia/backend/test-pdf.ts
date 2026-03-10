import { InvoiceService } from './src/bookings/invoice.service';
import * as fs from 'fs';

async function run() {
    const s = new InvoiceService();
    const pdf = await s.generateInvoicePdf({
        invoiceNumber: '12345',
        invoiceDate: '2026-03-09',
        payByDate: '2026-03-23',
        sellerName: 'Xmedia ХХК',
        sellerAddress: 'Хан-Уул дүүрэг, 3-р хороо',
        sellerPhone: '99001100',
        sellerBank: 'Хаан Банк',
        sellerAccount: '5011234567',
        sellerReg: '1234567',
        buyerName: 'Хэрэглэгч ХХК',
        buyerEmail: 'user@example.com',
        buyerPhone: '88776655',
        items: [
            { description: 'Студи түрээс', quantity: 2, unitPrice: 50000, totalPrice: 100000 },
        ]
    });
    fs.writeFileSync('test.pdf', pdf);
    console.log('PDF saved to test.pdf');
}
run();
