import { IParceiroRepository } from '../../repositories/IParceiroRepository';

export class ListarTodosParceirosUseCase {
  constructor(private readonly parceiroRepository: IParceiroRepository) {}

  async execute() {
    return this.parceiroRepository.findAll();
  }
}
