import {
  IImpactoAmbientalRepository
} from "../../repositories/IImpactoAmbientalRepository";

export class GetImpactoPontoParceiroUseCase {

  constructor(
    private impactoRepository:
      IImpactoAmbientalRepository
  ) {}

  async execute(
    parceiroId: number,
    pontoId: number
  ) {

    const impacto =
      await this.impactoRepository
        .getPontoDoParceiro(
          parceiroId,
          pontoId
        );

    if (!impacto) {
      throw new Error(
        "Ponto de coleta não encontrado"
      );
    }

    return impacto;
  }
}
