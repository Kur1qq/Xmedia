import { Injectable } from '@nestjs/common';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const PDFDocument = require('pdfkit');
import * as path from 'path';

export interface InvoiceItem {
    description: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
}

export interface InvoiceData {
    invoiceNumber: string;        // e.g. "2026-001"
    invoiceDate: string;          // "YYYY-MM-DD"
    payByDate?: string;           // optional
    // Seller (Нэхэмжлэгч)
    sellerName: string;
    sellerAddress: string;
    sellerPhone: string;
    sellerBank: string;
    sellerAccount: string;
    sellerReg: string;
    // Buyer (Төлөгч)
    buyerName: string;
    buyerEmail?: string;
    buyerPhone?: string;
    items: InvoiceItem[];
    notes?: string;
}

@Injectable()
export class InvoiceService {
    // Locate a font that supports Cyrillic on most systems
    private getMnFont(): string | null {
        const candidates = [
            '/System/Library/Fonts/Supplemental/Arial.ttf',
            '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',
            '/usr/share/fonts/truetype/freefont/FreeSans.ttf',
            path.join(process.cwd(), 'assets/fonts/NotoSans-Regular.ttf'),
        ];
        const fs = require('fs');
        for (const p of candidates) {
            if (fs.existsSync(p)) return p;
        }
        return null; // fallback to Helvetica (may not render Mongolian)
    }

