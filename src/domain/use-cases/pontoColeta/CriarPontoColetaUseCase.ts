import { IPontoColetaRepository } from '../../repositories/IPontoColetaRepository';
import { IParceiroRepository } from '../../repositories/IParceiroRepository';
import {
  CriarPontoColetaDTO,
  CriarPontoColetaDTOSchema,
} from '../../../shared/dtos/pontoColeta/CriarPontoColetaDTO';
import { PontoColeta } from '../../entities/PontoColeta';

export class CriarPontoColetaUseCase {
  constructor(
    private readonly pontoColetaRepository: IPontoColetaRepository,
  ) {}

  async execute(input: CriarPontoColetaDTO) {
    const parsed = CriarPontoColetaDTOSchema.safeParse(input);

    if (!parsed.success) {
      throw new Error(
        parsed.error.issues.map((issue) => issue.message).join(', ')
      );
    }

    const data = parsed.data;

    const pontoColetaParaCriar: Omit<PontoColeta, 'id'> = {
      parceiroId: data.parceiroId,
      nomePontoColeta: data.nomePontoColeta,
      cep: data.cep,
      logradouro: data.logradouro,
      numero: data.numero,
      bairro: data.bairro,
      cidade: data.cidade,
      estado: data.estado,
      latitude: data.latitude,
      longitude: data.longitude,
      capacidadeBombona: data.capacidadeBombona,
      nivelAtualPct: data.nivelAtualPct,
      statusBombona: data.statusBombona,
      statusAprovacaoPontoColeta: 'PENDENTE',
      criadoEm: new Date().toISOString(),
    };

    return await this.pontoColetaRepository.create(pontoColetaParaCriar);
  }
}