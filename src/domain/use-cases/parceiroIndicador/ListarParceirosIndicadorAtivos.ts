import { ParceiroIndicador } from '../../entities/ParceiroIndicador';
import { IParceiroIndicadorRepository } from '../../repositories/IParceiroIndicadorRepository';

export class ListarParceirosIndicadorAtivos {
  constructor(private readonly parceiroIndicadorRepository: IParceiroIndicadorRepository) {}

  async execute(): Promise<ParceiroIndicador[]> {
    return this.parceiroIndicadorRepository.findAllAtivos();
  }
}