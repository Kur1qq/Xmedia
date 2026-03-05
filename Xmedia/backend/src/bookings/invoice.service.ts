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
    sellerReg: string;
    buyerName: string;
    buyerEmail?: string;
    buyerPhone?: string;
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
        const tmpFont = path.join(os.tmpdir(), 'xmedia-noto-sans.ttf');
        if (fs.existsSync(tmpFont)) { this.fontPath = tmpFont; return; }

        // 3. Download from JSDelivr CDN
        try {
            const url = 'https://cdn.jsdelivr.net/npm/@fontsource/noto-sans@5.0.28/files/noto-sans-cyrillic-400-normal.woff2';
            // woff2 won't work, use ttf instead from google fonts mirror
            const ttfUrl = 'https://github.com/googlefonts/noto-fonts/raw/main/hinted/ttf/NotoSans/NotoSans-Regular.ttf';
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
            doc.on('data', (chunk) => buffers.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(buffers)));
            doc.on('error', reject);

            const regular = this.fontPath || 'Helvetica';
            const bold = this.fontPath || 'Helvetica-Bold';

            const W = doc.page.width - 80;
            const LEFT = 40;
            const RIGHT = LEFT + W;
            const subTotal = data.items.reduce((s, i) => s + i.totalPrice, 0);

            // ── Header note ──
            doc.font(regular).fontSize(7)
                .text('Сангийн сайдын 2017 оны 12 дугаар сарын', { align: 'right', width: W })
                .text('5-ны өдрийн 347 тоот тушаалын хавсралт', { align: 'right', width: W });

            // ── Title ──
            doc.font(bold).fontSize(16)
                .text(`НЭХЭМЖЛЭХ № ${data.invoiceNumber}`, LEFT, 70, { align: 'center', width: W });

            let y = 105;
            const colW = (W - 20) / 2;
            const col1 = LEFT;
            const col2 = LEFT + colW + 20;

            const underline = (x: number, cy: number, w: number) => {
                doc.moveTo(x, cy + 14).lineTo(x + w, cy + 14).lineWidth(0.4).strokeColor('#000').stroke();
            };

            const field = (label: string, value: string, x: number, cy: number, w: number) => {
                doc.font(bold).fontSize(9).text(label, x, cy, { continued: true, width: w });
                doc.font(regular).fontSize(9).text(' ' + (value || ''), { width: w });
                underline(x, cy, w);
            };

            // Seller / Buyer header
            doc.font(bold).fontSize(10)
                .text('Нэхэмжлэгч:', col1, y)
                .text('Төлөгч:', col2, y);
            y += 18;

            field('Байгууллагын нэр:', data.sellerName, col1, y, colW);
            field('Байгууллагын нэр:', data.buyerName, col2, y, colW);
            y += 20;

            field('Хаяг:', data.sellerAddress, col1, y, colW);
            field('Хаяг:', data.buyerEmail || '—', col2, y, colW);
            y += 20;

            field('Утас: Факс:', data.sellerPhone, col1, y, colW);
            field('Гэрээний №:', '—', col2, y, colW);
            y += 20;

            field('Э_шуудан:', '', col1, y, colW);
            field('Нэхэмжилсэн огноо:', data.invoiceDate, col2, y, colW);
            y += 20;

            field('Банкны нэр:', data.sellerBank, col1, y, colW);
            field('Төлбөр хийх хугацаа:', data.payByDate || '14 хоног', col2, y, colW);
            y += 20;

            field('Банкны дансны дугаар:', data.sellerAccount, col1, y, colW);
            y += 20;

            field('Регистрийн №:', data.sellerReg, col1, y, colW);
            y += 28;

            // ── Table ──
            const cols = [
                { label: '№', w: 28 },
                { label: 'Гүйлгээний утга', w: W - 28 - 78 - 88 - 78 },
                { label: 'Тоо хэмжээ', w: 78 },
                { label: 'Нэгжийн үнэ', w: 88 },
                { label: 'Нийт үнэ', w: 78 },
            ];

            // Header
            let cx = LEFT;
            doc.rect(LEFT, y, W, 18).fillAndStroke('#ddd', '#000');
            doc.fill('#000');
            cols.forEach(col => {
                doc.font(bold).fontSize(8).text(col.label, cx + 2, y + 5, { width: col.w - 4, align: 'center' });
                cx += col.w;
            });
            y += 18;

            const rowH = 18;
            const totalRows = Math.max(data.items.length, 9);

            for (let i = 0; i < totalRows; i++) {
                const item = data.items[i];
                const fill = i % 2 === 0 ? '#fff' : '#f9f9f9';
                doc.rect(LEFT, y, W, rowH).fillAndStroke(fill, '#999');
                doc.fill('#000');
                cx = LEFT;
                if (item) {
                    const vals = [
                        String(i + 1),
                        item.description,
                        `${item.quantity} цаг`,
                        `${item.unitPrice.toLocaleString('en')}₮`,
                        `${item.totalPrice.toLocaleString('en')}₮`,
                    ];
                    vals.forEach((val, vi) => {
                        const align = vi === 0 || vi >= 2 ? 'center' : 'left';
                        doc.font(regular).fontSize(8).text(val, cx + 2, y + 5, { width: cols[vi].w - 4, align });
                        cx += cols[vi].w;
                    });
                }
                y += rowH;
            }

            // Summary rows
            const sW3 = cols[2].w, sW4 = cols[3].w, sW5 = cols[4].w;
            const sX = RIGHT - sW3 - sW4 - sW5;

            const summaryRow = (c2: string, c3: string, c4: string, isBold = false) => {
                doc.rect(sX, y, sW3, rowH).fillAndStroke('#eee', '#999');
                doc.rect(sX + sW3, y, sW4, rowH).fillAndStroke('#eee', '#999');
                doc.rect(sX + sW3 + sW4, y, sW5, rowH).fillAndStroke('#fff', '#999');
                doc.fill('#000');
                const f = isBold ? bold : regular;
                doc.font(f).fontSize(8)
                    .text(c2, sX + 2, y + 5, { width: sW3 - 4, align: 'center' })
                    .text(c3, sX + sW3 + 2, y + 5, { width: sW4 - 4, align: 'center' })
                    .text(c4, sX + sW3 + sW4 + 2, y + 5, { width: sW5 - 4, align: 'right' });
                y += rowH;
            };

            summaryRow('', 'Дүн', `${subTotal.toLocaleString('en')}₮`);
            summaryRow('', 'НӨАТ', '—');
            summaryRow('', 'Нийт дүн', `${subTotal.toLocaleString('en')}₮`, true);

            y += 12;

            // Amount in words
            doc.font(regular).fontSize(9)
                .text(`Мөнгөний дүн: ${numberToWords(subTotal)} төгрөг (${subTotal.toLocaleString('en')}₮)`, LEFT, y, { width: W });
            y += 14;
            doc.moveTo(LEFT, y + 8).lineTo(RIGHT, y + 8).lineWidth(0.4).strokeColor('#000').stroke();
            y += 20;
            doc.font(regular).text('болно.', LEFT, y, { align: 'right', width: W });
            y += 24;

            // Signature
            doc.font(bold).fontSize(10).text('Тамга', LEFT, y);
            doc.font(regular).fontSize(9)
                .text('Дарга .........................................  /                    /', LEFT + 60, y)
                .text('Хүлээн авсан ............................', LEFT + 60, y + 18)
                .text('Няглан бодогч ........................', LEFT + 60, y + 36);

            doc.end();
        });
    }

    // HTML invoice for email fallback
    generateInvoiceHtml(data: InvoiceData): string {
        const subTotal = data.items.reduce((s, i) => s + i.totalPrice, 0);
        const td = 'padding:6px 10px;border:1px solid #ccc;font-size:13px';
        const rows = data.items.map((item, i) => `
            <tr style="background:${i % 2 ? '#f9f9f9' : '#fff'}">
                <td style="${td}">${i + 1}</td>
                <td style="${td}">${item.description}</td>
                <td style="${td};text-align:center">${item.quantity} цаг</td>
                <td style="${td};text-align:right">${item.unitPrice.toLocaleString()}₮</td>
                <td style="${td};text-align:right"><b>${item.totalPrice.toLocaleString()}₮</b></td>
            </tr>`).join('');

        return `
        <div style="font-family:Arial,sans-serif;max-width:680px;margin:0 auto;color:#222">
            <div style="text-align:right;font-size:11px;color:#666">
                Сангийн сайдын 2017 оны 12 дугаар сарын 5-ны өдрийн 347 тоот тушаалын хавсралт
            </div>
            <h2 style="text-align:center;font-size:20px;margin:16px 0">НЭХЭМЖЛЭХ № ${data.invoiceNumber}</h2>
            <table style="width:100%;border-collapse:collapse;margin-bottom:16px">
                <tr>
                    <td style="width:50%;vertical-align:top;padding:8px">
                        <b>Нэхэмжлэгч:</b><br>
                        Байгууллагын нэр: <b>${data.sellerName}</b><br>
                        Хаяг: ${data.sellerAddress}<br>
                        Утас: ${data.sellerPhone}<br>
                        Банк: ${data.sellerBank}<br>
                        Данс: <b>${data.sellerAccount}</b><br>
                        Регистр: ${data.sellerReg}
                    </td>
                    <td style="width:50%;vertical-align:top;padding:8px">
                        <b>Төлөгч:</b><br>
                        Байгууллагын нэр: <b>${data.buyerName}</b><br>
                        Э-шуудан: ${data.buyerEmail || '—'}<br>
                        Утас: ${data.buyerPhone || '—'}<br><br>
                        Нэхэмжилсэн огноо: <b>${data.invoiceDate}</b><br>
                        Төлбөр хийх хугацаа: ${data.payByDate || '14 хоног'}
                    </td>
                </tr>
            </table>
            <table style="width:100%;border-collapse:collapse">
                <thead>
                    <tr style="background:#ddd">
                        <th style="${td}">№</th>
                        <th style="${td}">Гүйлгээний утга</th>
                        <th style="${td}">Тоо хэмжээ</th>
                        <th style="${td}">Нэгжийн үнэ</th>
                        <th style="${td}">Нийт үнэ</th>
                    </tr>
                </thead>
                <tbody>${rows}</tbody>
                <tfoot>
                    <tr><td colspan="3"></td><td style="${td};background:#eee"><b>Дүн</b></td><td style="${td};text-align:right">${subTotal.toLocaleString()}₮</td></tr>
                    <tr><td colspan="3"></td><td style="${td};background:#eee">НӨАТ</td><td style="${td};text-align:right">—</td></tr>
                    <tr><td colspan="3"></td><td style="${td};background:#ddd"><b>Нийт дүн</b></td><td style="${td};text-align:right"><b>${subTotal.toLocaleString()}₮</b></td></tr>
                </tfoot>
            </table>
            <p style="margin-top:16px;font-size:13px">
                Мөнгөний дүн: <b>${numberToWords(subTotal)} төгрөг (${subTotal.toLocaleString()}₮)</b> болно.
            </p>
            <hr style="border:none;border-top:1px solid #eee;margin:20px 0">
            <table style="width:100%">
                <tr>
                    <td><b>Тамга</b></td>
                    <td>
                        Дарга ................................ / &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; /<br>
                        Хүлээн авсан ........................<br>
                        Няглан бодогч ....................
                    </td>
                </tr>
            </table>
        </div>`;
    }
}
