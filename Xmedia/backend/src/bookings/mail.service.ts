import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
    private readonly logger = new Logger(MailService.name);
    private transporter: nodemailer.Transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST || 'smtp.gmail.com',
            port: Number(process.env.EMAIL_PORT) || 587,
            secure: false,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD,
            },
        });
    }

    async sendInvoiceEmail(to: string, subject: string, html: string, pdfBuffer: Buffer | null, filename: string | null) {
        try {
            const attachments: any[] = pdfBuffer && filename ? [{
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
                    if (fs.existsSync(p)) return p;
                }
                return null;
            };

            const golomtPath = getFilePath('golomt.jpeg');
            const mbankPath = getFilePath('mbank.png');
            const xtudioPath = getFilePath('xtudio.png');

            if (golomtPath) attachments.push({ filename: 'golomt.jpeg', path: golomtPath, cid: 'golomtLogo' });
            if (mbankPath) attachments.push({ filename: 'mbank.png', path: mbankPath, cid: 'mbankLogo' });
            if (xtudioPath) attachments.push({ filename: 'xtudio.png', path: xtudioPath, cid: 'xtudioLogo' });

            await this.transporter.sendMail({
                from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
                to,
                subject,
                html,
                attachments,
            });
            this.logger.log(`Invoice email sent to ${to}`);
        } catch (error) {
            this.logger.error(`Failed to send invoice email to ${to}`, error);
            throw error;
        }
    }
    async sendOrderConfirmationEmail(to: string, bookingId: number, buyerName: string, totalAmount: number, itemsCount: number) {
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
        } catch (error) {
            this.logger.error(`Failed to send order confirmation email to ${to} for booking #${bookingId}`, error);
            // Non-blocking error, so we don't throw
        }
    }
}
