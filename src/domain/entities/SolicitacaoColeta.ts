export interface SolicitacaoColeta {
  id: number;
  pontoColetaId: number;
  status: 'AGUARDANDO' | 'AGENDADA' | 'EM_ROTA' | 'CONCLUIDA';
  volumeInformado: number;
  volumeColetado?: number | null;
  observacoes?: string | null;
  dataSolicitacao: string;
  dataAgendamento?: string | null;
  dataConclusao?: string | null;
}