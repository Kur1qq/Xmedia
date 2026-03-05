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
            const attachments = pdfBuffer && filename ? [{
                filename,
                content: pdfBuffer,
                contentType: 'application/pdf',
            }] : [];

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
}
