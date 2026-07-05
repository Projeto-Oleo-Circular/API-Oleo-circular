import { Admin } from '../../domain/entities/Admin';
import { IAdminRepository } from '../../domain/repositories/IAdminRepository';
import { supabase } from '../../shared/config/supabase';

interface AdminRow {
  id: string;
  nome: string;
  email: string;
  senha_hash: string;
  licenca: string;
  nivel_acesso: 'master' | 'gerente';
  criado_em: string;
  ultimo_acesso: string | null;
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

  async findById(id: string): Promise<Admin | null> {
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

  private mapToEntity(row: AdminRow): Admin {
    return {
      id: row.id,
      nome: row.nome,
      email: row.email,
      senhaHash: row.senha_hash,
      licenca: row.licenca,
      nivelAcesso: row.nivel_acesso,
      criadoEm: new Date(row.criado_em),
      ultimoAcesso: row.ultimo_acesso ? new Date(row.ultimo_acesso) : null,
    };
  }
}
