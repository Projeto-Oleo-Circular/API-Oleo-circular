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

function formatarDataEmail(isoData?: string): string {
  if (!isoData) return "";
  
  const data = new Date(isoData);
  if (isNaN(data.getTime())) return isoData; 

  const dataFormatada = data.toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" });

  const horaInicio = data.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Sao_Paulo",
    hour12: false,
  });

  const [h] = horaInicio.split(":").map(Number);
  const horaFimNum = h + 1;
  const horaFim = `${String(horaFimNum).padStart(2, '0')}:00`;

  let turno = "";
  if (h >= 8 && h < 12) turno = "Manhã";
  else if (h >= 13 && h < 17) turno = "Tarde";
  else if (h >= 18 && h < 22) turno = "Noite";
  else turno = "Comercial";

  return `${dataFormatada} • ${turno} (${horaInicio} - ${horaFim})`;
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
                ? `<br/><br/><strong>Data e Horário Previsto</strong><br/>${formatarDataEmail(dataColeta)}`
                : ''
            }
          `,

          ctaLabel: 'Ver minhas coletas',
          ctaUrl: 'https://typper.shop/login',
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
              Obrigado por colaborar com a Oleo Circular e contribuir para a
              destinação correta dos resíduos.
            </p>
          `,

          secondaryContentHtml: `
            <strong>Local da coleta</strong><br/>
            ${endereco}
          `,

          ctaLabel: 'Solicitar nova coleta',
          ctaUrl: 'https://typper.shop/login',
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