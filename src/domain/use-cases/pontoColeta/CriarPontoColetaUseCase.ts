// domain/use-cases/ponto-coleta/CriarPontoColetaUseCase.ts

import { IPontoColetaRepository } from '../../repositories/IPontoColetaRepository';
import {
  CriarPontoColetaDTO,
  CriarPontoColetaDTOSchema,
} from '../../../shared/dtos/pontoColeta/CriarPontoColetaDTO';
import { getCategoriaPontoColetaLabel, PontoColeta } from '../../entities/PontoColeta';

export class CriarPontoColetaUseCase {
  constructor(
    private readonly pontoColetaRepository: IPontoColetaRepository,
  ) {}

  async execute(input: CriarPontoColetaDTO) {
    // 1. Validação do DTO usando Zod
    const parsed = CriarPontoColetaDTOSchema.safeParse(input);

    if (!parsed.success) {
      throw new Error(
        parsed.error.issues.map((issue) => issue.message).join(', ')
      );
    }

    const data = parsed.data;

    // 2. Montagem do objeto omitindo 'id' e 'criadoEm', pois o DB cuida disso
    const pontoColetaParaCriar: Omit<PontoColeta, 'id' | 'criadoEm'> = {
      parceiroId: data.parceiroId,
      nomePontoColeta: data.nomePontoColeta ?? `Ponto Secundário`,
      categoria: data.categoria,
      cep: data.cep,
      logradouro: data.logradouro,
      numero: data.numero,
      bairro: data.bairro,
      cidade: data.cidade,
      estado: data.estado,
      complemento: data.complemento,
      capacidadeBombona: data.capacidadeBombona,
      expectativaGeracao: data.expectativaGeracao,
      nivelAtualPct: data.nivelAtualPct ?? 0,
      statusBombona: data.statusBombona ?? 'VAZIA',
      statusAprovacaoPontoColeta: 'PENDENTE',
      longitude: String(data.longitude),
      latitude:String(data.latitude)
    };

    // 3. Persistência
    const result = await this.pontoColetaRepository.create(pontoColetaParaCriar);
    const categoriaLabel = getCategoriaPontoColetaLabel(result.categoria);

    return {
      ...result,
      categoria: categoriaLabel ?? result.categoria,
    };
  }
}