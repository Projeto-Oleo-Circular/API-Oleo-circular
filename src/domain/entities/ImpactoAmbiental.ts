export interface ImpactoAmbiental {
  volumeTotalColetado: number;
  biodieselEstimadoLitros: number;
  energiaBiodieselMj: number;
  dieselEquivalenteLitros: number;
  co2EvitadoKg: number;
  residuoDesviadoKg: number;
}

export interface ImpactoAmbientalGeral extends ImpactoAmbiental {
  totalParceiros: number;
  totalPontos: number;
  totalColetas: number;
}

export interface ImpactoAmbientalParceiro extends ImpactoAmbiental {
  parceiroId: number;
  nome: string | null;
  razaoSocial: string | null;
  totalPontos: number;
  totalColetas: number;
}

export interface ImpactoAmbientalPonto extends ImpactoAmbiental {
  pontoId: number;
  parceiroId: number;
  nomePontoColeta: string;
  cidade: string | null;
  estado: string | null;
  totalColetas: number;
}