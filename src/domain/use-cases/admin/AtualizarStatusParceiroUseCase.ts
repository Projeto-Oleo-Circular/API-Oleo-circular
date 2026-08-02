import { IParceiroRepository } from '../../repositories/IParceiroRepository';
import { IPontoColetaRepository } from '../../repositories/IPontoColetaRepository';
import { EmailService } from '../../../infrastructure/services/Email/EmailService';
import { renderParceiroStatusEmail } from '../../../infrastructure/services/Email/templates/parceiroUserTemplateEmail/parceiro.template';
export class AtualizarStatusParceiroUseCase {
  constructor(
    private readonly parceiroRepository: IParceiroRepository,
    private readonly pontoColetaRepository: IPontoColetaRepository,
  ) {}

  async execute(parceiroId: string, status: 'APROVADO' | 'REJEITADO' | 'PENDENTE', observacao?: string) {
    const parceiro = await this.parceiroRepository.findById(parceiroId);

    if (!parceiro) {
      throw new Error('Parceiro não encontrado');
    }

    const parceiroAtualizado = await this.parceiroRepository.updateStatusComObservacao(parceiroId, status, observacao ?? null);

    if (status === 'APROVADO') {
      const pontosPendentes = await this.pontoColetaRepository.findByParceiroId(parceiroId);
      const pontosAprovar = pontosPendentes.filter((ponto) => ponto.statusAprovacaoPontoColeta === 'PENDENTE');

      await Promise.all(
        pontosAprovar.map((ponto) =>
          this.pontoColetaRepository.updateStatusComObservacao(ponto.id, 'APROVADO', null),
        ),
      );
    }

    // Substitua a chamada antiga do EmailService por esta:
    try {
      const template = renderParceiroStatusEmail({
        nome: parceiroAtualizado.nomeRazaoSocial,
        status: status,
        observacao: status === 'REJEITADO' ? observacao : undefined,
      });

      await EmailService.send({
        to: parceiroAtualizado.email,
        subject: template.subject,
        html: template.html,
      });
    } catch (error) {
      console.error('Erro ao enviar e-mail de status do parceiro:', error);
    }
    return {
      id: parceiroAtualizado.id,
      nomeRazaoSocial: parceiroAtualizado.nomeRazaoSocial,
      statusAprovacaoParceiro: parceiroAtualizado.statusAprovacaoParceiro,
    };
  }
}
