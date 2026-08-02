import { renderEmailTemplate } from '../../EmailTemplate';

interface BoasVindasEmailParams {
  nome: string;
  loginUrl?: string;
}

interface EmailTemplateResult {
  subject: string;
  html: string;
}

export function renderBoasVindasEmail({
  nome,
  loginUrl,
}: BoasVindasEmailParams): EmailTemplateResult {
  return {
    subject: 'Bem-vindo(a) à Oleo Circular!',

    html: renderEmailTemplate({
      preheader:
        'Sua conta foi criada com sucesso.',

      title: 'Seja bem-vindo(a)!',

      badge: 'APROVADO',

      contentHtml: `
        <p>Olá <strong>${nome}</strong>,</p>

        <p>
          É um prazer ter você conosco!
        </p>

        <p>
          Sua conta já está pronta para uso e você pode aproveitar todos os
          recursos disponíveis na plataforma.
        </p>

        <p>
          A partir de agora você poderá cadastrar pontos de coleta,
          solicitar coletas e acompanhar todas as solicitações
          diretamente pelo sistema.
        </p>
      `,

      secondaryContentHtml: `
        <strong>Primeiros passos</strong>

        <ul style="padding-left:20px; margin:12px 0;">
          <li>Complete seus dados cadastrais.</li>
          <li>Cadastre seus pontos de coleta.</li>
          <li>Solicite sua primeira coleta.</li>
          <li>Acompanhe o andamento das solicitações.</li>
        </ul>
      `,

      ...(loginUrl && {
        ctaLabel: 'Acessar plataforma',
        ctaUrl: loginUrl,
      }),

      footerMessage: `
        Obrigado por fazer parte da Oleo Circular.<br/>
        Juntos contribuímos para uma gestão mais sustentável dos resíduos.
      `,
    }),
  };
}