import {
  ImpactoAmbientalGeral,
  ImpactoAmbientalParceiro,
  ImpactoAmbientalPonto,
} from "../entities/ImpactoAmbiental";

export interface IImpactoAmbientalRepository {
  getGeral(): Promise<ImpactoAmbientalGeral>;

  getPorParceiro(
    parceiroId: number
  ): Promise<ImpactoAmbientalParceiro | null>;

  getPorPonto(
    pontoId: number
  ): Promise<ImpactoAmbientalPonto | null>;

  getPontoDoParceiro(
    parceiroId: number,
    pontoId: number
  ): Promise<ImpactoAmbientalPonto | null>;
}