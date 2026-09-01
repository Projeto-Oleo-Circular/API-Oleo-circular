import { IPontoColetaRepository } from '../../repositories/IPontoColetaRepository';
import { IParceiroRepository } from '../../../domain/repositories/IParceiroRepository';
import {
  AtualizarPontoColetaDTO,
  AtualizarPontoColetaDTOSchema,
} from '../../../shared/dtos/pontoColeta/AtualizarPontoColetaDTO';
import { getCategoriaPontoColetaLabel } from '../../entities/PontoColeta';

export class AtualizarPontoColetaUseCase {
  constructor(
    private readonly pontoColetaRepository: IPontoColetaRepository,
    private readonly parceiroRepository: IParceiroRepository,
  ) {}

  async execute(input: AtualizarPontoColetaDTO & { parceiroId?: number }) {
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

    if (input.parceiroId && pontoExistente.parceiroId !== input.parceiroId) {
      throw new Error('Você não tem permissão para alterar este ponto de coleta.');
    }

    const novoStatusPonto =
      (dataToUpdate as any).statusAprovacaoPontoColeta ||
      (dataToUpdate as any).statusAprovacaoPonto ||
      (dataToUpdate as any).statusAprovacao ||
      (dataToUpdate as any).status;

    if (novoStatusPonto === 'APROVADO') {
      const parceiroDono = await this.parceiroRepository.findById(pontoExistente.parceiroId);

      if (!parceiroDono) {
        throw new Error('Parceiro associado a este ponto não foi encontrado.');
      }

      if (parceiroDono.statusAprovacaoParceiro !== 'APROVADO') {
        throw new Error(
          'Não é possível aprovar este ponto de coleta pois o parceiro responsável encontra-se pendente ou rejeitado.'
        );
      }
    }

    const result = await this.pontoColetaRepository.update(id, {
      ...dataToUpdate,
      latitude: dataToUpdate.latitude !== undefined && dataToUpdate.latitude !== null ? String(dataToUpdate.latitude) : undefined,
      longitude: dataToUpdate.longitude !== undefined && dataToUpdate.longitude !== null ? String(dataToUpdate.longitude) : undefined,
    } as any);

    const categoriaLabel = getCategoriaPontoColetaLabel(result.categoria);

    return {
      ...result,
      categoria: categoriaLabel ?? result.categoria,
    };
  }
}