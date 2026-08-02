import { IPontoColetaRepository } from '../../repositories/IPontoColetaRepository';
import { IParceiroRepository } from '../../repositories/IParceiroRepository';
import { EmailService } from '../../../infrastructure/services/Email/EmailService';
import { renderParceiroStatusEmail } from '../../../infrastructure/services/Email/templates/parceiroUserTemplateEmail/parceiro.template';

export class AtualizarStatusPontoColetaUseCase {
  constructor(
    private readonly pontoColetaRepository: IPontoColetaRepository,
    private readonly parceiroRepository: IParceiroRepository,
  ) {}

  async execute(
    pontoColetaId: number,
    status: 'APROVADO' | 'REJEITADO' | 'PENDENTE',
    observacao?: string,
  ) {
    const ponto = await this.pontoColetaRepository.findById(pontoColetaId);

    if (!ponto) {
      throw new Error('Ponto de coleta não encontrado');
    }

    const pontoAtualizado =
      await this.pontoColetaRepository.updateStatusComObservacao(
        pontoColetaId,
        status,
        observacao ?? null,
      );

    const parceiro = await this.parceiroRepository.findById(
      pontoAtualizado.parceiroId,
    );

    if (parceiro) {
      try {
        const endereco = `${pontoAtualizado.logradouro}, ${pontoAtualizado.bairro}`;
        
        // Se você já tiver um template para ponto de coleta, utilize-o:
        const template = renderParceiroStatusEmail({
          nome: parceiro.nomeRazaoSocial,
          status,
          observacao: status === 'REJEITADO' ? observacao : undefined,
        });

        await EmailService.send({
          to: parceiro.email,
          subject: template.subject,
          html: template.html,
        });
      } catch (error) {
        console.error('Erro ao enviar e-mail de status de ponto:', error);
      }
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