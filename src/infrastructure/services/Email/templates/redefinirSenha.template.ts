import { renderEmailTemplate } from '../EmailTemplate';

interface RedefinirSenhaEmailParams {
  nome: string;
  resetUrl: string;
  tempoExpiracaoMinutos?: number;
}

interface EmailTemplateResult {
  subject: string;
  html: string;
}

export function renderRedefinirSenhaEmail({
  nome,
  resetUrl,
  tempoExpiracaoMinutos = 30,
}: RedefinirSenhaEmailParams): EmailTemplateResult {
  return {
    subject: 'Redefinição de senha',

    html: renderEmailTemplate({
      preheader:
        'Recebemos uma solicitação para redefinir sua senha.',

      title: 'Redefinição de senha',

      badge: 'INFO',

      contentHtml: `
        <p>Olá <strong>${nome}</strong>,</p>

        <p>
          Recebemos uma solicitação para redefinir a senha da sua conta.
        </p>

        <p>
          Caso tenha sido você, clique no botão abaixo para criar uma nova senha.
        </p>

        <p>
          Se você não fez essa solicitação, ignore este e-mail.
          Sua conta continuará segura.
        </p>
      `,

      ctaLabel: 'Redefinir senha',

      ctaUrl: resetUrl,

      secondaryContentHtml: `
        <strong>Importante</strong>

        <br/><br/>

        Este link expira em
        <strong>${tempoExpiracaoMinutos} minutos</strong>.

        <br/><br/>

        Após esse período será necessário solicitar uma nova redefinição.
      `,

      warningHtml: `
        Nunca compartilhe este link com outras pessoas.
      `,
    }),
  };
}