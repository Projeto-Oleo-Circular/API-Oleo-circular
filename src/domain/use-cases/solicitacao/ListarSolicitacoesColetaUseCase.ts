import { ISolicitacaoColetaRepository } from '../../../domain/repositories/ISolicitacaoColetaRepository';
import { IPontoColetaRepository } from '../../repositories/IPontoColetaRepository';

export class ListarSolicitacoesColetaUseCase {
  constructor(
    private readonly solicitacaoRepository: ISolicitacaoColetaRepository,
    private readonly pontoColetaRepository: IPontoColetaRepository,
  ) {}

  async execute(parceiroId: number) {
    const pontos = await this.pontoColetaRepository.findByParceiroId(parceiroId);

    if (!pontos?.length) {
      return [];
    }

    const solicitacoes = await Promise.all(
      pontos.map((ponto) =>
        this.solicitacaoRepository.findByPontoColetaId(ponto.id),
      ),
    );

    return solicitacoes
      .flat()
      .sort((a, b) =>
        new Date(b.dataSolicitacao).getTime() -
        new Date(a.dataSolicitacao).getTime(),
      );
  }
}
