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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
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
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var InvoiceService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvoiceService = void 0;
const common_1 = require("@nestjs/common");
const PDFDocument = require('pdfkit');
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const https = __importStar(require("https"));
const os = __importStar(require("os"));
function numberToWords(n) {
    const units = ['', 'нэг', 'хоёр', 'гурав', 'дөрөв', 'тав', 'зургаа', 'долоо', 'найм', 'ес'];
    const tens = ['', 'арав', 'хорь', 'гуч', 'дөч', 'тавь', 'жар', 'дал', 'ная', 'ер'];
    if (n === 0)
        return 'тэг';
    if (n < 10)
        return units[n];
    if (n < 100)
        return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + units[n % 10] : '');
    if (n < 1000)
        return units[Math.floor(n / 100)] + ' зуун' + (n % 100 !== 0 ? ' ' + numberToWords(n % 100) : '');
    if (n < 1000000)
        return numberToWords(Math.floor(n / 1000)) + ' мянга' + (n % 1000 !== 0 ? ' ' + numberToWords(n % 1000) : '');
    return numberToWords(Math.floor(n / 1000000)) + ' сая' + (n % 1000000 !== 0 ? ' ' + numberToWords(n % 1000000) : '');
}
let InvoiceService = InvoiceService_1 = class InvoiceService {
    logger = new common_1.Logger(InvoiceService_1.name);
    fontPath = null;
    fontReady;
    constructor() {
        this.fontReady = this.prepareFont();
    }
    async downloadFile(url, dest) {
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
    async prepareFont() {
        const localCandidates = [
            path.join(process.cwd(), 'assets/fonts/NotoSans-Regular.ttf'),
            path.join(__dirname, 'NotoSans-Regular.ttf'),
            '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',
            '/usr/share/fonts/truetype/freefont/FreeSans.ttf',
            '/System/Library/Fonts/Supplemental/Arial.ttf',
        ];
        for (const p of localCandidates) {
            if (fs.existsSync(p)) {
                this.fontPath = p;
                this.logger.log(`Font: ${p}`);
                return;
            }
        }
        const tmpFont = path.join(os.tmpdir(), 'xmedia-noto-sans.ttf');
        if (fs.existsSync(tmpFont)) {
            this.fontPath = tmpFont;
            return;
        }
        try {
            const url = 'https://cdn.jsdelivr.net/npm/@fontsource/noto-sans@5.0.28/files/noto-sans-cyrillic-400-normal.woff2';
            const ttfUrl = 'https://github.com/googlefonts/noto-fonts/raw/main/hinted/ttf/NotoSans/NotoSans-Regular.ttf';
            this.logger.log('Downloading Noto Sans font...');
            await this.downloadFile(ttfUrl, tmpFont);
            if (fs.existsSync(tmpFont)) {
                this.fontPath = tmpFont;
                this.logger.log('Font downloaded to ' + tmpFont);
            }
        }
        catch (e) {
            this.logger.warn('Could not download font, will use Helvetica (Mongolian text may not render): ' + e.message);
        }
    }
    async generateInvoicePdf(data) {
        await this.fontReady;
        return new Promise((resolve, reject) => {
            const doc = new PDFDocument({ size: 'A4', margin: 40 });
            const buffers = [];
            doc.on('data', (chunk) => buffers.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(buffers)));
            doc.on('error', reject);
            const regular = this.fontPath || 'Helvetica';
            const bold = this.fontPath || 'Helvetica-Bold';
            const W = doc.page.width - 80;
            const LEFT = 40;
            const RIGHT = LEFT + W;
            const subTotal = data.items.reduce((s, i) => s + i.totalPrice, 0);
            doc.font(regular).fontSize(14)
                .text(`НЭХЭМЖЛЭХ № ${data.invoiceNumber || ''}`, LEFT, 40, { align: 'center', width: W });
            let y = 80;
            const colW = (W - 20) / 2;
            const col1 = LEFT;
            const col2 = LEFT + colW + 20;
            const doubleUnderline = (yPos) => {
                doc.moveTo(LEFT, yPos).lineTo(col1 + colW, yPos).lineWidth(1).strokeColor('#000').stroke();
                doc.moveTo(LEFT, yPos + 3).lineTo(col1 + colW, yPos + 3).lineWidth(1).strokeColor('#000').stroke();
                doc.moveTo(col2, yPos).lineTo(col2 + colW, yPos).lineWidth(1).strokeColor('#000').stroke();
                doc.moveTo(col2, yPos + 3).lineTo(col2 + colW, yPos + 3).lineWidth(1).strokeColor('#000').stroke();
            };
            const lineUnder = (x, yPos, w) => {
                doc.moveTo(x, yPos + 2).lineTo(x + w, yPos + 2).lineWidth(1).strokeColor('#000').stroke();
            };
            const fieldWithLine = (label, value, x, cy, w, labelWidth) => {
                doc.font(regular).fontSize(10).text(label, x, cy, { continued: false });
                doc.font(bold).fontSize(10).text(value || '', x + labelWidth, cy - 2, { width: w - labelWidth, align: 'center' });
                lineUnder(x + labelWidth, cy + 10, w - labelWidth);
            };
            doc.font(regular).fontSize(10)
                .text('Нэхэмжлэгч', col1, y)
                .text('Төлөгч', col2, y);
            y += 25;
            fieldWithLine('Байгууллагын нэр', 'Отек менежмент ххк', col1, y, colW, 95);
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
            fieldWithLine('Регистр', '#6959709', col1, y, colW, 45);
            fieldWithLine('Нэхэмжилсэн огноо:', data.invoiceDate, col2, y, colW, 110);
            y += 25;
            fieldWithLine('Голомт банк', 'MN-61001500 – 2025138994', col1, y, colW, 65);
            fieldWithLine('Төлбөр хийх хугацаа:', data.payByDate || '14 хоног', col2, y, colW, 115);
            y += 25;
            fieldWithLine('Мбанк', 'MN-85003900 - 8000666677 (Г. Сайнбуян)', col1, y, colW, 40);
            y += 35;
            const cols = [
                { label: '№', w: 35 },
                { label: 'Гүйлгээний утга', w: W - 35 - 80 - 85 - 85 },
                { label: 'Тоо хэмжээ', w: 80 },
                { label: 'нэгжийн үнэ', w: 85 },
                { label: 'Нийт үнэ', w: 85 },
            ];
            let cx = LEFT;
            doc.rect(LEFT, y, W, 25).lineWidth(1).stroke('#000');
            cols.forEach((col, idx) => {
                doc.font(regular).fontSize(10).text(col.label, cx, y + 8, { width: col.w, align: 'center' });
                if (idx > 0)
                    doc.moveTo(cx, y).lineTo(cx, y + 25).stroke('#000');
                cx += col.w;
            });
            y += 25;
            const rowH = 25;
            const totalRows = Math.max(data.items.length, 6);
            for (let i = 0; i < totalRows; i++) {
                const item = data.items[i];
                doc.rect(LEFT, y, W, rowH).stroke('#000');
                cx = LEFT;
                cols.forEach((col, idx) => {
                    if (idx > 0)
                        doc.moveTo(cx, y).lineTo(cx, y + rowH).stroke('#000');
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
            const sW3 = cols[2].w, sW4 = cols[3].w, sW5 = cols[4].w;
            const sX = RIGHT - sW3 - sW4 - sW5;
            const summaryRow = (c3, c4) => {
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
            const words = numberToWords(subTotal);
            doc.font(regular).fontSize(11)
                .text('Мөнгөний дүн үсгээр', LEFT, y, { continued: false });
            const wordsW = doc.widthOfString('Мөнгөний дүн үсгээр');
            doc.font(bold).fontSize(11).text(words, LEFT + wordsW + 10, y - 2, { underline: false });
            lineUnder(LEFT + wordsW + 5, y + 10, W - wordsW - 5);
            y += 30;
            const dLineTotalUnder = (yPos) => {
                doc.moveTo(LEFT, yPos).lineTo(LEFT + W, yPos).lineWidth(1.5).strokeColor('#000').stroke();
                doc.moveTo(LEFT, yPos + 3).lineTo(LEFT + W, yPos + 3).lineWidth(0.5).strokeColor('#000').stroke();
            };
            dLineTotalUnder(y);
            y += 40;
            doc.font(regular).fontSize(11)
                .text('Дарга', LEFT, y)
                .text('................................................................/................................................................/', LEFT + 100, y);
            y += 30;
            doc.font(regular).fontSize(11)
                .text('Хүлээн авсан', LEFT, y)
                .text('................................................................/................................................................/', LEFT + 100, y);
            doc.end();
        });
    }
    generateInvoiceHtml(data) {
        const subTotal = data.items.reduce((s, i) => s + i.totalPrice, 0);
        let golomtBase64 = 'cid:golomtLogo';
        let mbankBase64 = 'cid:mbankLogo';
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
                            <img src="cid:xtudioLogo" style="height:32px;vertical-align:middle;" alt="XTUDIO" />
                        </td>
                    </tr>
                </table>

                <!-- Parties -->
                <table style="width:100%;margin-bottom:40px;border-collapse:collapse;">
                    <tr>
                        <td style="width:50%;vertical-align:top;color:#4b5563;font-size:14px;line-height:1.6;">
                            <div style="margin-bottom:8px;">Нэхэмжлэгч байгууллага:</div>
                            <div style="color:#111;font-weight:500;">Отек менежмент ххк</div>
                            <div>Регистрийн дугаар: #6959709</div>
                            
                            <div style="margin-top:20px;">
                                <div style="margin-bottom:4px;">
                                    ${golomtBase64 ? `<img src="${golomtBase64}" style="width:20px;height:20px;border-radius:4px;vertical-align:middle;object-fit:contain;background:#fff;display:inline-block;" alt="Golomt"/>` : `<div style="width:20px;height:20px;background:#005BBB;border-radius:4px;display:inline-block;vertical-align:middle;"></div>`}
                                    <span style="font-weight:500;color:#005BBB;vertical-align:middle;margin-left:6px;">Голомт банк</span>
                                </div>
                                <div>Отек менежмент ххк</div>
                                <div style="margin-bottom:16px;">MN-61001500 – 2025138994</div>

                                <div style="margin-bottom:4px;">
                                    ${mbankBase64 ? `<img src="${mbankBase64}" style="width:20px;height:20px;border-radius:50%;vertical-align:middle;object-fit:contain;background:#fff;display:inline-block;" alt="Mbank"/>` : `<div style="width:20px;height:20px;background:#10b981;border-radius:50%;display:inline-block;vertical-align:middle;"></div>`}
                                    <span style="font-weight:500;color:#10b981;vertical-align:middle;margin-left:6px;">Мбанк</span>
                                </div>
                                <div>Г. Сайнбуян</div>
                                <div>MN-85003900 - 8000666677</div>
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
};
exports.InvoiceService = InvoiceService;
exports.InvoiceService = InvoiceService = InvoiceService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], InvoiceService);
//# sourceMappingURL=invoice.service.js.map