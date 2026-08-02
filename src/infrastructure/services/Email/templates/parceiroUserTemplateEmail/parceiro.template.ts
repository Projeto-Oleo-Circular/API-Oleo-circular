import {
  EmailStatus,
  renderEmailTemplate,
} from '../../EmailTemplate';

interface ParceiroStatusEmailParams {
  nome: string;
  status: EmailStatus;
  observacao?: string;
}

interface EmailTemplateResult {
  subject: string;
  html: string;
}

export function renderParceiroStatusEmail({
  nome,
  status,
  observacao,
}: ParceiroStatusEmailParams): EmailTemplateResult {
  switch (status) {
    case 'PENDENTE':
      return {
        subject: 'Cadastro em análise',
        html: renderEmailTemplate({
          preheader:
            'Recebemos seu cadastro e ele está em análise.',

          title: 'Cadastro em análise',

          badge: 'PENDENTE',

          contentHtml: `
            <p>Olá <strong>${nome}</strong>,</p>

            <p>
              Recebemos sua solicitação de cadastro e ela já está sendo
              analisada pela equipe do Oleo Circular.
            </p>

            <p>
              Assim que a análise for concluída, você receberá uma nova
              notificação por e-mail.
            </p>

            <p>
              Agradecemos pelo interesse em fazer parte da nossa plataforma.
            </p>
          `,
        }),
      };

    case 'APROVADO':
      return {
        subject: 'Cadastro aprovado',

        html: renderEmailTemplate({
          preheader:
            'Seu cadastro foi aprovado com sucesso.',

          title: 'Cadastro aprovado',

          badge: 'APROVADO',

          contentHtml: `
            <p>Olá <strong>${nome}</strong>,</p>

            <p>
              Temos uma ótima notícia!
            </p>

            <p>
              Seu cadastro foi aprovado e você já pode acessar a plataforma
              para cadastrar pontos de coleta e solicitar coletas.
            </p>

            <p>
              Seja bem-vindo(a) à Oleo Circular!
            </p>
          `,

          ctaLabel: 'Acessar plataforma',

          ctaUrl:
            'https://Oleo Circular.com.br/login',
        }),
      };

    case 'REJEITADO':
      return {
        subject: 'Cadastro rejeitado',

        html: renderEmailTemplate({
          preheader:
            'Seu cadastro não pôde ser aprovado.',

          title: 'Cadastro rejeitado',

          badge: 'REJEITADO',

          contentHtml: `
            <p>Olá <strong>${nome}</strong>,</p>

            <p>
              Após a análise das informações enviadas,
              infelizmente seu cadastro não pôde ser aprovado.
            </p>
          `,

          warningHtml: `
            <strong>Motivo:</strong><br/>
            ${observacao ?? 'Nenhuma observação foi informada.'}
          `,

          secondaryContentHtml: `
            Você pode corrigir as informações e realizar um novo cadastro.
            Caso tenha dúvidas, entre em contato com nossa equipe.
          `,
        }),
      };

    default:
      return {
        subject: 'Atualização do cadastro',

        html: renderEmailTemplate({
          preheader: 'Atualização do cadastro.',

          title: 'Atualização',

          badge: 'INFO',

          contentHtml: `
            <p>Olá <strong>${nome}</strong>,</p>

            <p>
              Houve uma atualização referente ao seu cadastro.
            </p>
          `,
        }),
      };
  }
}