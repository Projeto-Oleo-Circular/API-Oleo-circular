import { Admin } from '../../domain/entities/Admin';
import { IAdminRepository } from '../../domain/repositories/IAdminRepository';
import { pool } from '../../shared/config/db';

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

export class DBScriptAdminRepository implements IAdminRepository {
  private readonly tableName = 'admins';

  async findByEmail(email: string): Promise<Admin | null> {
    try {
      const result = await pool.query<AdminRow>(
        `
        SELECT *
        FROM ${this.tableName}
        WHERE email = $1
        LIMIT 1
        `,
        [email]
      );

      if (result.rows.length === 0) {
        return null;
      }

      return this.mapToEntity(result.rows[0]);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Erro inesperado ao buscar administrador';

      throw new Error(
        `Erro ao buscar administrador por email: ${message}`
      );
    }
  }

  async findById(id: number): Promise<Admin | null> {
    try {
      const result = await pool.query<AdminRow>(
        `
        SELECT *
        FROM ${this.tableName}
        WHERE id = $1
        LIMIT 1
        `,
        [id]
      );

      if (result.rows.length === 0) {
        return null;
      }

      return this.mapToEntity(result.rows[0]);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Erro inesperado ao buscar administrador';

      throw new Error(
        `Erro ao buscar administrador por id: ${message}`
      );
    }
  }

  async create(
    adminData: Omit<Admin, 'id' | 'criadoEm' | 'ultimoAcesso'>
  ): Promise<Admin> {
    try {
      const result = await pool.query<AdminRow>(
        `
        INSERT INTO ${this.tableName} (
          nome,
          email,
          senha_hash,
          nivel_acesso
        )
        VALUES ($1, $2, $3, $4)
        RETURNING *
        `,
        [
          adminData.nome,
          adminData.email,
          adminData.senhaHash,
          adminData.nivelAcesso,
        ]
      );

      return this.mapToEntity(result.rows[0]);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Erro inesperado ao criar administrador';

      throw new Error(`Erro ao criar administrador: ${message}`);
    }
  }

  async update(
    id: number,
    data: Partial<Admin>
  ): Promise<Admin> {
    try {
      const fields: string[] = [];
      const values: unknown[] = [];

      let parameterIndex = 1;

      if (data.nome !== undefined) {
        fields.push(`nome = $${parameterIndex++}`);
        values.push(data.nome);
      }

      if (data.email !== undefined) {
        fields.push(`email = $${parameterIndex++}`);
        values.push(data.email);
      }

      if (data.senhaHash !== undefined) {
        fields.push(`senha_hash = $${parameterIndex++}`);
        values.push(data.senhaHash);
      }

      if (data.nivelAcesso !== undefined) {
        fields.push(`nivel_acesso = $${parameterIndex++}`);
        values.push(data.nivelAcesso);
      }

      fields.push(`updated = $${parameterIndex++}`);
      values.push(new Date());

      values.push(id);

      const result = await pool.query<AdminRow>(
        `
        UPDATE ${this.tableName}
        SET ${fields.join(', ')}
        WHERE id = $${parameterIndex}
        RETURNING *
        `,
        values
      );

      if (result.rows.length === 0) {
        throw new Error('Administrador não encontrado');
      }

      return this.mapToEntity(result.rows[0]);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Erro inesperado ao atualizar administrador';

      throw new Error(
        `Erro ao atualizar administrador: ${message}`
      );
    }
  }

  async delete(id: number): Promise<void> {
    try {
      const result = await pool.query(
        `
        DELETE FROM ${this.tableName}
        WHERE id = $1
        `,
        [id]
      );

      if (result.rowCount === 0) {
        throw new Error('Administrador não encontrado');
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Erro inesperado ao excluir administrador';

      throw new Error(
        `Erro ao excluir administrador: ${message}`
      );
    }
  }

  async updateUltimoAcesso(id: number): Promise<void> {
    try {
      const result = await pool.query(
        `
        UPDATE ${this.tableName}
        SET ultimo_acesso = $1
        WHERE id = $2
        `,
        [new Date(), id]
      );

      if (result.rowCount === 0) {
        throw new Error('Administrador não encontrado');
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Erro inesperado ao atualizar último acesso';

      throw new Error(
        `Erro ao atualizar último acesso: ${message}`
      );
    }
  }

  async updateSenha(
    id: number,
    novaSenhaHash: string
  ): Promise<void> {
    try {
      const result = await pool.query(
        `
        UPDATE ${this.tableName}
        SET
          senha_hash = $1,
          updated = $2
        WHERE id = $3
        `,
        [
          novaSenhaHash,
          new Date(),
          id,
        ]
      );

      if (result.rowCount === 0) {
        throw new Error('Administrador não encontrado');
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Erro inesperado ao atualizar senha';

      throw new Error(
        `Erro ao atualizar senha: ${message}`
      );
    }
  }

  private mapToEntity(row: AdminRow): Admin {
    return {
      id: row.id,
      nome: row.nome,
      email: row.email,
      senhaHash: row.senha_hash,
      nivelAcesso: row.nivel_acesso,
      criadoEm: new Date(row.criado_em),
      ultimoAcesso: row.ultimo_acesso
        ? new Date(row.ultimo_acesso)
        : null,
      atulizadoEm: new Date(row.updated),
    };
  }
}