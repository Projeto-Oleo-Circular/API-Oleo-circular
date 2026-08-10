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

    // 1. Busca o ponto existente no banco
    const pontoExistente = await this.pontoColetaRepository.findById(id);

    if (!pontoExistente) {
      throw new Error('Ponto de coleta não encontrado.');
    }

    // 2. Validação de permissão (caso a requisição venha de um parceiro normal)
    if (input.parceiroId && pontoExistente.parceiroId !== input.parceiroId) {
      throw new Error('Você não tem permissão para alterar este ponto de coleta.');
    }

    // 3. Captura qualquer variação de propriedade do status enviada no payload
    const novoStatusPonto =
      (dataToUpdate as any).statusAprovacaoPontoColeta ||
      (dataToUpdate as any).statusAprovacaoPonto ||
      (dataToUpdate as any).statusAprovacao ||
      (dataToUpdate as any).status;

    // 🟢 REGRA DE NEGÓCIO: Se o novo status for APROVADO (ou se o ponto já for mantido como APROVADO)
    if (novoStatusPonto === 'APROVADO') {
      // Busca SEMPRE o parceiro dono do ponto (pontoExistente.parceiroId)
      const parceiroDono = await this.parceiroRepository.findById(pontoExistente.parceiroId);

      if (!parceiroDono) {
        throw new Error('Parceiro associado a este ponto não foi encontrado.');
      }

      // Garante que o status do parceiro seja rigorosamente 'APROVADO'
      if (parceiroDono.statusAprovacaoParceiro !== 'APROVADO') {
        throw new Error(
          'Não é possível aprovar este ponto de coleta pois o parceiro responsável encontra-se pendente ou rejeitado.'
        );
      }
    }

    // 4. Se a validação passou, executa a atualização
    const result = await this.pontoColetaRepository.update(id, dataToUpdate);

    const categoriaLabel = getCategoriaPontoColetaLabel(result.categoria);

    return {
      ...result,
      categoria: categoriaLabel ?? result.categoria,
    };
  }
}