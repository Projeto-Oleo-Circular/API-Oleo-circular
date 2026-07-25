// domain/entities/Parceiro.ts
export interface Parceiro {
  id: string;
  tipoPessoa: 'FISICA' | 'JURIDICA';
  nomeRazaoSocial: string;
  nomeSocial?: string | null;
  email: string;
  senhaHash: string;
  documento: string;
  telefone?: string | null;
  responsavelLegalNome?: string | null;
  responsavelLegalCpf?: string | null;
  porte: 'PEQUENO' | 'MEDIO' | 'GRANDE' | null;
  redesSociais?: string[] | null;
  aceiteMarketing: boolean;
  parceiroIndicadorId?: number | null;
  expectativaGeracao?: number | null;
  statusAprovacaoParceiro: 'PENDENTE' | 'APROVADO' | 'REJEITADO';
  criadoEm: string;
}