export interface Parceiro {
  id: string;
  email: string;
  senhaHash: string;
  documento: string;
  nomeRazaoSocial: string; 
  nomeSocial?: string | null; 
  telefone?: string | null;
  redesSociais?: string[] | null;
  aceiteMarketing: boolean;
  parceiroIndicadorId?: number;
  expectativaGeracao?: number | null;
  tipoParceiro: 'INSTITUCIONAL' | 'COMUNITARIO' | 'SOLIDARIO';
  statusAprovacaoParceiro: 'PENDENTE' | 'APROVADO' | 'REJEITADO';
  tipoPorte?: 'PEQUENO' | 'MEDIO' | 'GRANDE';
  criadoEm: string;
}

export interface ParceiroFisica extends Parceiro {
  tipoPessoa: 'FISICA';
}

export interface ParceiroJuridica extends Parceiro {
  tipoPessoa: 'JURIDICA';
  responsavelLegalNome: string;
  responsavelLegalCpf: string;
}