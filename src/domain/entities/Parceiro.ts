export interface Parceiro {
  id: number;
  email: string;
  senhaHash: string;
  documento: string;
  razaoSocial: string; 
  nome: string; 
  telefone?: string | null;
  redesSociais?: string[] | null;
  aceiteMarketing: boolean;
  parceiroIndicadorId?: number;
  expectativaGeracao?: number | null;
  tipoParceiro: 'INSTITUCIONAL' | 'COMUNITARIO' | 'SOLIDARIO';
  statusAprovacaoParceiro: 'PENDENTE' | 'APROVADO' | 'REJEITADO';
  tipoPorte?: 'PEQUENO' | 'MEDIO' | 'GRANDE';
  criadoEm: string;
  tipoPessoa: null;
  responsavelLegal: string

}

