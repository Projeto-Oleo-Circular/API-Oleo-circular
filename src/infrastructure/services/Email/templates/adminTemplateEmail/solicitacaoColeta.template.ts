import { renderEmailTemplate } from '../../EmailTemplate';

interface NovaSolicitacaoColetaTemplateProps {
  nomePonto: string;
  endereco: string;
  cidade: string;
  estado: string;
  volume: number;
  solicitacaoId: number;
}

interface EmailTemplateResult {
  subject: string;
  html: string;
}

export function novaSolicitacaoColetaTemplate({
  nomePonto,
  endereco,
  cidade,
  estado,
  volume,
  solicitacaoId,
}: NovaSolicitacaoColetaTemplateProps): EmailTemplateResult {
  return {
    subject: 'Nova solicitação de coleta registrada',
    html: renderEmailTemplate({
      preheader:
        'Uma nova solicitação de coleta foi criada e aguarda aprovação administrativa.',
      title: 'Nova solicitação de coleta',
      badge: 'INFO',
      contentHtml: `
        <p>Uma nova solicitação de coleta foi criada e aguarda aprovação administrativa.</p>

        <h3>Informações da solicitação</h3>

        <p><strong>ID da solicitação:</strong> ${solicitacaoId}</p>
        <p><strong>Ponto de coleta:</strong> ${nomePonto}</p>
        <p><strong>Endereço:</strong> ${endereco}</p>
        <p><strong>Cidade / Estado:</strong> ${cidade}/${estado}</p>
        <p><strong>Volume informado:</strong> ${volume} litros</p>
      `,
      ctaLabel: 'Abrir painel administrativo',
      ctaUrl: 'https://OleoCircular.com.br/admin/solicitacoes',
      secondaryContentHtml: `
        <strong>Próximos passos</strong>

        <p>Verifique e aprove ou rejeite esta solicitação no painel administrativo.</p>
      `,
      footerMessage:
        'Obrigado por usar o sistema de coleta sustentável da Oleo Circular.',
    }),
  };
}
