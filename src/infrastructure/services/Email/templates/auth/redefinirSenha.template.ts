import { renderEmailTemplate } from '../../EmailTemplate';

export interface NovaSolicitacaoAdminProps {
  nomePonto: string;
  endereco: string;
  cidade: string;
  estado: string;
  volume: number;
  solicitacaoId: number;
}

export interface ConfirmacaoSolicitacaoParceiroProps {
  nomeParceiro: string;
  nomePonto: string;
  endereco: string;
  volume: number;
  solicitacaoId: number;
}

export interface RedefinicaoSenhaProps {
  nomeParceiro: string;
  resetLink: string;
}

export interface EmailTemplateResult {
  subject: string;
  html: string;
}

export function novaSolicitacaoColetaAdminTemplate({
  nomePonto,
  endereco,
  cidade,
  estado,
  volume,
  solicitacaoId,
}: NovaSolicitacaoAdminProps): EmailTemplateResult {
  return {
    subject: `Nova Solicitação de Coleta #${solicitacaoId}`,
    html: renderEmailTemplate({
      preheader: 'Uma nova solicitação de coleta foi criada e aguarda aprovação administrativa.',
      title: 'Nova solicitação de coleta',
      badge: 'INFO',
      contentHtml: `
        <p>Uma nova solicitação de coleta foi criada e aguarda aprovação administrativa.</p>

        <h3>Informações da solicitação</h3>

        <p><strong>ID da solicitação:</strong> #${solicitacaoId}</p>
        <p><strong>Ponto de coleta:</strong> ${nomePonto}</p>
        <p><strong>Endereço:</strong> ${endereco}</p>
        <p><strong>Cidade / Estado:</strong> ${cidade}/${estado}</p>
        <p><strong>Volume informado:</strong> ${volume} litros</p>
      `,
      ctaLabel: 'Abrir painel administrativo',
      ctaUrl: 'https://typper.shop/admin/login',
      secondaryContentHtml: `
        <strong>Próximos passos</strong>
        <p>Verifique e aprove ou rejeite esta solicitação no painel administrativo.</p>
      `,
      footerMessage: 'Obrigado por usar o sistema de coleta sustentável da Oleo Circular.',
    }),
  };
}

export function confirmacaoSolicitacaoParceiroTemplate({
  nomeParceiro,
  nomePonto,
  endereco,
  volume,
  solicitacaoId,
}: ConfirmacaoSolicitacaoParceiroProps): EmailTemplateResult {
  return {
    subject: `Sua solicitação de coleta #${solicitacaoId} foi recebida`,
    html: renderEmailTemplate({
      preheader: 'Sua solicitação de coleta foi registrada com sucesso.',
      title: 'Solicitação Registrada!',
      contentHtml: `
        <p>Olá, <strong>${nomeParceiro}</strong>!</p>
        <p>Sua solicitação de coleta foi registrada com sucesso e está aguardando análise administrativa.</p>

        <h3>Detalhes da Solicitação</h3>
        <p><strong>Código:</strong> #${solicitacaoId}</p>
        <p><strong>Ponto de Coleta:</strong> ${nomePonto}</p>
        <p><strong>Endereço:</strong> ${endereco}</p>
        <p><strong>Volume Informado:</strong> ${volume} Litros</p>
      `,
      secondaryContentHtml: `
        <p>Você receberá atualizações sobre o agendamento da coleta por e-mail.</p>
      `,
      footerMessage: 'Obrigado por contribuir com a logística reversa e com o meio ambiente!',
    }),
  };
}

export function redefinirSenhaParceiroTemplate({
  nomeParceiro,
  resetLink,
}: RedefinicaoSenhaProps): EmailTemplateResult {
  return {
    subject: 'Solicitação de Redefinição de Senha',
    html: renderEmailTemplate({
      preheader: 'Você solicitou a redefinição de senha para a sua conta.',
      title: 'Recuperação de Senha',
      contentHtml: `
        <p>Olá, <strong>${nomeParceiro}</strong>!</p>
        <p>Recebemos uma solicitação para redefinir a senha da sua conta de parceiro.</p>
        <p>Para prosseguir com a criação de uma nova senha, clique no botão abaixo. O link é válido por <strong>15 minutos</strong>:</p>
      `,
      ctaLabel: 'Redefinir Minha Senha',
      ctaUrl: resetLink,
      secondaryContentHtml: `
        <p>Se você não solicitou a recuperação de senha, pode ignorar este e-mail com segurança. Sua senha atual continuará a mesma.</p>
      `,
      footerMessage: 'Obrigado por usar o sistema de coleta sustentável da Oleo Circular.',
    }),
  };
}