    async generateInvoicePdf(data: InvoiceData): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            const doc = new PDFDocument({ size: 'A4', margin: 40 });
            const buffers: Buffer[] = [];
            doc.on('data', (chunk) => buffers.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(buffers)));
            doc.on('error', reject);

            const font = this.getMnFont();
            const regularFont = font || 'Helvetica';
            const boldFont = font || 'Helvetica-Bold';

            const W = doc.page.width - 80; // usable width
            const LEFT = 40;
            const RIGHT = LEFT + W;
            const subTotal = data.items.reduce((s, i) => s + i.totalPrice, 0);

            // ── Header note (top right, small) ──────────────────────────────
            doc.font(regularFont).fontSize(7)
                .text('Сангийн сайдын 2017 оны 12 дугаар сарын', RIGHT - 200, 40, { width: 200, align: 'right' })
                .text('5-ны өдрийн 347 тоот тушаалын хавсралт', RIGHT - 200, 52, { width: 200, align: 'right' });

            // ── Title ────────────────────────────────────────────────────────
            doc.font(boldFont).fontSize(16)
                .text(`НЭХЭМЖЛЭХ № ${data.invoiceNumber}`, LEFT, 70, { align: 'center', width: W });

            let y = 105;

            // ── Two-column info ──────────────────────────────────────────────
            const colW = (W - 20) / 2;
            const col1 = LEFT;
            const col2 = LEFT + colW + 20;

            const label = (text: string, value: string, x: number, cy: number, w: number) => {
                doc.font(boldFont).fontSize(9.5).text(text, x, cy, { continued: false, width: w });
                doc.font(regularFont).fontSize(9.5).text(value || '—', x + doc.widthOfString(text) + 4, cy, { width: w - doc.widthOfString(text) - 4 });
            };

            // Seller column
            doc.font(boldFont).fontSize(10).text('Нэхэмжлэгч:', col1, y);
            doc.font(boldFont).fontSize(10).text('Төлөгч:', col2, y);
            y += 16;

            const drawField = (label: string, value: string, x: number, cy: number, w: number): number => {
                doc.font(boldFont).fontSize(9).text(label, x, cy, { width: w });
                const lw = Math.min(doc.widthOfString(label) + 4, w);
                doc.font(regularFont).fontSize(9).text(value, x + lw, cy, { width: w - lw });
                // underline
                doc.moveTo(x, cy + 13).lineTo(x + w, cy + 13).lineWidth(0.5).strokeColor('#000').stroke();
                return cy + 18;
            };

            let ys = drawField('Байгууллагын нэр:', data.sellerName, col1, y, colW);
            drawField('Байгууллагын нэр:', data.buyerName, col2, y, colW);
            y = ys;

            ys = drawField('Хаяг:', data.sellerAddress, col1, y, colW);
            drawField('Хаяг:', data.buyerEmail || '—', col2, y, colW);
            y = ys + 4;

            drawField('Утас: Факс:', data.sellerPhone, col1, y, colW);
            drawField('Гэрээний №:', '—', col2, y, colW);
            y += 18;

            drawField('Э_шуудан:', '', col1, y, colW);
            drawField('Нэхэмжилсэн огноо:', data.invoiceDate, col2, y, colW);
            y += 18;

            drawField('Банкны нэр:', data.sellerBank, col1, y, colW);
            drawField('Төлбөр хийх хугацаа:', data.payByDate || '14 хоног', col2, y, colW);
            y += 18;

            drawField('Банкны дансны дугаар:', data.sellerAccount, col1, y, colW);
            y += 18;

            drawField('Регистрийн №:', data.sellerReg, col1, y, colW);
            y += 26;

            // ── Table ────────────────────────────────────────────────────────
            const cols = [
                { label: '№', w: 28 },
                { label: 'Гүйлгээний утга', w: W - 28 - 80 - 90 - 80 },
                { label: 'Тоо хэмжээ', w: 80 },
                { label: 'Нэгжийн үнэ', w: 90 },
                { label: 'Нийт үнэ', w: 80 },
            ];

            // Header row
            let cx = LEFT;
            doc.rect(LEFT, y, W, 18).fillAndStroke('#e8e8e8', '#000');
            doc.fill('#000');
            cols.forEach(col => {
                doc.font(boldFont).fontSize(8.5).text(col.label, cx + 3, y + 4, { width: col.w - 6, align: 'center' });
                cx += col.w;
            });
            y += 18;

            const rowH = 18;
            const EMPTY_ROWS = 9;
            const totalRows = Math.max(data.items.length, EMPTY_ROWS);

            for (let i = 0; i < totalRows; i++) {
                const item = data.items[i];
                const fillColor = i % 2 === 0 ? '#fff' : '#fafafa';
                doc.rect(LEFT, y, W, rowH).fillAndStroke(fillColor, '#aaa');
                doc.fill('#000');
                cx = LEFT;
                if (item) {
                    const vals = [
                        String(i + 1),
                        item.description,
                        String(item.quantity),
                        item.unitPrice.toLocaleString('mn-MN') + '₮',
                        item.totalPrice.toLocaleString('mn-MN') + '₮',
                    ];
                    vals.forEach((val, vi) => {
                        const align = vi === 0 || vi >= 2 ? 'center' : 'left';
                        doc.font(regularFont).fontSize(8).text(val, cx + 3, y + 5, { width: cols[vi].w - 6, align });
                        cx += cols[vi].w;
                    });
                } else {
                    // empty row borders only
                    let bx = LEFT;
                    cols.forEach(col => { bx += col.w; });
                }
                y += rowH;
            }

            // ── Subtotals ────────────────────────────────────────────────────
            const summaryW = cols[3].w + cols[4].w;
            const summaryX = RIGHT - summaryW;

            const summaryRow = (label: string, value: string, bold = false) => {
                doc.rect(summaryX, y, cols[3].w, rowH).fillAndStroke('#e8e8e8', '#aaa');
                doc.rect(summaryX + cols[3].w, y, cols[4].w, rowH).fillAndStroke('#fff', '#aaa');
                doc.fill('#000');
                doc.font(bold ? boldFont : regularFont).fontSize(8.5)
                    .text(label, summaryX + 3, y + 5, { width: cols[3].w - 6, align: 'center' })
                    .text(value, summaryX + cols[3].w + 3, y + 5, { width: cols[4].w - 6, align: 'right' });
                y += rowH;
            };

            summaryRow('Дүн', subTotal.toLocaleString('mn-MN') + '₮');
            summaryRow('НӨАТ', '—');
            summaryRow('Нийт дүн', subTotal.toLocaleString('mn-MN') + '₮', true);

            y += 10;

            // ── Amount in words ──────────────────────────────────────────────
            doc.font(regularFont).fontSize(9)
                .text(`Мөнгөний дүн: ${subTotal.toLocaleString('mn-MN')} төгрөг`, LEFT, y, { width: W });
            y += 14;

            doc.moveTo(LEFT, y + 10).lineTo(RIGHT, y + 10).lineWidth(0.5).strokeColor('#000').stroke();
            doc.font(regularFont).fontSize(8).text('(үсгээр)', LEFT + W / 2 - 20, y + 12);

            y += 30;
            doc.text('болно.', RIGHT - 30, y);

            y += 20;

            // ── Signature ────────────────────────────────────────────────────
            doc.font(boldFont).fontSize(10).text('Тамга', LEFT, y);

            doc.font(regularFont).fontSize(9)
                .text('Дарга ....................................  /                    /', LEFT + 60, y)
                .text('Хүлээн авсан ............................', LEFT + 60, y + 18)
                .text('Няглан бодогч .......................', LEFT + 60, y + 36);

            doc.end();
        });
    }
}
