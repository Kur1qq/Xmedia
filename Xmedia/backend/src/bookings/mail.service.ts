import { Injectable, Logger } from '@nestjs/common';
import * as https from 'https';

@Injectable()
export class MailService {
    private readonly logger = new Logger(MailService.name);

    private async sendViaBrevoApi(to: string, subject: string, htmlContent: string, attachments: any[] = []) {
        return new Promise((resolve, reject) => {
            const data = JSON.stringify({
                sender: {
                    name: process.env.COMPANY_NAME || "Xmedia",
                    email: process.env.EMAIL_FROM || 'gnbkk13@gmail.com'
                },
                to: [{ email: to }],
                subject: subject,
                htmlContent: htmlContent,
                attachment: attachments.length > 0 ? attachments : undefined
            });

            const apiKey = process.env.BREVO_API_KEY || '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';

            const options = {
                hostname: 'api.brevo.com',
                port: 443,
                path: '/v3/smtp/email',
                method: 'POST',
                headers: {
                    'accept': 'application/json',
                    'api-key': apiKey,
                    'content-type': 'application/json',
                    'content-length': Buffer.byteLength(data)
                }
            };

            const req = https.request(options, (res) => {
                let responseBody = '';
                res.on('data', (d) => responseBody += d);
                res.on('end', () => {
                    if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
                        try {
                            resolve(JSON.parse(responseBody));
                        } catch (e) {
                            resolve(responseBody);
                        }
                    } else {
                        reject(new Error(`Brevo API Error ${res.statusCode}: ${responseBody}`));
                    }
                });
            });

            req.on('error', (error) => reject(error));
            req.write(data);
            req.end();
        });
    }

    async sendInvoiceEmail(to: string, subject: string, html: string, pdfBuffer: Buffer | null, filename: string | null) {
        try {
            const attachments: any[] = [];

            if (pdfBuffer && filename) {
                attachments.push({
                    name: filename,
                    content: pdfBuffer.toString('base64')
                });
            }

            await this.sendViaBrevoApi(to, subject, html, attachments);
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

            await this.sendViaBrevoApi(to, subject, html);
            this.logger.log(`Order confirmation email sent to ${to} for booking #${bookingId}`);
        } catch (error) {
            this.logger.error(`Failed to send order confirmation email to ${to} for booking #${bookingId}`, error);
        }
    }
}
