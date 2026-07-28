export interface ParceiroIndicador {
  id: number;
  nome: string;
  tipo: 'ASSOCIACAO' | 'COOPERATIVA' | 'ONG';
  cnpj: string;
  email: string | null;
  telefone: string | null;
  site: string | null;
  ativo: boolean;
  criadoEm: Date;
}