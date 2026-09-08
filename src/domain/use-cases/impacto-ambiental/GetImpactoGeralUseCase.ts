import {
  IImpactoAmbientalRepository
} from "../../repositories/IImpactoAmbientalRepository";

export class GetImpactoGeralUseCase {

  constructor(
    private impactoRepository:
      IImpactoAmbientalRepository
  ) {}

  async execute() {
    return this.impactoRepository.getGeral();
  }
}