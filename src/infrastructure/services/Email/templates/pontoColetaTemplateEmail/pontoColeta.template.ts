import {
  EmailStatus,
  renderEmailTemplate,
} from '../../EmailTemplate';

interface PontoColetaStatusEmailParams {
  nome: string;
  endereco: string;
  status: EmailStatus;
  observacao?: string;
}

interface EmailTemplateResult {
  subject: string;
  html: string;
}

export function renderPontoColetaStatusEmail({
  nome,
  endereco,
  status,
  observacao,
}: PontoColetaStatusEmailParams): EmailTemplateResult {
  switch (status) {
    case 'PENDENTE':
      return {
        subject: 'Ponto de coleta em análise',

        html: renderEmailTemplate({
          preheader:
            'Seu ponto de coleta foi recebido e está em análise.',

          title: 'Ponto em análise',

          badge: 'PENDENTE',

          contentHtml: `
            <p>Olá <strong>${nome}</strong>,</p>

            <p>
              Recebemos o cadastro do seu novo ponto de coleta.
            </p>

            <p>
              Nossa equipe irá analisar as informações antes da aprovação.
            </p>
          `,

          secondaryContentHtml: `
            <strong>Endereço informado:</strong><br/>
            ${endereco}
          `,
        }),
      };

    case 'APROVADO':
      return {
        subject: 'Ponto de coleta aprovado',

        html: renderEmailTemplate({
          preheader:
            'Seu ponto de coleta foi aprovado.',

          title: 'Ponto aprovado',

          badge: 'APROVADO',

          contentHtml: `
            <p>Olá <strong>${nome}</strong>,</p>

            <p>
              Seu ponto de coleta foi aprovado com sucesso.
            </p>

            <p>
              Agora ele já está disponível para solicitações de coleta.
            </p>
          `,

          secondaryContentHtml: `
            <strong>Ponto aprovado:</strong><br/>
            ${endereco}
          `,

          ctaLabel: 'Ver meus pontos',

          ctaUrl:
            'https://typper.shop/login',
        }),
      };

    case 'REJEITADO':
      return {
        subject: 'Ponto de coleta rejeitado',

        html: renderEmailTemplate({
          preheader:
            'Seu ponto de coleta não pôde ser aprovado.',

          title: 'Ponto rejeitado',

          badge: 'REJEITADO',

          contentHtml: `
            <p>Olá <strong>${nome}</strong>,</p>

            <p>
              Após a análise, o ponto de coleta informado
              não pôde ser aprovado.
            </p>
          `,

          secondaryContentHtml: `
            <strong>Ponto informado:</strong><br/>
            ${endereco}
          `,

          warningHtml: `
            <strong>Motivo:</strong><br/>
            ${observacao ?? 'Nenhuma observação foi informada.'}
          `,
        }),
      };

    default:
      return {
        subject: 'Atualização do ponto de coleta',

        html: renderEmailTemplate({
          preheader:
            'Atualização do ponto de coleta.',

          title: 'Atualização',

          badge: 'INFO',

          contentHtml: `
            <p>Olá <strong>${nome}</strong>,</p>

            <p>
              Houve uma atualização referente ao seu ponto de coleta.
            </p>
          `,
        }),
      };
  }
}