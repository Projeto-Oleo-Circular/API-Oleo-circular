export interface ParceiroIndicador {
  id: number;
  nome: string;
  nomeResposavel: string | null;
  tipo: 'ASSOCIACAO' | 'COOPERATIVA' | 'ONG';
  cnpj: string;
  email: string | null;
  telefone: string | null;
  site: string | null;
  ativo: boolean | null;
  municipio: string| null;
  criadoEm: Date;
}