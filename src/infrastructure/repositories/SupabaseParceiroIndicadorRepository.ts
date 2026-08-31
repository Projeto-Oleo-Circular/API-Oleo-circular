import { ParceiroIndicador } from '../../domain/entities/ParceiroIndicador';
import { supabase } from '../../shared/config/supabase';

interface ParceiroIndicadorRow {
  id: number;
  nome: string;
  tipo: 'ASSOCIACAO' | 'COOPERATIVA' | 'ONG';
  cnpj: string;
  email: string | null;
  telefone: string | null;
  site: string | null;
  ativo: boolean;
  criado_em: string;
}

export interface IParceiroIndicadorRepository {
  findById(id: number): Promise<ParceiroIndicador | null>;
  findAllAtivos(): Promise<ParceiroIndicador[]>;
  findAll(): Promise<ParceiroIndicador[]>;
  create(data: Omit<ParceiroIndicador, 'id' | 'criadoEm'>): Promise<ParceiroIndicador>;
  update(id: number, data: Partial<ParceiroIndicador>): Promise<ParceiroIndicador>;
  delete(id: number): Promise<void>;
}

export class SupabaseParceiroIndicadorRepository implements IParceiroIndicadorRepository {
  private readonly table = 'parceiros_indicadores';

  private mapToEntity(row: ParceiroIndicadorRow): ParceiroIndicador {
    return {
      id: row.id,
      nome: row.nome,
      tipo: row.tipo,
      cnpj: row.cnpj,
      email: row.email,
      telefone: row.telefone,
      site: row.site,
      ativo: row.ativo,
      criadoEm: new Date(row.criado_em),
    };
  }

  async findById(id: number): Promise<ParceiroIndicador | null> {
    const { data, error } = await supabase
      .from(this.table)
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      throw new Error(`Erro ao buscar indicador por ID: ${error.message}`);
    }

    return data ? this.mapToEntity(data as ParceiroIndicadorRow) : null;
  }

  async findAllAtivos(): Promise<ParceiroIndicador[]> {
    const { data, error } = await supabase
      .from(this.table)
      .select('*')
      .eq('ativo', true)
      .order('nome', { ascending: true });

    if (error) {
      throw new Error(`Erro ao buscar indicadores ativos: ${error.message}`);
    }

    const rows = (data ?? []) as ParceiroIndicadorRow[];
    return rows.map((row) => this.mapToEntity(row));
  }

  async findAll(): Promise<ParceiroIndicador[]> {
    const { data, error } = await supabase
      .from(this.table)
      .select('*')
      .order('nome', { ascending: true });

    if (error) {
      throw new Error(`Erro ao buscar todos os indicadores: ${error.message}`);
    }

    const rows = (data ?? []) as ParceiroIndicadorRow[];
    return rows.map((row) => this.mapToEntity(row));
  }

  async create(data: Omit<ParceiroIndicador, 'id' | 'criadoEm'>): Promise<ParceiroIndicador> {
    const { data: inserted, error } = await supabase
      .from(this.table)
      .insert({
        nome: data.nome,
        tipo: data.tipo,
        cnpj: data.cnpj,
        email: data.email,
        telefone: data.telefone,
        site: data.site,
        ativo: data.ativo,
      })
      .select('*')
      .single();

    if (error) {
      throw new Error(`Erro ao criar indicador: ${error.message}`);
    }

    return this.mapToEntity(inserted as ParceiroIndicadorRow);
  }

  async update(id: number, data: Partial<ParceiroIndicador>): Promise<ParceiroIndicador> {
    const updateData: any = {};
    if (data.nome !== undefined) updateData.nome = data.nome;
    if (data.tipo !== undefined) updateData.tipo = data.tipo;
    if (data.cnpj !== undefined) updateData.cnpj = data.cnpj;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.telefone !== undefined) updateData.telefone = data.telefone;
    if (data.site !== undefined) updateData.site = data.site;
    if (data.ativo !== undefined) updateData.ativo = data.ativo;

    const { data: updated, error } = await supabase
      .from(this.table)
      .update(updateData)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      throw new Error(`Erro ao atualizar indicador: ${error.message}`);
    }

    return this.mapToEntity(updated as ParceiroIndicadorRow);
  }

  async delete(id: number): Promise<void> {
    const { error } = await supabase
      .from(this.table)
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Erro ao excluir indicador: ${error.message}`);
    }
  }
}