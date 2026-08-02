import nodemailer from 'nodemailer';
import path from 'path';
import { emailConfig } from '../../../shared/config/email';

const transporter = nodemailer.createTransport({
  service: emailConfig.provider,
  auth: {
    user: emailConfig.gmailUser,
    pass: emailConfig.gmailAppPassword,
  },
});

interface SendEmailParams {
  to: string;
  subject: string;
  html: any;
}

export class EmailService {
  /**
   * Envia um e-mail HTML.
   */
  static async send({
    to,
    subject,
    html,
  }: SendEmailParams): Promise<void> {
    try {
      await transporter.sendMail({
        from: `Oléo Circular <${emailConfig.from}>`,
        to,
        subject,
        html,

       attachments: [
          {
            filename: 'logo-vertical.svg',
            path: path.resolve(
              __dirname,
              '../../../shared/assets/logo-vertical.svg',
            ),
            cid: 'logo',
          },
        ],
      });

      console.log(` E-mail enviado para ${to}`);
    } catch (error) {
      console.error(' Erro ao enviar e-mail:', error);
      throw error;
    }
  }
}