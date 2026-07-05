import { IPontoColetaRepository } from '../../repositories/IPontoColetaRepository';
import { CriarPontoColetaDTO, CriarPontoColetaDTOSchema } from '../../../shared/dtos/pontoColeta/CriarPontoColetaDTO';
import { PontoColeta } from '../../entities/PontoColeta';

export class CriarPontoColetaUseCase {
  constructor(private readonly pontoColetaRepository: IPontoColetaRepository) {}

  async execute(input: CriarPontoColetaDTO) {
    const parsed = CriarPontoColetaDTOSchema.safeParse(input);

    if (!parsed.success) {
      throw new Error(parsed.error.issues.map((issue) => issue.message).join(', '));
    }

    const data = parsed.data;

    const pontoColetaParaCriar: Omit<PontoColeta, 'id'> = {
      parceiroId: data.parceiroId,
        nomePontoColeta: data.nomePontoColeta,
        cep: data.cep,
        logradouro: data.logradouro,
        numero: data.numero,
        bairro: data.bairro,
        latitude: data.latitude ?? null,
        longitude: data.longitude ?? null,
        capacidadeBombona: data.capacidadeBombona ?? null,
        nivelAtualPct: data.nivelAtualPct ?? null,
        statusBombona: data.statusBombona,
        statusAprovacaoPontoColeta: data.statusAprovacaoPontoColeta,
    };

    const pontoColetaCriado = await this.pontoColetaRepository.create(pontoColetaParaCriar);

    return pontoColetaCriado;
  }
}