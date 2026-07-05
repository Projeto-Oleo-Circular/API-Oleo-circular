export interface Parceiro {
  id: string;
  tipoPessoa: string;
  nomeRazaoSocial: string;
  email: string;
  senhaHash: string;
  documento: string;
  telefone: string | null;
  responsavelLegalNome: string | null;
  porte: string | null;
  redesSociais: string[] | null;
  aceiteMarketing: boolean;
  canalAquisicaoId: string | null;
  expectativaGeracao: number | null;
  statusAprovacaoParceiro: string;
  criadoEm: string;
}
