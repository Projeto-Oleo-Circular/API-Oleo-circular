// domain/entities/PontoColeta.ts
export interface PontoColeta {
  id: string;
  parceiroId: string;
  cep: string;
  logradouro: string;
  numero: string;
  bairro: string;
  cidade: string;
  estado?: string | null;
  complemento?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  capacidadeBombona: number;
  nivelAtualPct: number;
  statusBombona: 'VAZIA' | 'PARCIAL' | 'CHEIA' | 'EM_COLETA';
  statusAprovacaoPontoColeta: 'PENDENTE' | 'APROVADO' | 'REJEITADO';
  nomePontoColeta?: string | null;
  criadoEm: string;
}