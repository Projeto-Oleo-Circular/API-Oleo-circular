import { supabaseAdmin } from '../../shared/config/supabase'; 
import { IPasswordResetTokenRepository } from '../../domain/repositories/IPasswordResetTokenRepository';
import { PasswordResetToken } from '../../domain/entities/PasswordResetToken';

export class SupabasePasswordResetTokenRepository implements IPasswordResetTokenRepository {
  async create(data: Omit<PasswordResetToken, 'id' | 'createdAt'>): Promise<PasswordResetToken> {
    const { data: result, error } = await supabaseAdmin 
      .from('password_reset_tokens')
      .insert({
        email: data.email,
        token: data.token,
        expires_at: data.expiresAt,
        used: data.used,
      })
      .select()
      .single();

    if (error) throw new Error(`Erro ao criar token: ${error.message}`);
    return this.mapToEntity(result);
  }

  async findByToken(token: string): Promise<PasswordResetToken | null> {
    const { data, error } = await supabaseAdmin 
      .from('password_reset_tokens')
      .select('*')
      .eq('token', token)
      .maybeSingle();

    if (error) throw new Error(`Erro ao buscar token: ${error.message}`);
    return data ? this.mapToEntity(data) : null;
  }

  async markAsUsed(id: number): Promise<void> {
    const { error } = await supabaseAdmin 
      .from('password_reset_tokens')
      .update({ used: true })
      .eq('id', id);

    if (error) throw new Error(`Erro ao marcar token como usado: ${error.message}`);
  }

  async deleteByEmail(email: string): Promise<void> {
    const { error } = await supabaseAdmin 
      .from('password_reset_tokens')
      .delete()
      .eq('email', email);

    if (error) throw new Error(`Erro ao deletar tokens: ${error.message}`);
  }

  private mapToEntity(data: any): PasswordResetToken {
    return {
      id: data.id,
      email: data.email,
      token: data.token,
      expiresAt: new Date(data.expires_at),
      used: data.used,
      createdAt: new Date(data.created_at),
    };
  }
}