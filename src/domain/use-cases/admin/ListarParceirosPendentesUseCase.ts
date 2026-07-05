import { IParceiroRepository } from '../../repositories/IParceiroRepository';

export class ListarParceirosPendentesUseCase {
  constructor(private readonly parceiroRepository: IParceiroRepository) {}

  async execute() {
    return this.parceiroRepository.findByStatus('PENDENTE');
  }
}
