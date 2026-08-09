import { SolicitacaoColeta } from '../../domain/entities/SolicitacaoColeta';
import { ISolicitacaoColetaRepository } from '../../domain/repositories/ISolicitacaoColetaRepository';
import { supabase } from '../../shared/config/supabase';

export class SupabaseSolicitacaoRepository implements ISolicitacaoColetaRepository {
  
  async create(data: Omit<SolicitacaoColeta, 'id' | 'dataSolicitacao'>): Promise<SolicitacaoColeta> {
    const { data: result, error } = await supabase
      .from('solicitacoes_coleta')
      .insert({
        ponto_coleta_id: data.pontoColetaId,
        status: data.status || 'AGUARDANDO',
        volume_informado: data.volumeInformado,
        volume_coletado: data.volumeColetado ?? null,
        observacoes: data.observacoes ?? null,
        data_agendamento: data.dataAgendamento ?? null,
        data_conclusao: data.dataConclusao ?? null,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao criar solicitação de coleta: ${error.message}`);
    }
    
    return this.mapToEntity(result);
  }

  async findById(id: number): Promise<SolicitacaoColeta | null> {
    const { data, error } = await supabase
      .from('solicitacoes_coleta')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      throw new Error(`Erro ao buscar solicitação: ${error.message}`);
    }
    
    return data ? this.mapToEntity(data) : null;
  }

  async findByPontoColetaId(pontoColetaId: number): Promise<SolicitacaoColeta[]> {
    const { data, error } = await supabase
      .from('solicitacoes_coleta')
      .select('*')
      .eq('ponto_coleta_id', pontoColetaId)
      .order('data_solicitacao', { ascending: false });

    if (error) {
      throw new Error(`Erro ao buscar solicitações do ponto: ${error.message}`);
    }
    
    return data ? data.map(this.mapToEntity) : [];
  }

  async update(id: number, data: Partial<SolicitacaoColeta>): Promise<SolicitacaoColeta> {
    const updateData: any = {};
    
    // Mapeamento dinâmico para atualização
    if (data.status !== undefined) updateData.status = data.status;
    if (data.volumeColetado !== undefined) updateData.volume_coletado = data.volumeColetado;
    if (data.observacoes !== undefined) updateData.observacoes = data.observacoes;
    if (data.dataAgendamento !== undefined) updateData.data_agendamento = data.dataAgendamento;
    if (data.dataConclusao !== undefined) updateData.data_conclusao = data.dataConclusao;

    const { data: result, error } = await supabase
      .from('solicitacoes_coleta')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao atualizar solicitação: ${error.message}`);
    }
    
    return this.mapToEntity(result);
  }

  async findAll(): Promise<SolicitacaoColeta[]> {
    const { data, error } = await supabase
      .from('solicitacoes_coleta')
      .select('*')
      .order('data_solicitacao', { ascending: false });

    if (error) {
      throw new Error(`Erro ao buscar todas as solicitações: ${error.message}`);
    }
    
    return data ? data.map(this.mapToEntity) : [];
  }

 async findAtivaByPontoColetaId(pontoColetaId: number): Promise<SolicitacaoColeta | null> {
  const statusAtivos = ['AGUARDANDO', 'AGENDADA', 'EM_ROTA', 'EM_ANDAMENTO', 'SOLICITADA'];

  const { data, error } = await supabase
    .from('solicitacoes_coleta')
    .select('*')
    .eq('ponto_coleta_id', pontoColetaId)
    .in('status', statusAtivos) // Procura status em aberto
    .order('data_solicitacao', { ascending: false }) // Pega a mais recente
    .limit(1); // 🔹 Garante no máximo 1 linha no retorno em formato de Array (evita o erro PGRST116)

  if (error) {
    throw new Error(`Erro ao buscar solicitação ativa: ${error.message}`);
  }

  // Se retornou algum registro no Array, mapeia e devolve
  if (data && data.length > 0) {
    return this.mapToEntity(data[0]);
  }

  // Se não encontrou nenhuma ativa, devolve null (permitindo a nova solicitação)
  return null;
}
  // Função auxiliar para padronizar o retorno transformando do padrão do BD para a Entidade
  private mapToEntity(data: any): SolicitacaoColeta {
    return {
      id: data.id,
      pontoColetaId: data.ponto_coleta_id,
      status: data.status,
      volumeInformado: Number(data.volume_informado),
      volumeColetado: data.volume_coletado ? Number(data.volume_coletado) : null,
      observacoes: data.observacoes,
      dataSolicitacao: data.data_solicitacao,
      dataAgendamento: data.data_agendamento,
      dataConclusao: data.data_conclusao,
    };
  }
}