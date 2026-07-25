import { Resend } from 'resend';
import { emailConfig } from '../../shared/config/email';

const resendClient = new Resend(emailConfig.resendApiKey);

export class EmailService {
  static async sendEmail(to: string, subject: string, body: string) {
    try {
      await resendClient.emails.send({
        from: 'delivered@resend.dev',
        to,
        subject,
        html: body}
      );        console.log(`E-mail enviado para ${to} com assunto "${subject}"`)

    } catch (error) {
      console.error('Falha ao enviar e-mail:', error);
    }
  }

  static async sendParceiroStatus(to: string, nome: string, status: string, observacao?: string) {
    let subject = 'Atualização do seu cadastro';
    let body = '';

    if (status === 'PENDENTE') {
      subject = 'Cadastro em análise';
      body = `<p>Olá ${nome},</p>
        <p>Seu cadastro foi recebido e está em processo de aprovação. Em breve você receberá a confirmação.</p>
        <p>Obrigado por se cadastrar na plataforma da cooperativa.</p>`;
    }

    if (status === 'APROVADO') {
      subject = 'Cadastro aprovado';
      body = `<p>Olá ${nome},</p>
        <p>Parabéns! Seu cadastro foi aprovado. Agora você pode usar a plataforma para solicitar coletas.</p>
        <p>Bem-vindo à cooperativa!</p>`;
    }

    if (status === 'REJEITADO') {
      subject = 'Cadastro rejeitado';
      body = `<p>Olá ${nome},</p>
        <p>Infelizmente seu cadastro foi rejeitado.</p>
        <p>Motivo: ${observacao ?? 'Sem observação informada'}.</p>
        <p>Por favor, revise as informações e tente novamente.</p>`;
    }

    await EmailService.sendEmail(to, subject, body);
  }

  static async sendPontoStatus(to: string, nome: string, endereco: string, status: string, observacao?: string) {
    let subject = 'Atualização do seu ponto de coleta';
    let body = '';

    if (status === 'PENDENTE') {
      subject = 'Novo ponto em análise';
      body = `<p>Olá ${nome},</p>
        <p>Seu novo ponto de coleta (${endereco}) foi cadastrado e está em análise.</p>
        <p>Em breve retornaremos com o resultado.</p>`;
    }

    if (status === 'APROVADO') {
      subject = 'Ponto de coleta aprovado';
      body = `<p>Olá ${nome},</p>
        <p>Seu ponto de coleta (${endereco}) foi aprovado! Agora você pode solicitar coletas para ele.</p>
        <p>Obrigado por colaborar com a cooperativa.</p>`;
    }

    if (status === 'REJEITADO') {
      subject = 'Ponto de coleta rejeitado';
      body = `<p>Olá ${nome},</p>
        <p>Seu ponto de coleta (${endereco}) foi rejeitado.</p>
        <p>Motivo: ${observacao ?? 'Sem observação informada'}.</p>
        <p>Por favor, verifique os dados e tente novamente.</p>`;
    }

    await EmailService.sendEmail(to, subject, body);
  }
}
