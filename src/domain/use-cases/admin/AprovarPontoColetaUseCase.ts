import { IPontoColetaRepository } from '../../repositories/IPontoColetaRepository';

export class AprovarPontoColetaUseCase {
  constructor(private readonly pontoColetaRepository: IPontoColetaRepository) {}

  async execute(pontoColetaId: number) {
    const ponto = await this.pontoColetaRepository.findById(pontoColetaId);

    if (!ponto) {
      throw new Error('Ponto de coleta não encontrado');
    }

    const pontoAprovado = await this.pontoColetaRepository.update(pontoColetaId, {
      statusAprovacaoPontoColeta: 'APROVADO',
    });

    return {
      id: pontoAprovado.id,
      parceiroId: pontoAprovado.parceiroId,
      cep: pontoAprovado.cep,
      bairro: pontoAprovado.bairro,
      statusAprovacaoPontoColeta: pontoAprovado.statusAprovacaoPontoColeta,
    };
  }
}
