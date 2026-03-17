import { Injectable, Logger } from '@nestjs/common';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const PDFDocument = require('pdfkit');
import * as path from 'path';
import * as fs from 'fs';
import * as https from 'https';
import * as os from 'os';

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
    sellerBank2?: string;
    sellerAccount2?: string;
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

// Mongolian number to words (simple)
function numberToWords(n: number): string {
    const units = ['', 'нэг', 'хоёр', 'гурав', 'дөрөв', 'тав', 'зургаа', 'долоо', 'найм', 'ес'];
    const tens = ['', 'арав', 'хорь', 'гуч', 'дөч', 'тавь', 'жар', 'дал', 'ная', 'ер'];
    if (n === 0) return 'тэг';
    if (n < 10) return units[n];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + units[n % 10] : '');
    if (n < 1000) return units[Math.floor(n / 100)] + ' зуун' + (n % 100 !== 0 ? ' ' + numberToWords(n % 100) : '');
    if (n < 1000000) return numberToWords(Math.floor(n / 1000)) + ' мянга' + (n % 1000 !== 0 ? ' ' + numberToWords(n % 1000) : '');
    return numberToWords(Math.floor(n / 1000000)) + ' сая' + (n % 1000000 !== 0 ? ' ' + numberToWords(n % 1000000) : '');
}

@Injectable()
export class InvoiceService {
    private readonly logger = new Logger(InvoiceService.name);
    private fontPath: string | null = null;
    private fontReady: Promise<void>;

    constructor() {
        this.fontReady = this.prepareFont();
    }

    private async downloadFile(url: string, dest: string): Promise<void> {
        return new Promise((resolve, reject) => {
            const file = fs.createWriteStream(dest);
            https.get(url, (res) => {
                res.pipe(file);
                file.on('finish', () => { file.close(); resolve(); });
            }).on('error', (err) => {
                fs.unlink(dest, () => { });
                reject(err);
            });
        });
    }

    private async prepareFont(): Promise<void> {
        // 1. Check local system fonts
        const localCandidates = [
            path.join(process.cwd(), 'assets/fonts/NotoSans-Regular.ttf'),
            path.join(__dirname, 'NotoSans-Regular.ttf'),
            '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',
            '/usr/share/fonts/truetype/freefont/FreeSans.ttf',
            '/System/Library/Fonts/Supplemental/Arial.ttf',
        ];
        for (const p of localCandidates) {
            if (fs.existsSync(p)) { this.fontPath = p; this.logger.log(`Font: ${p}`); return; }
        }

        // 2. Try cached /tmp font
        const tmpFont = path.join(os.tmpdir(), 'xmedia-noto-v2.ttf');
        if (fs.existsSync(tmpFont)) { this.fontPath = tmpFont; return; }

        // 3. Download from JSDelivr CDN
        try {
            const url = 'https://cdn.jsdelivr.net/npm/@fontsource/noto-sans@5.0.28/files/noto-sans-cyrillic-400-normal.woff2';
            // use ttf instead from google fonts mirror (use raw.githubusercontent.com to avoid 302 redirects)
            const ttfUrl = 'https://raw.githubusercontent.com/googlefonts/noto-fonts/main/hinted/ttf/NotoSans/NotoSans-Regular.ttf';
            this.logger.log('Downloading Noto Sans font...');
            await this.downloadFile(ttfUrl, tmpFont);
            if (fs.existsSync(tmpFont)) {
                this.fontPath = tmpFont;
                this.logger.log('Font downloaded to ' + tmpFont);
            }
        } catch (e) {
            this.logger.warn('Could not download font, will use Helvetica (Mongolian text may not render): ' + e.message);
        }
    }

