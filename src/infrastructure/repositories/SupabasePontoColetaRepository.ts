// infrastructure/repositories/SupabasePontoColetaRepository.ts
import { getCategoriaPontoColetaLabel, PontoColeta } from '../../domain/entities/PontoColeta';
import { IPontoColetaRepository } from '../../domain/repositories/IPontoColetaRepository';
import { supabase } from '../../shared/config/supabase';

export class SupabasePontoColetaRepository implements IPontoColetaRepository {
  async create(data: Omit<PontoColeta, 'id' | 'criadoEm'>): Promise<PontoColeta> {
    const { data: result, error } = await supabase
      .from('pontos_coleta')
      .insert({
        parceiro_id: data.parceiroId,
        categoria: data.categoria,
        cep: data.cep,
        logradouro: data.logradouro,
        numero: data.numero,
        bairro: data.bairro,
        cidade: data.cidade,
        estado: data.estado,
        complemento: data.complemento,
        expectativa_geracao: data.expectativaGeracao,
        capacidade_bombona: data.capacidadeBombona,
        nivel_atual_pct: data.nivelAtualPct,
        status_bombona: data.statusBombona,
        status_aprovacao_ponto_coleta: data.statusAprovacaoPontoColeta,
        nome_ponto_coleta: data.nomePontoColeta,
        longitude: data.longitude,
        latitude:data.latitude
      })
      .select()
      .single();

    if (error) throw new Error(`Erro ao criar ponto de coleta: ${error.message}`);
    
    return this.mapToEntity(result);
  }

  async findById(id: string | number): Promise<PontoColeta | null> {
    const { data, error } = await supabase
      .from('pontos_coleta')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw new Error(`Erro ao buscar ponto de coleta: ${error.message}`);
    
    return data ? this.mapToEntity(data) : null;
  }

  async findByParceiroId(parceiroId: number): Promise<PontoColeta[]> {
    const { data, error } = await supabase
      .from('pontos_coleta')
      .select('*')
      .eq('parceiro_id', parceiroId)
      .order('criado_em', { ascending: false });

    if (error) throw new Error(`Erro ao buscar pontos de coleta: ${error.message}`);
    
    return data ? data.map(this.mapToEntity) : [];
  }

async update(id: string | number, data: Partial<PontoColeta>): Promise<PontoColeta> {
  const updateData: any = {};

  if (data.categoria !== undefined) updateData.categoria = data.categoria;
  if (data.cep !== undefined) updateData.cep = data.cep;
  if (data.logradouro !== undefined) updateData.logradouro = data.logradouro;
  if (data.numero !== undefined) updateData.numero = data.numero;
  if (data.bairro !== undefined) updateData.bairro = data.bairro;
  if (data.cidade !== undefined) updateData.cidade = data.cidade;
  if (data.estado !== undefined) updateData.estado = data.estado;
  if (data.complemento !== undefined) updateData.complemento = data.complemento;
  if (data.expectativaGeracao !== undefined) updateData.expectativa_geracao = data.expectativaGeracao;
  if (data.capacidadeBombona !== undefined) updateData.capacidade_bombona = data.capacidadeBombona;
  if (data.nivelAtualPct !== undefined) updateData.nivel_atual_pct = data.nivelAtualPct;
  if (data.statusBombona !== undefined) updateData.status_bombona = data.statusBombona;
  if (data.statusAprovacaoPontoColeta !== undefined) updateData.status_aprovacao_ponto_coleta = data.statusAprovacaoPontoColeta;
  if (data.nomePontoColeta !== undefined) updateData.nome_ponto_coleta = data.nomePontoColeta;
  if (data.longitude !== undefined) updateData.logintude=data.longitude;
  if(data.latitude !== undefined) updateData.latitude=data.latitude;


  updateData.updated = new Date().toISOString(); 

  const { data: result, error } = await supabase
    .from('pontos_coleta')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(`Erro ao atualizar ponto de coleta: ${error.message}`);

  return this.mapToEntity(result);
}

  async updateStatusComObservacao(
    id: number, 
    status: 'APROVADO' | 'REJEITADO' | 'PENDENTE', 
    observacao: string | null
  ): Promise<PontoColeta> {
    const { data: result, error } = await supabase
      .from('pontos_coleta')
      .update({
        status_aprovacao_ponto_coleta: status,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Erro ao atualizar status do ponto de coleta: ${error.message}`);
    
    return this.mapToEntity(result);
  }

  async findAll(): Promise<PontoColeta[]> {
    const { data, error } = await supabase
      .from('pontos_coleta')
      .select('*')
      .order('criado_em', { ascending: false });

    if (error) throw new Error(`Erro ao buscar todos os pontos de coleta: ${error.message}`);
    
    return data ? data.map(this.mapToEntity) : [];
  }

  private mapToEntity(data: any): PontoColeta {
    const categoriaNumero = data.categoria;
    const categoriaLabel = getCategoriaPontoColetaLabel(categoriaNumero);

    return {
    id: data.id,
    parceiroId: data.parceiro_id,
    categoria: categoriaLabel ?? categoriaNumero,
    cep: data.cep,
    logradouro: data.logradouro,
    numero: data.numero,
    bairro: data.bairro,
    cidade: data.cidade,
    estado: data.estado,
    complemento: data.complemento,
    expectativaGeracao: data.expectativa_geracao,
    capacidadeBombona: data.capacidade_bombona,
    nivelAtualPct: data.nivel_atual_pct,
    statusBombona: data.status_bombona,
    statusAprovacaoPontoColeta: data.status_aprovacao_ponto_coleta,
    nomePontoColeta: data.nome_ponto_coleta,
    atualizadoEm: data.updated,
    latitude:data.latitude,
    longitude:data.longitude
  };
} }