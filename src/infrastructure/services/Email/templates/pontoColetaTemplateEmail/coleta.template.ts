import { EmailStatus, renderEmailTemplate } from '../../EmailTemplate';

export type ColetaStatus =
  | 'SOLICITADA'
  | 'AGENDADA'
  | 'EM_ANDAMENTO'
  | 'CONCLUIDA'
  | 'CANCELADA';

interface ColetaEmailParams {
  nome: string;
  endereco: string;
  dataColeta?: string;
  status: ColetaStatus;
  observacao?: string;
}

interface EmailTemplateResult {
  subject: string;
  html: string;
}

export function renderColetaEmail({
  nome,
  endereco,
  dataColeta,
  status,
  observacao,
}: ColetaEmailParams): EmailTemplateResult {
  switch (status) {
    case 'SOLICITADA':
      return {
        subject: 'Solicitação de coleta recebida',
        html: renderEmailTemplate({
          preheader: 'Recebemos sua solicitação de coleta.',
          badge: 'PENDENTE',
          title: 'Solicitação recebida',

          contentHtml: `
            <p>Olá <strong>${nome}</strong>,</p>

            <p>
              Sua solicitação de coleta foi registrada com sucesso.
            </p>

            <p>
              Em breve nossa equipe fará o agendamento.
            </p>
          `,

          secondaryContentHtml: `
            <strong>Local da coleta</strong><br/>
            ${endereco}
          `,
        }),
      };

    case 'AGENDADA':
      return {
        subject: 'Coleta agendada',

        html: renderEmailTemplate({
          preheader: 'Sua coleta foi agendada.',
          badge: 'INFO',
          title: 'Coleta agendada',

          contentHtml: `
            <p>Olá <strong>${nome}</strong>,</p>

            <p>
              Sua coleta foi agendada com sucesso.
            </p>
          `,

          secondaryContentHtml: `
            <strong>Endereço</strong><br/>
            ${endereco}

            ${
              dataColeta
                ? `<br/><br/><strong>Data prevista</strong><br/>${dataColeta}`
                : ''
            }
          `,

          ctaLabel: 'Ver minhas coletas',
          ctaUrl: 'https://cooperativa.com.br/coletas',
        }),
      };

    case 'EM_ANDAMENTO':
      return {
        subject: 'Sua coleta está em andamento',

        html: renderEmailTemplate({
          preheader: 'A coleta já está sendo realizada.',
          badge: 'INFO',
          title: 'Coleta em andamento',

          contentHtml: `
            <p>Olá <strong>${nome}</strong>,</p>

            <p>
              Nossa equipe já iniciou sua coleta.
            </p>

            <p>
              Em breve ela será finalizada.
            </p>
          `,

          secondaryContentHtml: `
            <strong>Endereço</strong><br/>
            ${endereco}
          `,
        }),
      };

    case 'CONCLUIDA':
      return {
        subject: 'Coleta concluída',

        html: renderEmailTemplate({
          preheader: 'Sua coleta foi concluída.',
          badge: 'APROVADO',
          title: 'Coleta concluída',

          contentHtml: `
            <p>Olá <strong>${nome}</strong>,</p>

            <p>
              Sua coleta foi concluída com sucesso.
            </p>

            <p>
              Obrigado por colaborar com a cooperativa e contribuir para a
              destinação correta dos resíduos.
            </p>
          `,

          secondaryContentHtml: `
            <strong>Local da coleta</strong><br/>
            ${endereco}
          `,

          ctaLabel: 'Solicitar nova coleta',
          ctaUrl: 'https://cooperativa.com.br/coletas',
        }),
      };

    case 'CANCELADA':
      return {
        subject: 'Coleta cancelada',

        html: renderEmailTemplate({
          preheader: 'Sua coleta foi cancelada.',
          badge: 'REJEITADO',
          title: 'Coleta cancelada',

          contentHtml: `
            <p>Olá <strong>${nome}</strong>,</p>

            <p>
              A coleta solicitada foi cancelada.
            </p>
          `,

          secondaryContentHtml: `
            <strong>Endereço</strong><br/>
            ${endereco}
          `,

          warningHtml: `
            <strong>Motivo:</strong><br/>
            ${observacao ?? 'Nenhum motivo informado.'}
          `,
        }),
      };

    default:
      return {
        subject: 'Atualização da coleta',

        html: renderEmailTemplate({
          preheader: 'Sua coleta foi atualizada.',
          badge: 'INFO',
          title: 'Atualização da coleta',

          contentHtml: `
            <p>Olá <strong>${nome}</strong>,</p>

            <p>
              Houve uma atualização na sua coleta.
            </p>
          `,
        }),
      };
  }
}