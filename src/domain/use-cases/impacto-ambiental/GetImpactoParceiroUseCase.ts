import {
  IImpactoAmbientalRepository
} from "../../repositories/IImpactoAmbientalRepository";

export class GetImpactoParceiroUseCase {

  constructor(
    private impactoRepository:
      IImpactoAmbientalRepository
  ) {}

  async execute(parceiroId: number) {

    const impacto =
      await this.impactoRepository
        .getPorParceiro(parceiroId);

    if (!impacto) {
      throw new Error(
        "Parceiro não encontrado"
      );
    }

    return impacto;
  }
}