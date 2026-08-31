import {
  EmailStatus,
  renderEmailTemplate,
} from '../../EmailTemplate';



async sendPasswordResetEmail(to: string, resetLink: string): Promise<void> {
    await this.transporter.sendMail({
      from: process.env.SMTP_FROM,
      to,
      subject: 'Redefinição de senha',
      html: `
        <h1>Redefinir Senha</h1>
        <p>Clique no link abaixo para redefinir sua senha. Este link é válido por 15 minutos.</p>
        <a href="${resetLink}">${resetLink}</a>
        <p>Se você não solicitou, ignore este e-mail.</p>
      `,
    });
  }