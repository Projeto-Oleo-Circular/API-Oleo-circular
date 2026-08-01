import {IPontoColetaRepository} from "../../../domain/repositories/IPontoColetaRepository";
import {PontoColeta} from "../../../domain/entities/PontoColeta";

export class GetPontoColetaUseCase {
  constructor(private readonly pontoColetaRepository: IPontoColetaRepository) {}

  async execute(id: number): Promise<PontoColeta> {
    const pontoColeta = await this.pontoColetaRepository.findById(id);

    if (!pontoColeta) {
      throw new Error('Ponto de coleta não encontrado');
    }

    return pontoColeta;
  }
}