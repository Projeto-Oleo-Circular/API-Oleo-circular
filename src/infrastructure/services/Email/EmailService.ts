import { Resend } from 'resend';
import path from 'path';
import fs from 'fs';
import { emailConfig } from '../../../shared/config/email';

// Instância do SDK do Resend
const resend = new Resend(emailConfig.resendApiKey);

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

export class EmailService {
  /**
   * Envia um e-mail HTML via Resend.
   */
  static async send({ to, subject, html }: SendEmailParams): Promise<void> {
    try {
      // Leitura do anexo local
      const logoPath = path.resolve(
        __dirname,
        '../../../shared/assets/logo-vertical.svg'
      );
      const logoBuffer = fs.readFileSync(logoPath);

      const { data, error } = await resend.emails.send({
        from: `Óleo Circular <${emailConfig.from}>`,
        to: [to], 
        subject,
        html,
        attachments: [
          {
            filename: 'logo-vertical.svg',
            content: logoBuffer,
          },
        ],
      });

      if (error) {
        throw new Error(`Erro do Resend: ${error.message}`);
      }

    } catch (error) {
      console.error('Erro ao enviar e-mail:', error);
      throw new Error('Falha ao enviar e-mail');
    }
  }
}