import { Injectable, Logger } from '@nestjs/common';
import * as https from 'https';

@Injectable()
export class MailService {
    private readonly logger = new Logger(MailService.name);

    private readonly ADMIN_EMAIL = 'xtudiomn@gmail.com';

    private async sendViaBrevoApi(to: string, subject: string, htmlContent: string, attachments: any[] = [], skipCC = false) {
        return new Promise((resolve, reject) => {
            let senderEmail = process.env.EMAIL_FROM || 'gnbkk13@gmail.com';
            const emailMatch = senderEmail.match(/<([^>]+)>/);
            if (emailMatch) {
                senderEmail = emailMatch[1];
            }

            // CC admin only when skipCC=false and recipient is not admin (e.g. order confirmation to customer)
            const ccList = (!skipCC && to !== this.ADMIN_EMAIL) ? [{ email: this.ADMIN_EMAIL }] : [];

            const data = JSON.stringify({
                sender: {
                    name: process.env.COMPANY_NAME || 'XTUDIO',
                    email: senderEmail,
                },
                to: [{ email: to }],
                cc: ccList.length > 0 ? ccList : undefined,
                subject: subject,
                htmlContent: htmlContent,
                attachment: attachments.length > 0 ? attachments : undefined,
            });

            const apiKey =
                process.env.BREVO_API_KEY ||
                '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';

            const options = {
                hostname: 'api.brevo.com',
                port: 443,
                path: '/v3/smtp/email',
                method: 'POST',
                headers: {
                    accept: 'application/json',
                    'api-key': apiKey,
                    'content-type': 'application/json',
                    'content-length': Buffer.byteLength(data),
                },
            };

            const req = https.request(options, (res) => {
                let responseBody = '';
                res.on('data', (d) => (responseBody += d));
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

    // ─── Shared premium layout ────────────────────────────────────────────────
    private emailLayout(
        headerColor: string,
        badgeText: string,
        badgeBg: string,
        badgeColor: string,
        bodyContent: string,
    ): string {
        return `<!DOCTYPE html>
<html lang="mn">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
</head>
<body style="margin:0;padding:0;background:#f4f5f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f4f5f7;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;">

        <!-- HEADER -->
        <tr>
          <td style="background:${headerColor};border-radius:12px 12px 0 0;padding:22px 32px;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
              <td style="color:#fff;font-size:15px;font-weight:700;letter-spacing:0.4px;">${badgeText}</td>
              <td align="right">
                <img src="https://xtudio-six.vercel.app/XTUDIO%20LOGO-1.png" height="30" alt="XTUDIO" style="display:block;filter:brightness(0) invert(1);" />
              </td>
            </tr></table>
          </td>
        </tr>

        <!-- BODY CARD -->
        <tr>
          <td style="background:#fff;border-radius:0 0 12px 12px;padding:32px;border:1px solid #e5e7eb;border-top:none;">



            ${bodyContent}

            <!-- FOOTER -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:24px;border-top:1px solid #f0f0f0;padding-top:16px;">
              <tr>
                <td align="center" style="color:#9ca3af;font-size:12px;">
                  Энэ мэйл <strong>XTUDIO</strong> системээс автоматаар илгээгдсэн.
                </td>
              </tr>
            </table>

          </td>
        </tr>

        <tr><td height="24"></td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
    }

    // ─── Info row ─────────────────────────────────────────────────────────────
    private row(label: string, value: string): string {
        return `<tr>
          <td style="padding:11px 16px;border-bottom:1px solid #f3f4f6;color:#6b7280;font-size:13px;width:42%;vertical-align:top;">${label}</td>
          <td style="padding:11px 16px;border-bottom:1px solid #f3f4f6;color:#111827;font-size:13px;font-weight:500;vertical-align:top;">${value}</td>
        </tr>`;
    }

    // ─── Info table ───────────────────────────────────────────────────────────
    private table(rows: string, title?: string): string {
        const titleHtml = title
            ? `<p style="font-size:13px;font-weight:600;color:#374151;margin:0 0 8px;">${title}</p>`
            : '';
        return `${titleHtml}<table width="100%" cellpadding="0" cellspacing="0" border="0"
          style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;margin-bottom:24px;">
          <tbody>${rows}</tbody>
        </table>`;
    }

    // ─────────────────────────────────────────────────────────────────────────
    async sendInvoiceEmail(
        to: string,
        subject: string,
        html: string,
        pdfBuffer: Buffer | null,
        filename: string | null,
    ) {
        try {
            const attachments: any[] = [];
            if (pdfBuffer && filename) {
                attachments.push({ name: filename, content: pdfBuffer.toString('base64') });
            }
            // skipCC=true: PDF invoice goes to customer only; admin gets a separate notification email
            await this.sendViaBrevoApi(to, subject, html, attachments, true);
            this.logger.log(`Invoice email sent to ${to}`);
        } catch (error) {
            this.logger.error(`Failed to send invoice email to ${to}`, error);
            throw error;
        }
    }

    async sendOrderConfirmationEmail(
        to: string,
        bookingId: number,
        buyerName: string,
        totalAmount: number,
        itemsCount: number,
    ) {
        try {
            const orderNum = String(bookingId).padStart(5, '0');
            const subject = `Захиалга баталгаажлаа #${orderNum} — XTUDIO`;

            const body = `
              <h2 style="margin:0 0 6px;font-size:22px;font-weight:700;color:#111827;">Захиалга баталгаажлаа 🎉</h2>
              <p style="margin:0 0 24px;color:#6b7280;font-size:14px;line-height:1.6;">
                Сайн байна уу, <strong style="color:#111827;">${buyerName}</strong>!
                Таны захиалга амжилттай баталгаажлаа.
              </p>
              ${this.table(
                  this.row('Захиалгын дугаар', `#${orderNum}`) +
                      this.row('Захиалагч', buyerName) +
                      this.row('Үйлчилгээний тоо', `${itemsCount} үйлчилгээ`) +
                      this.row('Нийт дүн', `&#8366;${totalAmount.toLocaleString()}`),
                  'Захиалгын мэдээлэл',
              )}
              <p style="font-size:13px;color:#6b7280;margin:0;line-height:1.6;">
                Бид удахгүй тантай холбогдож дэлгэрэнгүй мэдээлэл өгөх болно.
              </p>`;

            const html = this.emailLayout('#16a34a', 'БАТАЛГААЖСАН', '#dcfce7', '#15803d', body);
            await this.sendViaBrevoApi(to, subject, html);
            this.logger.log(`Order confirmation email sent to ${to} for booking #${bookingId}`);
        } catch (error) {
            this.logger.error(`Failed to send order confirmation email to ${to} for booking #${bookingId}`, error);
        }
    }

    async sendOrderCancelledEmail(bookingId: number, buyerName: string, totalAmount: number) {
        try {
            const orderNum = String(bookingId).padStart(5, '0');
            const subject = `Захиалга цуцлагдлаа #${orderNum} — XTUDIO`;

            const body = `
              <h2 style="margin:0 0 6px;font-size:22px;font-weight:700;color:#111827;">Захиалга цуцлагдлаа &#10060;</h2>
              <p style="margin:0 0 24px;color:#6b7280;font-size:14px;line-height:1.6;">
                Дараах захиалга цуцлагдсан байна.
              </p>
              ${this.table(
                  this.row('Захиалгын дугаар', `#${orderNum}`) +
                      this.row('Захиалагч', buyerName) +
                      this.row('Нийт дүн', `&#8366;${totalAmount.toLocaleString()}`),
                  'Захиалгын мэдээлэл',
              )}
`;

            const html = this.emailLayout('#dc2626', 'ЦУЦЛАГДСАН', '#fee2e2', '#dc2626', body);
            await this.sendViaBrevoApi(this.ADMIN_EMAIL, subject, html);
            this.logger.log(`Order cancelled notification sent to admin for booking #${bookingId}`);
        } catch (error) {
            this.logger.error(`Failed to send order cancelled email for booking #${bookingId}`, error);
        }
    }

