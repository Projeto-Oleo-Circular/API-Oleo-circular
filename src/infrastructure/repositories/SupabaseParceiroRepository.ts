import { Parceiro } from '../../domain/entities/Parceiro';
import { IParceiroRepository } from '../../domain/repositories/IParceiroRepository';
import { supabase } from '../../shared/config/supabase';
import { ParceiroRow } from '../../shared/types/database';

export class SupabaseParceiroRepository implements IParceiroRepository {
  private readonly tableName = 'parceiros';

  async create(data: Omit<Parceiro, 'id' | 'criadoEm'>): Promise<Parceiro> {
    try {
      const payload = this.toRow(data);
      const { data: created, error } = await supabase
        .from(this.tableName)
        .insert(payload)
        .select()
        .single();

      if (error) {
        throw new Error(`Erro ao criar parceiro: ${error.message}`);
      }

      return this.mapToEntity(created as ParceiroRow);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro inesperado ao criar parceiro';
      throw new Error(message);
    }
  }

  async findByEmail(email: string): Promise<Parceiro | null> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('email', email)
        .maybeSingle();

      if (error) {
        throw new Error(`Erro ao buscar parceiro por email: ${error.message}`);
      }

      return data ? this.mapToEntity(data as ParceiroRow) : null;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro inesperado ao buscar parceiro por email';
      throw new Error(message);
    }
  }

  async findById(id: string): Promise<Parceiro | null> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) {
        throw new Error(`Erro ao buscar parceiro por id: ${error.message}`);
      }

      return data ? this.mapToEntity(data as ParceiroRow) : null;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro inesperado ao buscar parceiro por id';
      throw new Error(message);
    }
  }

  async findByDocumento(documento: string): Promise<Parceiro | null> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('documento', documento)
        .maybeSingle();

      if (error) {
        throw new Error(`Erro ao buscar parceiro por documento: ${error.message}`);
      }

      return data ? this.mapToEntity(data as ParceiroRow) : null;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro inesperado ao buscar parceiro por documento';
      throw new Error(message);
    }
  }

  async update(id: string, data: Partial<Parceiro>): Promise<Parceiro> {
    try {
      const payload = this.toRow(data as Partial<Parceiro>);
      const { data: updated, error } = await supabase
        .from(this.tableName)
        .update(payload)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Erro ao atualizar parceiro: ${error.message}`);
      }

      return this.mapToEntity(updated as ParceiroRow);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro inesperado ao atualizar parceiro';
      throw new Error(message);
    }
  }

  async findByStatus(status: string): Promise<Parceiro[]> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('status_aprovacao_parceiro', status);

      if (error) {
        throw new Error(`Erro ao buscar parceiros por status: ${error.message}`);
      }

      return (data || []).map((item) => this.mapToEntity(item as ParceiroRow));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro inesperado ao buscar parceiros por status';
      throw new Error(message);
    }
  }

  private mapToEntity(row: ParceiroRow): Parceiro {
    return {
      id: row.id,
      tipoPessoa: row.tipo_pessoa,
      nomeRazaoSocial: row.nome_razao_social,
      email: row.email,
      senhaHash: row.senha_hash,
      documento: row.documento,
      telefone: row.telefone,
      responsavelLegalNome: row.responsavel_legal_nome,
      porte: row.porte,
      redesSociais: row.redes_sociais,
      aceiteMarketing: row.aceite_marketing,
      canalAquisicaoId: row.canal_aquisicao_id,
      expectativaGeracao: row.expectativa_geracao,
      statusAprovacaoParceiro: row.status_aprovacao_parceiro,
      criadoEm: row.criado_em,
    };
  }

  private toRow(data: Partial<Parceiro>): Partial<ParceiroRow> {
    const result: Partial<ParceiroRow> = {};

    if (data.tipoPessoa !== undefined) result.tipo_pessoa = data.tipoPessoa;
    if (data.nomeRazaoSocial !== undefined) result.nome_razao_social = data.nomeRazaoSocial;
    if (data.email !== undefined) result.email = data.email;
    if (data.senhaHash !== undefined) result.senha_hash = data.senhaHash;
    if (data.documento !== undefined) result.documento = data.documento;
    if (data.telefone !== undefined) result.telefone = data.telefone;
    if (data.responsavelLegalNome !== undefined) result.responsavel_legal_nome = data.responsavelLegalNome;
    if (data.porte !== undefined) result.porte = data.porte;
    if (data.redesSociais !== undefined) result.redes_sociais = data.redesSociais;
    if (data.aceiteMarketing !== undefined) result.aceite_marketing = data.aceiteMarketing;
    if (data.canalAquisicaoId !== undefined) result.canal_aquisicao_id = data.canalAquisicaoId;
    if (data.expectativaGeracao !== undefined) result.expectativa_geracao = data.expectativaGeracao;
    if (data.statusAprovacaoParceiro !== undefined) result.status_aprovacao_parceiro = data.statusAprovacaoParceiro;

    return result;
  }
}
