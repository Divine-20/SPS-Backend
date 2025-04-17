import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as nodemailer from "nodemailer";

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get("SMTP_HOST"),
      port: this.configService.get("SMTP_PORT"),
      secure: true,
      auth: {
        user: this.configService.get("SMTP_USER"),
        pass: this.configService.get("SMTP_PASSWORD"),
      },
    });
  }

  generateIncidentEmailTemplate(name: string, trackingCode: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
          }
          .container {
            padding: 20px;
            background-color: #f9f9f9;
          }
          .logo {
            text-align: center;
            margin-bottom: 20px;
          }
          .logo img {
            max-width: 200px;
            height: auto;
          }
          .content {
            background-color: white;
            padding: 20px;
            border-radius: 5px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .tracking-code {
            background-color: #f5f5f5;
            padding: 10px;
            border-radius: 4px;
            text-align: center;
            margin: 20px 0;
            font-size: 18px;
            font-weight: bold;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">
            <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSiUuniHpLnl0XoTPFMk_ophFqopTEYFyHkKw&s" alt="Logo">
          </div>
          <div class="content">
            <h2>Incident Report Confirmation</h2>
            <p>Hello ${name},</p>
            <p>Thank you for submitting your incident report. We have successfully received your case.</p>
            <div class="tracking-code">
              Your Case ID: ${trackingCode}
            </div>
            <p>Please keep this tracking code for future reference. You can use it to check the status of your case.</p>
            <p>If you have any questions or need to provide additional information, please don't hesitate to contact us.</p>
            <p>Best regards,<br>Support Team</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  async sendIncidentEmail(
    to: string,
    name: string,
    trackingCode: string
  ): Promise<void> {
    const htmlContent = this.generateIncidentEmailTemplate(name, trackingCode);

    const mailOptions = {
      from: this.configService.get("SMTP_FROM_EMAIL"),
      to,
      subject: "Incident Report Confirmation",
      html: htmlContent,
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error("Failed to send email:", error);
      throw error;
    }
  }
}
