// domain/entities/PontoColeta.ts
export interface PontoColeta {
  id: number;
  parceiroId: number;
  nomePontoColeta?: string;
  cep: string;
  logradouro: string;
  numero: string;
  bairro: string;
  cidade: string;
  estado?: string;
  complemento?: string;
  capacidadeBombona: number;
  expectativaGeracao?: number;
  nivelAtualPct?: number;
  statusBombona?: string;
  statusAprovacaoPontoColeta?: string;
}


