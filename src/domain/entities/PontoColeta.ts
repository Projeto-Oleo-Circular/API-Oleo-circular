export interface PontoColeta {
  id: string;
  parceiroId: string;
  nomePontoColeta: string;
  cep: string;
  logradouro: string;
  numero: string;
  bairro: string;
  latitude: number | null;
  longitude: number | null;
  capacidadeBombona: number | null;
  nivelAtualPct: number | null;
  statusBombona: string;
  statusAprovacaoPontoColeta: string;
}