    async sendNewOrderNotificationToAdmin(
        bookingId: number,
        buyerName: string,
        buyerPhone: string,
        serviceName: string,
        totalAmount: number,
    ) {
        try {
            const isInvoice = serviceName.startsWith('[НЭХЭМЖЛЭХ]');
            const cleanService = isInvoice ? serviceName.replace('[НЭХЭМЖЛЭХ] ', '') : serviceName;
            const orderNum = String(bookingId).padStart(5, '0');

            const subject = isInvoice
                ? `Нэхэмжлэх хүсэлт #${orderNum} — XTUDIO`
                : `Шинэ захиалга #${orderNum} — XTUDIO`;

            const headerColor = isInvoice ? '#7c3aed' : '#1d4ed8';
            const badgeText = isInvoice ? 'НЭХЭМЖЛЭХ ХҮСЭЛТ' : 'ШИНЭ ЗАХИАЛГА';
            const badgeBg = isInvoice ? '#ede9fe' : '#dbeafe';
            const badgeColor = isInvoice ? '#7c3aed' : '#1d4ed8';
            const icon = isInvoice ? '&#128196;' : '&#127881;';

            const body = `
              ${this.table(
                  this.row('Захиалгын дугаар', `#${orderNum}`) +
                      this.row('Захиалагчийн нэр', buyerName) +
                      this.row('Утасны дугаар', buyerPhone) +
                      this.row('Үйлчилгээ', cleanService) +
                      this.row('Нийт дүн', `&#8366;${totalAmount.toLocaleString()}`),
                  'Захиалгын дэлгэрэнгүй',
              )}
`;

            const html = this.emailLayout(headerColor, badgeText, badgeBg, badgeColor, body);
            await this.sendViaBrevoApi(this.ADMIN_EMAIL, subject, html);
            this.logger.log(`New order admin notification sent for booking #${bookingId}`);
        } catch (error) {
            this.logger.error(`Failed to send new order admin notification for booking #${bookingId}`, error);
        }
    }
}
