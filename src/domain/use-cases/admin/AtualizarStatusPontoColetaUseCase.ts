import { IPontoColetaRepository } from '../../repositories/IPontoColetaRepository';
import { IParceiroRepository } from '../../repositories/IParceiroRepository';
import { EmailService } from '../../../infrastructure/services/Email/EmailService';

export class AtualizarStatusPontoColetaUseCase {
  constructor(
    private readonly pontoColetaRepository: IPontoColetaRepository,
    private readonly parceiroRepository: IParceiroRepository,
  ) {}

  async execute(pontoColetaId: string, status: 'APROVADO' | 'REJEITADO' | 'PENDENTE', observacao?: string) {
    const ponto = await this.pontoColetaRepository.findById(pontoColetaId);

    if (!ponto) {
      throw new Error('Ponto de coleta não encontrado');
    }

    const pontoAtualizado = await this.pontoColetaRepository.updateStatusComObservacao(pontoColetaId, status, observacao ?? null);
    const parceiro = await this.parceiroRepository.findById(pontoAtualizado.parceiroId);

    if (parceiro) {
      const endereco = `${pontoAtualizado.logradouro}, ${pontoAtualizado.bairro}`;
      EmailService.sendPontoStatus(
        parceiro.email,
        parceiro.nomeRazaoSocial,
        endereco,
        status,
        status === 'REJEITADO' ? observacao : undefined,
      ).catch((error) => {
        console.error('Erro ao enviar e-mail de status de ponto:', error);
      });
    }

    return {
      id: pontoAtualizado.id,
      parceiroId: pontoAtualizado.parceiroId,
      cep: pontoAtualizado.cep,
      bairro: pontoAtualizado.bairro,
      statusAprovacaoPontoColeta: pontoAtualizado.statusAprovacaoPontoColeta,
    };
  }
}
