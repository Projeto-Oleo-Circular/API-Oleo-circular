import { IPontoColetaRepository } from '../../repositories/IPontoColetaRepository';
import {
  AtualizarPontoColetaDTO,
  AtualizarPontoColetaDTOSchema,
} from '../../../shared/dtos/pontoColeta/AtualizarPontoColetaDTO';
import { getCategoriaPontoColetaLabel } from '../../entities/PontoColeta';

export class AtualizarPontoColetaUseCase {
  constructor(
    private readonly pontoColetaRepository: IPontoColetaRepository,
  ) {}

  async execute(input: AtualizarPontoColetaDTO & { parceiroId: number }) {
    const parsed = AtualizarPontoColetaDTOSchema.safeParse(input);

    if (!parsed.success) {
      throw new Error(
        parsed.error.issues.map((issue) => issue.message).join(', ')
      );
    }

    const { id, ...dataToUpdate } = parsed.data;

    const pontoExistente = await this.pontoColetaRepository.findById(id);

    if (!pontoExistente) {
      throw new Error('Ponto de coleta não encontrado.');
    }

    if (pontoExistente.parceiroId !== input.parceiroId) {
      throw new Error('Você não tem permissão para alterar este ponto de coleta.');
    }

    const result = await this.pontoColetaRepository.update(id, dataToUpdate);

    const categoriaLabel = getCategoriaPontoColetaLabel(result.categoria);

    return {
      ...result,
      categoria: categoriaLabel ?? result.categoria,
    };
  }
}