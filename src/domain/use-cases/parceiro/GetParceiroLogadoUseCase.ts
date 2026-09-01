import { IParceiroRepository } from '../../repositories/IParceiroRepository';
import { IPontoColetaRepository } from '../../repositories/IPontoColetaRepository';

export class GetParceiroLogadoUseCase {
  constructor(
    private readonly parceiroRepository: IParceiroRepository,
    private readonly pontosRepository: IPontoColetaRepository,
  ) {}

  async execute(id: number) {
    const parceiro = await this.parceiroRepository.findById(id);

    if (!parceiro) {
      throw new Error('Parceiro não encontrado');
    }

    const pontosColeta = await this.pontosRepository.findByParceiroId(id);

    // Remove apenas os campos sensíveis (eles podem ser undefined)
    const {
      senhaHash,
      documento,
     
      aceiteMarketing,
     
      redesSociais,
      ...parceiroSeguro
    } = parceiro;

    return {
      ...parceiroSeguro,
      pontosColeta,
    };
  }
}