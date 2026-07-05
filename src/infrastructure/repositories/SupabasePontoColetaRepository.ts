import { PontoColeta } from '../../domain/entities/PontoColeta';
import { IPontoColetaRepository } from '../../domain/repositories/IPontoColetaRepository';
import { supabase } from '../../shared/config/supabase';
import { PontoColetaRow } from '../../shared/types/database';

export class SupabasePontoColetaRepository implements IPontoColetaRepository {
  private readonly tableName = 'pontos_coleta';

  async create(data: Omit<PontoColeta, 'id'>): Promise<PontoColeta> {
    try {
      const payload = this.toRow(data);
      const { data: created, error } = await supabase
        .from(this.tableName)
        .insert(payload)
        .select()
        .single();

      if (error) {
        throw new Error(`Erro ao criar ponto de coleta: ${error.message}`);
      }

      return this.mapToEntity(created as PontoColetaRow);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro inesperado ao criar ponto de coleta';
      throw new Error(message);
    }
  }

  async findById(id: string): Promise<PontoColeta | null> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) {
        throw new Error(`Erro ao buscar ponto de coleta por id: ${error.message}`);
      }

      return data ? this.mapToEntity(data as PontoColetaRow) : null;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro inesperado ao buscar ponto de coleta por id';
      throw new Error(message);
    }
  }

  async findByParceiroId(parceiroId: string): Promise<PontoColeta[]> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('parceiro_id', parceiroId);

      if (error) {
        throw new Error(`Erro ao buscar pontos de coleta por parceiro: ${error.message}`);
      }

      return (data || []).map((item) => this.mapToEntity(item as PontoColetaRow));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro inesperado ao buscar pontos de coleta por parceiro';
      throw new Error(message);
    }
  }

  async update(id: string, data: Partial<PontoColeta>): Promise<PontoColeta> {
    try {
      const payload = this.toRow(data);
      const { data: updated, error } = await supabase
        .from(this.tableName)
        .update(payload)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Erro ao atualizar ponto de coleta: ${error.message}`);
      }

      return this.mapToEntity(updated as PontoColetaRow);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro inesperado ao atualizar ponto de coleta';
      throw new Error(message);
    }
  }

  private mapToEntity(row: PontoColetaRow): PontoColeta {
    return {
      id: row.id,
      parceiroId: row.parceiro_id,
      nomePontoColeta: row.nome_ponto_coleta,
      cep: row.cep,
      logradouro: row.logradouro,
      numero: row.numero,
      bairro: row.bairro,
      latitude: row.latitude,
      longitude: row.longitude,
      capacidadeBombona: row.capacidade_bombona,
      nivelAtualPct: row.nivel_atual_pct,
      statusBombona: row.status_bombona,
      statusAprovacaoPontoColeta: row.status_aprovacao_ponto_coleta,
    };
  }

  private toRow(data: Partial<PontoColeta>): Partial<PontoColetaRow> {
    const result: Partial<PontoColetaRow> = {};

    if (data.parceiroId !== undefined) result.parceiro_id = data.parceiroId;
    if (data.cep !== undefined) result.cep = data.cep;
    if (data.logradouro !== undefined) result.logradouro = data.logradouro;
    if (data.numero !== undefined) result.numero = data.numero;
    if (data.bairro !== undefined) result.bairro = data.bairro;
    if (data.latitude !== undefined) result.latitude = data.latitude;
    if (data.longitude !== undefined) result.longitude = data.longitude;
    if (data.capacidadeBombona !== undefined) result.capacidade_bombona = data.capacidadeBombona;
    if (data.nivelAtualPct !== undefined) result.nivel_atual_pct = data.nivelAtualPct;
    if (data.statusBombona !== undefined) result.status_bombona = data.statusBombona;
    if (data.statusAprovacaoPontoColeta !== undefined) result.status_aprovacao_ponto_coleta = data.statusAprovacaoPontoColeta;

    return result;
  }
}
