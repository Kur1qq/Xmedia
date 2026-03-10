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
var MailService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MailService = void 0;
const common_1 = require("@nestjs/common");
const nodemailer = __importStar(require("nodemailer"));
let MailService = MailService_1 = class MailService {
    logger = new common_1.Logger(MailService_1.name);
    transporter;
    constructor() {
        const port = Number(process.env.EMAIL_PORT) || 587;
        this.transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST || 'smtp-relay.brevo.com',
            port: port,
            secure: port === 465,
            auth: {
                user: process.env.EMAIL_USER || 'a44d14001@smtp-brevo.com',
                pass: process.env.EMAIL_PASSWORD || '7OqPhkYCU0wIFB31',
            },
        });
    }
    async sendInvoiceEmail(to, subject, html, pdfBuffer, filename) {
        try {
            const attachments = pdfBuffer && filename ? [{
                    filename,
                    content: pdfBuffer,
                    contentType: 'application/pdf',
                }] : [];
            const fs = require('fs');
            const path = require('path');
            const dirsToCheck = [
                path.join(process.cwd(), 'public'),
                path.join(__dirname, '..', '..', 'public')
            ];
            const getFilePath = (filename) => {
                for (const d of dirsToCheck) {
                    const p = path.join(d, filename);
                    if (fs.existsSync(p))
                        return p;
                }
                return null;
            };
            const golomtPath = getFilePath('golomt.jpeg');
            const mbankPath = getFilePath('mbank.png');
            const xtudioPath = getFilePath('xtudio.png');
            if (golomtPath)
                attachments.push({ filename: 'golomt.jpeg', path: golomtPath, cid: 'golomtLogo' });
            if (mbankPath)
                attachments.push({ filename: 'mbank.png', path: mbankPath, cid: 'mbankLogo' });
            if (xtudioPath)
                attachments.push({ filename: 'xtudio.png', path: xtudioPath, cid: 'xtudioLogo' });
            await this.transporter.sendMail({
                from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
                to,
                subject,
                html,
                attachments,
            });
            this.logger.log(`Invoice email sent to ${to}`);
        }
        catch (error) {
            this.logger.error(`Failed to send invoice email to ${to}`, error);
            throw error;
        }
    }
    async sendOrderConfirmationEmail(to, bookingId, buyerName, totalAmount, itemsCount) {
        try {
            const subject = `Захиалга баталгаажлаа #${String(bookingId).padStart(5, '0')} — Xmedia`;
            const html = `
            <div style="font-family:Arial,sans-serif;color:#222;max-width:620px;margin:0 auto;border:1px solid #eaeaea;padding:24px;border-radius:12px;">
                <h2 style="color:#e11d48;margin-top:0;">Xmedia — Захиалга баталгаажлаа 🎉</h2>
                <p>Сайн байна уу, <b>${buyerName}</b>!</p>
                <p>Таны <b>#${String(bookingId).padStart(5, '0')}</b> дугаартай захиалга амжилттай баталгаажлаа.</p>
                
                <div style="background-color:#f9fafb;padding:16px;border-radius:8px;margin:20px 0;">
                    <p style="margin:4px 0;"><b>Нийт дүн:</b> ₮${totalAmount.toLocaleString()}</p>
                    <p style="margin:4px 0;"><b>Үйлчилгээний тоо:</b> ${itemsCount}</p>
                </div>

                <p>Бид удахгүй тантай холбогдож дэлгэрэнгүй мэдээлэл өгөх болно.</p>
                <p>Асуух зүйл гарвал манай <a href="https://www.facebook.com/Xtudio.mn" style="color:#e11d48;text-decoration:none;">фэйсбүүк хуудсаар</a> эсвэл <b>9590 5686</b> дугаараар холбогдоорой.</p>
                
                <hr style="border:none;border-top:1px solid #eee;margin:24px 0">
                <p style="font-size:12px;color:#888;text-align:center;">Баярлалаа, <br>Xtudio</p>
            </div>`;
            await this.transporter.sendMail({
                from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
                to,
                subject,
                html,
            });
            this.logger.log(`Order confirmation email sent to ${to} for booking #${bookingId}`);
        }
        catch (error) {
            this.logger.error(`Failed to send order confirmation email to ${to} for booking #${bookingId}`, error);
        }
    }
};
exports.MailService = MailService;
exports.MailService = MailService = MailService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], MailService);
//# sourceMappingURL=mail.service.js.map