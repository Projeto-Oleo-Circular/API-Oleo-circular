import { IParceiroRepository } from '../../repositories/IParceiroRepository';
import { IPontoColetaRepository } from '../../repositories/IPontoColetaRepository';
import { EmailService } from '../../../infrastructure/services/EmailService';

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

    EmailService.sendParceiroStatus(
      parceiroAtualizado.email,
      parceiroAtualizado.nomeRazaoSocial,
      status,
      status === 'REJEITADO' ? observacao : undefined,
    ).catch((error) => {
      console.error('Erro ao enviar e-mail de status do parceiro:', error);
    });

    return {
      id: parceiroAtualizado.id,
      nomeRazaoSocial: parceiroAtualizado.nomeRazaoSocial,
      statusAprovacaoParceiro: parceiroAtualizado.statusAprovacaoParceiro,
    };
  }
}
