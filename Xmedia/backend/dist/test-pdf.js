"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const invoice_service_1 = require("./src/bookings/invoice.service");
const fs = __importStar(require("fs"));
async function run() {
    const s = new invoice_service_1.InvoiceService();
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
//# sourceMappingURL=test-pdf.js.map