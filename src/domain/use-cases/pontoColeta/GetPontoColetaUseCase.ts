import {IPontoColetaRepository} from "../../../domain/repositories/IPontoColetaRepository";
import {getCategoriaPontoColetaLabel, PontoColeta} from "../../../domain/entities/PontoColeta";

export class GetPontoColetaUseCase {
  constructor(private readonly pontoColetaRepository: IPontoColetaRepository) {}

  async execute(id: number): Promise<PontoColeta> {
    const pontoColeta = await this.pontoColetaRepository.findById(id);

    if (!pontoColeta) {
      throw new Error('Ponto de coleta não encontrado');
    }

    const categoriaLabel = getCategoriaPontoColetaLabel(pontoColeta.categoria);

    return {
      ...pontoColeta,
      categoria: categoriaLabel ?? pontoColeta.categoria,
      categoriaNumero: pontoColeta.categoria,
    } as PontoColeta & { categoriaNumero: number };
  }
}