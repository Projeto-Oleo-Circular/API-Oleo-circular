import { IPontoColetaRepository } from '../../repositories/IPontoColetaRepository';

export class ListarTodosPontosUseCase {
  constructor(private readonly pontoColetaRepository: IPontoColetaRepository) {}

  async execute() {
    return this.pontoColetaRepository.findAll();
  }
}
