// application/use-cases/DeletePontoColetaUseCase.ts
import { IPontoColetaRepository } from '../../../domain/repositories/IPontoColetaRepository';

export class DeletePontoColetaUseCase {
  constructor(private pontoColetaRepository: IPontoColetaRepository) {}

  async execute(parceiroId: number, pontoColetaId: number): Promise<void> {
    // 1. Buscar o ponto de coleta pelo ID
    const ponto = await this.pontoColetaRepository.findById(pontoColetaId);
    if (!ponto) {
      throw new Error('Ponto de coleta não encontrado.');
    }

    // 2. Verificar se o ponto pertence ao parceiro
    if (ponto.parceiroId !== parceiroId) {
      throw new Error('Você não tem permissão para excluir este ponto de coleta.');
    }

    // 3. Deletar o ponto
    await this.pontoColetaRepository.delete(pontoColetaId);
  }
}