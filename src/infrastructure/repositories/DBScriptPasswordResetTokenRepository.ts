import { pool } from '../../shared/config/db';
import { IPasswordResetTokenRepository } from '../../domain/repositories/IPasswordResetTokenRepository';
import { PasswordResetToken } from '../../domain/entities/PasswordResetToken';

interface PasswordResetTokenRow {
  id: number;
  email: string;
  token: string;
  expires_at: string;
  used: boolean;
  created_at: string;
}

export class DBScriptPasswordResetTokenRepository
  implements IPasswordResetTokenRepository
{
  async create(
    data: Omit<PasswordResetToken, 'id' | 'createdAt'>
  ): Promise<PasswordResetToken> {
    try {
      const result = await pool.query<PasswordResetTokenRow>(
        `
        INSERT INTO password_reset_tokens (
          email,
          token,
          expires_at,
          used
        )
        VALUES ($1, $2, $3, $4)
        RETURNING *
        `,
        [
          data.email,
          data.token,
          data.expiresAt,
          data.used,
        ]
      );

      return this.mapToEntity(result.rows[0]);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Erro inesperado';

      throw new Error(
        `Erro ao criar token: ${message}`
      );
    }
  }

  async findByToken(
    token: string
  ): Promise<PasswordResetToken | null> {
    try {
      const result = await pool.query<PasswordResetTokenRow>(
        `
        SELECT *
        FROM password_reset_tokens
        WHERE token = $1
        LIMIT 1
        `,
        [token]
      );

      if (result.rows.length === 0) {
        return null;
      }

      return this.mapToEntity(result.rows[0]);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Erro inesperado';

      throw new Error(
        `Erro ao buscar token: ${message}`
      );
    }
  }

  async markAsUsed(id: number): Promise<void> {
    try {
      const result = await pool.query(
        `
        UPDATE password_reset_tokens
        SET used = true
        WHERE id = $1
        `,
        [id]
      );

      if (result.rowCount === 0) {
        throw new Error(
          'Token não encontrado.'
        );
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Erro inesperado';

      throw new Error(
        `Erro ao marcar token como usado: ${message}`
      );
    }
  }

  async deleteByEmail(email: string): Promise<void> {
    try {
      await pool.query(
        `
        DELETE FROM password_reset_tokens
        WHERE email = $1
        `,
        [email]
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Erro inesperado';

      throw new Error(
        `Erro ao deletar tokens: ${message}`
      );
    }
  }

  private mapToEntity(
    data: PasswordResetTokenRow
  ): PasswordResetToken {
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