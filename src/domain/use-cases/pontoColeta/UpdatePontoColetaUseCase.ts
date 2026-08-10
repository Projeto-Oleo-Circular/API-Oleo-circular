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

    const novoStatusPonto = (dataToUpdate as any).statusAprovacaoPontoColeta || (dataToUpdate as any).statusAprovacao;

    if (novoStatusPonto === 'APROVADO') {
      const parceiro = await this.parceiroRepository.findById(input.parceiroId);

      if (!parceiro) {
        throw new Error('Parceiro associado não encontrado.');
      }

      if (parceiro.statusAprovacaoParceiro !== 'APROVADO') {
        throw new Error(
          'Não é possível aprovar este ponto de coleta pois o parceiro responsável ainda não está aprovado.'
        );
      }
    }

    const result = await this.pontoColetaRepository.update(id, dataToUpdate);

    const categoriaLabel = getCategoriaPontoColetaLabel(result.categoria);

    return {
      ...result,
      categoria: categoriaLabel ?? result.categoria,
    };
  }
}