    async generateInvoicePdf(data: InvoiceData): Promise<Buffer> {
        await this.fontReady;

        return new Promise((resolve, reject) => {
            const doc = new PDFDocument({ size: 'A4', margin: 40 });
            const buffers: Buffer[] = [];
            doc.on('data', (chunk: Buffer) => buffers.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(buffers)));
            doc.on('error', reject);

            const regular = this.fontPath || 'Helvetica';
            const bold = this.fontPath || 'Helvetica-Bold';

            const W = doc.page.width - 80;
            const LEFT = 40;
            const RIGHT = LEFT + W;
            const subTotal = data.items.reduce((s, i) => s + i.totalPrice, 0);

            // ── Title ──
            doc.font(regular).fontSize(14)
                .text(`НЭХЭМЖЛЭХ № ${data.invoiceNumber || ''}`, LEFT, 40, { align: 'center', width: W });

            let y = 80;
            const colW = (W - 20) / 2;
            const col1 = LEFT;
            const col2 = LEFT + colW + 20;

            const doubleUnderline = (yPos: number) => {
                doc.moveTo(LEFT, yPos).lineTo(col1 + colW, yPos).lineWidth(1).strokeColor('#000').stroke();
                doc.moveTo(LEFT, yPos + 3).lineTo(col1 + colW, yPos + 3).lineWidth(1).strokeColor('#000').stroke();

                doc.moveTo(col2, yPos).lineTo(col2 + colW, yPos).lineWidth(1).strokeColor('#000').stroke();
                doc.moveTo(col2, yPos + 3).lineTo(col2 + colW, yPos + 3).lineWidth(1).strokeColor('#000').stroke();
            };

            const lineUnder = (x: number, yPos: number, w: number) => {
                doc.moveTo(x, yPos + 2).lineTo(x + w, yPos + 2).lineWidth(1).strokeColor('#000').stroke();
            };

            const fieldWithLine = (label: string, value: string, x: number, cy: number, w: number, labelWidth: number) => {
                doc.font(regular).fontSize(10).text(label, x, cy, { continued: false });
                doc.font(bold).fontSize(10).text(value || '', x + labelWidth, cy - 2, { width: w - labelWidth, align: 'center' });
                lineUnder(x + labelWidth, cy + 10, w - labelWidth);
            };

            // Seller / Buyer header
            doc.font(regular).fontSize(10)
                .text('Нэхэмжлэгч', col1, y)
                .text('Төлөгч', col2, y);
            y += 25;

            fieldWithLine('Байгууллагын нэр', data.sellerName, col1, y, colW, 95);
            fieldWithLine('Байгууллагын нэр', data.buyerName, col2, y, colW, 95);
            y += 20;

            doubleUnderline(y + 10);
            y += 25;

            fieldWithLine('Хаяг', data.sellerAddress, col1, y, colW, 30);
            fieldWithLine('Хаяг', data.buyerAddress || data.buyerEmail || '—', col2, y, colW, 30);
            y += 25;

            fieldWithLine('Утас', data.buyerPhone || '—', col2, y, colW, 30);
            fieldWithLine('Утас', data.sellerPhone, col1, y, colW, 30);
            y += 25;

            fieldWithLine(data.sellerReg.length > 0 ? 'Регистр' : 'РД', data.sellerReg || '', col1, y, colW, 45);
            fieldWithLine('Нэхэмжилсэн огноо:', data.invoiceDate, col2, y, colW, 110);
            y += 25;

            fieldWithLine(data.sellerBank || 'Банк', data.sellerAccount || '', col1, y, colW, 65);
            fieldWithLine('Төлбөр хийх хугацаа:', data.payByDate || '5 хоног', col2, y, colW, 115);
            y += 25;

            if (data.sellerBank2 || data.sellerAccount2) {
                fieldWithLine(data.sellerBank2 || 'Банк 2', data.sellerAccount2 || '', col1, y, colW, 40);
                y += 35;
            }

            // ── Table ──
            const cols = [
                { label: '№', w: 35 },
                { label: 'Гүйлгээний утга', w: W - 35 - 80 - 85 - 85 },
                { label: 'Тоо хэмжээ', w: 80 },
                { label: 'нэгжийн үнэ', w: 85 },
                { label: 'Нийт үнэ', w: 85 },
            ];

            // Header
            let cx = LEFT;
            doc.rect(LEFT, y, W, 25).lineWidth(1).stroke('#000');
            cols.forEach((col, idx) => {
                doc.font(regular).fontSize(10).text(col.label, cx, y + 8, { width: col.w, align: 'center' });
                if (idx > 0) doc.moveTo(cx, y).lineTo(cx, y + 25).stroke('#000');
                cx += col.w;
            });
            y += 25;

            const rowH = 25;
            const totalRows = Math.max(data.items.length, 6);

            // Draw rows
            for (let i = 0; i < totalRows; i++) {
                const item = data.items[i];
                doc.rect(LEFT, y, W, rowH).stroke('#000');
                cx = LEFT;

                cols.forEach((col, idx) => {
                    if (idx > 0) doc.moveTo(cx, y).lineTo(cx, y + rowH).stroke('#000');
                    cx += col.w;
                });

                cx = LEFT;
                if (item) {
                    const vals = [
                        String(i + 1),
                        item.description,
                        `${item.quantity}`,
                        `${item.unitPrice.toLocaleString('en')}`,
                        `${item.totalPrice.toLocaleString('en')}`,
                    ];
                    vals.forEach((val, vi) => {
                        const align = vi === 0 || vi === 2 ? 'center' : (vi === 1 ? 'left' : 'right');
                        const padX = vi === 1 ? 5 : (vi > 2 ? -5 : 0);
                        doc.font(regular).fontSize(10).text(val, cx + padX, y + 8, { width: cols[vi].w + (vi === 1 ? -5 : (vi > 2 ? -5 : 0)), align });
                        cx += cols[vi].w;
                    });
                }
                y += rowH;
            }

            // Summary rows
            const sW3 = cols[2].w, sW4 = cols[3].w, sW5 = cols[4].w;
            const sX = RIGHT - sW3 - sW4 - sW5;

            const summaryRow = (c3: string, c4: string) => {
                doc.rect(sX + sW3, y, sW4, rowH).stroke('#000');
                doc.rect(sX + sW3 + sW4, y, sW5, rowH).stroke('#000');

                doc.font(regular).fontSize(10)
                    .text(c3, sX + sW3, y + 8, { width: sW4, align: 'center' })
                    .text(c4, sX + sW3 + sW4 - 5, y + 8, { width: sW5, align: 'right' });
                y += rowH;
            };

            summaryRow('Дүн', `${subTotal.toLocaleString('en')}`);
            summaryRow('НӨАТ', '');
            summaryRow('Нийт дүн', `${subTotal.toLocaleString('en')}`);

            y += 35;

            // Amount in words
            const words = numberToWords(subTotal);
            doc.font(regular).fontSize(11)
                .text('Мөнгөний дүн үсгээр', LEFT, y, { continued: false });

            const wordsW = doc.widthOfString('Мөнгөний дүн үсгээр');
            doc.font(bold).fontSize(11).text(words, LEFT + wordsW + 10, y - 2, { underline: false });
            lineUnder(LEFT + wordsW + 5, y + 10, W - wordsW - 5);
            y += 30;

            const dLineTotalUnder = (yPos: number) => {
                doc.moveTo(LEFT, yPos).lineTo(LEFT + W, yPos).lineWidth(1.5).strokeColor('#000').stroke();
                doc.moveTo(LEFT, yPos + 3).lineTo(LEFT + W, yPos + 3).lineWidth(0.5).strokeColor('#000').stroke();
            };
            dLineTotalUnder(y);

            y += 40;

            // Signature
            const stampPath = path.join(process.cwd(), 'assets', 'tamga-removebg-preview.png');
            const signaturePath = path.join(process.cwd(), 'assets', 'гарын_үсэг-removebg-preview.png');
            
            doc.font(regular).fontSize(11).text('Дарга:', LEFT, y, { continued: false });
            
            // Printed Name
            const nameX = LEFT + 50;
            doc.font(bold).fontSize(11).text('Г. Сайнбуян', nameX, y);
            
            // Signature image - placed relative to the text
            if (fs.existsSync(signaturePath)) {
                try {
                    doc.image(signaturePath, nameX + 60, y - 15, { width: 60 });
                } catch (e) {
                    this.logger.error('Failed to draw signature image: ' + e.message);
                }
            }

            // Stamp image - moved right to overlap with signature
            if (fs.existsSync(stampPath)) {
                try {
                    doc.image(stampPath, nameX + 40, y - 30, { width: 85 });
                } catch (e) {
                    this.logger.error('Failed to draw stamp image: ' + e.message);
                }
            }

            y += 40;
            doc.font(regular).fontSize(11)
                .text('Хүлээн авсан:', LEFT, y, { continued: false });
            doc.text('................................................................/................................................................/', LEFT + 100, y);

            doc.end();
        });
    }

    // HTML invoice for email fallback
    generateInvoiceHtml(data: InvoiceData): string {
        const subTotal = data.items.reduce((s, i) => s + i.totalPrice, 0);

        let golomtBase64 = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/4QAaRXhpZgAASUkqAAgAAAABAA4BAgMAAAAEAAAA/9sAQwAJCAgKCAcKCAgKDAcKDA0QDA0MDA0TEQ8PEBEVEhQVEhQUExUaGBgYGBgaICQeHiQkKyYlJissLi4sPzQ/PzQ//9sAQwEJCgwNDQ0RDAwRKxQSFD8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8//8AAEQgAIgAiAwEiAAIRAQMRAf/EAB8AAAEFAQEBAQEBAAAAAAAAAAABAgMEBQYHCAkKC//EALUQAAIBAwMCBAMFBQQEAAABfQECAwAEEQUSITFBBhNRYQcicRQygZGhCCNCscEVUtHwJDNicoIJChYXGBkaJSYnKCkqNDU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6g4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TFxsfIycrS09TV1tfY2drh4uPk5ebn6Onq8fLz9PX29/j5+v/EAB8BAAMBAQEBAQEBAQEAAAAAAAABAgMEBQYHCAkKC//EALURAAIBAgQEAwQHBQQEAAECdwABAgMRBAUhMQYSQVEHYXETIjKBCBRCkaGxwQkjM1LwFWJy0QoWJDThJfEXGBkaJicoKSo1Njc4OTpDREVGR0hJSlNUVVZXWFlaY2RlZmdoaWpzdHV2d3h5eoKDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uLj5OXm5+jp6vLz9PX29/j5+v/aAAwDAQACEQMRAD8Aq4f+7+tGH/u/rV/yG/vtR5Df32rr9scvsShh/wC7+tGH/u/rV/yG/vtR5Df32o9sHsShh/7v60Yf+7+tX/Ib++1HkN/faj2wexKGH/u/rRV/yG/vtRR7YPYnv/2hD/ck/IUf2hD/AHJPyFAhmxzGuT0+YUeTN/zyX/voVxctL+Y6+ap/L+If2hD/AHJPyFH9oQ/3JPyFHkzf88l/76FHkzf88l/76FHLR/mDmqfy/iH9oQ/3JPyFH9oQ/wByT8hR5M3/ADyX/voUeTN/zyX/voUctH+YOap/L+If2hD/ck/IUUGGYDPlDj/aootR/mDnrfyn//2Q==';
        let mbankBase64 = 'data:image/png;base64,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';

        const rows = data.items.map((item, i) => `
            <tr>
                <td style="padding:16px;border-bottom:1px solid #f0f0f0;color:#333;">${item.description}</td>
                <td style="padding:16px;border-bottom:1px solid #f0f0f0;color:#333;">${item.unitPrice.toLocaleString()}</td>
                <td style="padding:16px;border-bottom:1px solid #f0f0f0;color:#333;">${item.quantity}</td>
                <td style="padding:16px;border-bottom:1px solid #f0f0f0;color:#333;text-align:right;">${item.totalPrice.toLocaleString()}</td>
            </tr>`).join('');

        return `
        <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background-color:#f9fafb;padding:40px 20px;">
            <div style="max-width:800px;margin:0 auto;background:#fff;border-radius:12px;box-shadow:0 1px 3px rgba(0,0,0,0.1);padding:40px;border:1px solid #e5e7eb;">
                
                <!-- Header -->
                <table style="width:100%;border-bottom:1px solid #e5e7eb;padding-bottom:20px;margin-bottom:30px;border-collapse:collapse;">
                    <tr>
                        <td style="vertical-align:middle;">
                            <span style="font-size:18px;font-weight:600;color:#111;">Нэхэмжлэхийн дугаар: ${data.invoiceNumber || 'A/102'}</span>
                            <span style="color:#ef4444;font-size:18px;font-weight:500;margin-left:8px;">ТӨЛӨӨГҮЙ</span>
                        </td>
                        <td style="vertical-align:middle;text-align:right;" align="right">
                            <img src="https://xtudio-six.vercel.app/XTUDIO%20LOGO-1.png" style="height:40px;vertical-align:middle;" alt="XTUDIO" />
                        </td>
                    </tr>
                </table>

                <!-- Parties -->
                <table style="width:100%;margin-bottom:40px;border-collapse:collapse;">
                    <tr>
                        <td style="width:50%;vertical-align:top;color:#4b5563;font-size:14px;line-height:1.6;">
                            <div style="margin-bottom:8px;">Нэхэмжлэгч байгууллага:</div>
                            <div style="color:#111;font-weight:500;">${data.sellerName || 'Отек менежмент ХХК'}</div>
                            <div>Регистрийн дугаар: #${data.sellerReg || '6959709'}</div>
                            
                            <div style="margin-top:20px;">
                                <div style="margin-bottom:4px;">
                                    ${golomtBase64 ? `<img src="${golomtBase64}" style="width:20px;height:20px;border-radius:4px;vertical-align:middle;object-fit:contain;background:#fff;display:inline-block;" alt="Golomt"/>` : `<div style="width:20px;height:20px;background:#005BBB;border-radius:4px;display:inline-block;vertical-align:middle;"></div>`}
                                    <span style="font-weight:500;color:#005BBB;vertical-align:middle;margin-left:6px;">${data.sellerBank || 'Голомт банк'}</span>
                                </div>
                                <div style="margin-bottom:16px;">${data.sellerAccount || ''}</div>

                                ${data.sellerBank2 ? `
                                <div style="margin-bottom:4px;">
                                    ${mbankBase64 ? `<img src="${mbankBase64}" style="width:20px;height:20px;border-radius:50%;vertical-align:middle;object-fit:contain;background:#fff;display:inline-block;" alt="Mbank"/>` : `<div style="width:20px;height:20px;background:#10b981;border-radius:50%;display:inline-block;vertical-align:middle;"></div>`}
                                    <span style="font-weight:500;color:#10b981;vertical-align:middle;margin-left:6px;">${data.sellerBank2}</span>
                                </div>
                                <div>${data.sellerAccount2 || ''}</div>` : ''}
                            </div>
                        </td>
                        
                        <td style="width:50%;vertical-align:top;color:#4b5563;font-size:14px;line-height:1.6;text-align:right;" align="right">
                            <div style="text-align:right;width:100%;display:inline-block;">
                                <div style="margin-bottom:8px;">Төлөгч байгууллага</div>
                                <div style="color:#111;font-weight:500;">${data.buyerName || 'Хэрэглэгч'}</div>
                                ${data.buyerReg ? `<div>Регистрийн дугаар: ${data.buyerReg}</div>` : ''}
                                ${data.buyerPhone ? `<div>Утасны дугаар: ${data.buyerPhone}</div>` : ''}
                                ${data.buyerAddress ? `<div>Хаяг: ${data.buyerAddress}</div>` : ''}
                                ${data.buyerEmail ? `<div><a href="mailto:${data.buyerEmail}" style="color:#1d4ed8;text-decoration:underline;">${data.buyerEmail}</a></div>` : ''}
                            </div>
                        </td>
                    </tr>
                </table>

                <!-- Table -->
                <div style="border:1px solid #f3f4f6;border-radius:8px;overflow:hidden;margin-bottom:24px;">
                    <table style="width:100%;border-collapse:collapse;font-size:14px;">
                        <thead>
                            <tr style="background:#f9fafb;border-bottom:1px solid #e5e7eb;">
                                <th style="padding:16px;text-align:left;font-weight:600;color:#374151;width:40%;">Нэр, тайлбар</th>
                                <th style="padding:16px;text-align:left;font-weight:600;color:#374151;">Үнийн дүн</th>
                                <th style="padding:16px;text-align:left;font-weight:600;color:#374151;">Тоо ширхэг</th>
                                <th style="padding:16px;text-align:right;font-weight:600;color:#374151;">Нийт</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${rows}
                        </tbody>
                    </table>
                </div>

                <!-- Total -->
                <div style="display:flex;justify-content:flex-end;margin-bottom:40px;padding-right:16px;">
                    <div style="text-align:right;">
                        <span style="font-size:16px;font-weight:600;color:#374151;margin-right:80px;">Төлөх дүн</span>
                        <span style="font-size:18px;font-weight:700;color:#111;">${subTotal.toLocaleString()} ₮</span>
                    </div>
                </div>

                <!-- Footer & Actions -->
                <div style="display:flex;justify-content:space-between;align-items:flex-end;">
                    <div style="display:flex;gap:16px;align-items:flex-start;">
                        <div style="padding-top:4px;">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4b5563" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                        </div>
                        <div style="font-size:14px;color:#374151;">
                            <div style="font-weight:500;margin-bottom:4px;">Нэмэлт мэдээлэл:</div>
                            <div style="color:#6b7280;">Байхгүй.</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>`;
    }
}
