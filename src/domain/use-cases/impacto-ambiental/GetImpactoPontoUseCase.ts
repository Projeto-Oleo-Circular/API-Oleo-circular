import {
  IImpactoAmbientalRepository
} from "../../repositories/IImpactoAmbientalRepository";

export class GetImpactoPontoUseCase {

  constructor(
    private impactoRepository:
      IImpactoAmbientalRepository
  ) {}

  async execute(pontoId: number) {

    const impacto =
      await this.impactoRepository
        .getPorPonto(pontoId);

    if (!impacto) {
      throw new Error(
        "Ponto de coleta não encontrado"
      );
    }

    return impacto;
  }
}