import { renderEmailTemplate } from '../EmailTemplate';

interface ConfirmarEmailParams {
  nome: string;
  confirmUrl: string;
  tempoExpiracaoHoras?: number;
}

interface EmailTemplateResult {
  subject: string;
  html: string;
}

export function renderConfirmarEmail({
  nome,
  confirmUrl,
  tempoExpiracaoHoras = 24,
}: ConfirmarEmailParams): EmailTemplateResult {
  return {
    subject: 'Confirme seu e-mail',

    html: renderEmailTemplate({
      preheader:
        'Confirme seu endereço de e-mail para ativar sua conta.',

      title: 'Confirme seu e-mail',

      badge: 'INFO',

      contentHtml: `
        <p>Olá <strong>${nome}</strong>,</p>

        <p>
          Seja bem-vindo(a) à Cooperativa!
        </p>

        <p>
          Para concluir seu cadastro e ativar sua conta,
          confirme seu endereço de e-mail clicando no botão abaixo.
        </p>

        <p>
          Esse procedimento garante a segurança da sua conta e permite que
          possamos enviar notificações importantes.
        </p>
      `,

      ctaLabel: 'Confirmar e-mail',

      ctaUrl: confirmUrl,

      secondaryContentHtml: `
        <strong>Validade do link</strong>

        <br/><br/>

        Este link permanecerá válido por
        <strong>${tempoExpiracaoHoras} horas</strong>.

        Caso expire, você poderá solicitar um novo link de confirmação.
      `,

      warningHtml: `
        Caso você não tenha criado uma conta em nossa plataforma,
        ignore este e-mail.
      `,
    }),
  };
}