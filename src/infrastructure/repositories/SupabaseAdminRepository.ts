import { Admin } from '../../domain/entities/Admin';
import { IAdminRepository } from '../../domain/repositories/IAdminRepository';
import { supabase } from '../../shared/config/supabase';

interface AdminRow {
  id: number;
  nome: string;
  email: string;
  senha_hash: string;
  nivel_acesso: 'admin';
  criado_em: string;
  ultimo_acesso: string | null;
  updated: string;
}

export class SupabaseAdminRepository implements IAdminRepository {
  private readonly tableName = 'admins';

  async findByEmail(email: string): Promise<Admin | null> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('email', email)
        .maybeSingle();

      if (error) {
        throw new Error(`Erro ao buscar administrador por email: ${error.message}`);
      }

      return data ? this.mapToEntity(data as AdminRow) : null;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro inesperado ao buscar administrador';
      throw new Error(message);
    }
  }

  async findById(id: number): Promise<Admin | null> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) {
        throw new Error(`Erro ao buscar administrador por id: ${error.message}`);
      }

      return data ? this.mapToEntity(data as AdminRow) : null;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro inesperado ao buscar administrador por id';
      throw new Error(message);
    }
  }
async create(adminData: Omit<Admin, 'id' | 'criadoEm' | 'ultimoAcesso'>): Promise<Admin> {
  const { data, error } = await supabase
    .from(this.tableName)
    .insert({
      nome: adminData.nome,
      email: adminData.email,
      senha_hash: adminData.senhaHash, 
      nivel_acesso: adminData.nivelAcesso,
    })
    .select('*')
    .single();

  if (error) throw new Error(`Erro ao criar admin: ${error.message}`);
  return this.mapToEntity(data);
}
  private mapToEntity(row: AdminRow): Admin {
    return {
      id: row.id,
      nome: row.nome,
      email: row.email,
      senhaHash: row.senha_hash,
      nivelAcesso: row.nivel_acesso,
      criadoEm: new Date(row.criado_em),
      ultimoAcesso: row.ultimo_acesso ? new Date(row.ultimo_acesso) : null,
      atulizadoEm: new Date(row.updated),
    };
  }
  async update(id: number, data: Partial<Omit<Admin, 'id' | 'criadoEm' | 'ultimoAcesso'>>): Promise<Admin> {
    try {
      const updateData: any = {};

      if (data.nome !== undefined) updateData.nome = data.nome;
      if (data.email !== undefined) updateData.email = data.email;
      if (data.senhaHash !== undefined) updateData.senha_hash = data.senhaHash;
      if (data.nivelAcesso !== undefined) updateData.nivel_acesso = data.nivelAcesso;

      // Atualiza o campo updated com o timestamp atual
      updateData.updated = new Date().toISOString();

      const { data: result, error } = await supabase
        .from(this.tableName)
        .update(updateData)
        .eq('id', id)
        .select('*')
        .single();

      if (error) throw new Error(`Erro ao atualizar administrador: ${error.message}`);
      return this.mapToEntity(result as AdminRow);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro inesperado ao atualizar administrador';
      throw new Error(message);
    }
  }

  async delete(id: number): Promise<void> {
    try {
      const { error } = await supabase
        .from(this.tableName)
        .delete()
        .eq('id', id);

      if (error) throw new Error(`Erro ao excluir administrador: ${error.message}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro inesperado ao excluir administrador';
      throw new Error(message);
    }
  }

  // ==================== Métodos específicos ====================

  async updateUltimoAcesso(id: number): Promise<void> {
    try {
      const { error } = await supabase
        .from(this.tableName)
        .update({ ultimo_acesso: new Date().toISOString() })
        .eq('id', id);

      if (error) throw new Error(`Erro ao atualizar último acesso: ${error.message}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro inesperado ao atualizar último acesso';
      throw new Error(message);
    }
  }

  async updateSenha(id: number, novaSenhaHash: string): Promise<void> {
    try {
      const { error } = await supabase
        .from(this.tableName)
        .update({ senha_hash: novaSenhaHash, updated: new Date().toISOString() })
        .eq('id', id);

      if (error) throw new Error(`Erro ao atualizar senha: ${error.message}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro inesperado ao atualizar senha';
      throw new Error(message);
    }
  }

}
