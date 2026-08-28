export interface AdminRow {
  id: string;
  nome: string;
  email: string;
  senha_hash: string;
  nivel_acesso: string;
  criado_em: string;
  ultimo_acesso: string | null;
}

export interface ParceiroRow {
  id: string;
  tipo_pessoa: string;
  nome_razao_social: string;
  nome_social: string | null;
  email: string;
  senha_hash: string;
  documento: string;
  telefone: string | null;
  responsavel_legal_nome: string | null;
  responsavel_legal_cpf: string | null;
  porte: string | null;
  redes_sociais: string[] | null;
  aceite_marketing: boolean;
  canal_aquisicao_id: string | null;
  expectativa_geracao: number | null;
  status_aprovacao_parceiro: string;
//   observacoes: string | null;
  criado_em: string;
}

export interface PontoColetaRow {
  id: string;
  parceiro_id: string;
  nome_ponto_coleta: string;
  categoria: number | null;
  cep: string;
  logradouro: string;
  numero: string;
  bairro: string;
  latitude: string;
  longitude: string;
  capacidade_bombona: number | null;
  nivel_atual_pct: number | null;
  status_bombona: string;
  status_aprovacao_ponto_coleta: string;
//   observacoes: string | null;
}

export interface SolicitacaoColetaRow {
  id: string;
  ponto_coleta_id: string;
  status: string;
  volume_informado: number | null;
  volume_coletado: number | null;
  observacoes: string | null;
  data_solicitacao: string;
  data_agendamento: string | null;
  data_conclusao: string | null;
}

export interface CanalAquisicaoRow {
  id: string;
  nome: string;
}
