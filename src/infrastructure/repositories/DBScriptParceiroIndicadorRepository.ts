import { ParceiroIndicador } from '../../domain/entities/ParceiroIndicador';
import { pool } from '../../shared/config/db';

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
  create(
    data: Omit<ParceiroIndicador, 'id' | 'criadoEm'>
  ): Promise<ParceiroIndicador>;
  update(
    id: number,
    data: Partial<ParceiroIndicador>
  ): Promise<ParceiroIndicador>;
  delete(id: number): Promise<void>;
}

export class DBScriptParceiroIndicadorRepository
  implements IParceiroIndicadorRepository
{
  private readonly table = 'parceiros_indicadores';

  private mapToEntity(
    row: ParceiroIndicadorRow
  ): ParceiroIndicador {
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

  async findById(
    id: number
  ): Promise<ParceiroIndicador | null> {
    try {
      const result = await pool.query<ParceiroIndicadorRow>(
        `
        SELECT *
        FROM ${this.table}
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
          : 'Erro inesperado ao buscar indicador';

      throw new Error(
        `Erro ao buscar indicador por ID: ${message}`
      );
    }
  }

  async findAllAtivos(): Promise<ParceiroIndicador[]> {
    try {
      const result = await pool.query<ParceiroIndicadorRow>(
        `
        SELECT *
        FROM ${this.table}
        WHERE ativo = true
        ORDER BY nome ASC
        `
      );

      return result.rows.map((row) =>
        this.mapToEntity(row)
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Erro inesperado ao buscar indicadores ativos';

      throw new Error(
        `Erro ao buscar indicadores ativos: ${message}`
      );
    }
  }

  async findAll(): Promise<ParceiroIndicador[]> {
    try {
      const result = await pool.query<ParceiroIndicadorRow>(
        `
        SELECT *
        FROM ${this.table}
        ORDER BY nome ASC
        `
      );

      return result.rows.map((row) =>
        this.mapToEntity(row)
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Erro inesperado ao buscar indicadores';

      throw new Error(
        `Erro ao buscar todos os indicadores: ${message}`
      );
    }
  }

  async create(
    data: Omit<ParceiroIndicador, 'id' | 'criadoEm'>
  ): Promise<ParceiroIndicador> {
    try {
      const result = await pool.query<ParceiroIndicadorRow>(
        `
        INSERT INTO ${this.table} (
          nome,
          tipo,
          cnpj,
          email,
          telefone,
          site,
          ativo
        )
        VALUES (
          $1,
          $2,
          $3,
          $4,
          $5,
          $6,
          $7
        )
        RETURNING *
        `,
        [
          data.nome,
          data.tipo,
          data.cnpj,
          data.email,
          data.telefone,
          data.site,
          data.ativo,
        ]
      );

      return this.mapToEntity(result.rows[0]);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Erro inesperado ao criar indicador';

      throw new Error(
        `Erro ao criar indicador: ${message}`
      );
    }
  }

  async update(
    id: number,
    data: Partial<ParceiroIndicador>
  ): Promise<ParceiroIndicador> {
    try {
      const fields: string[] = [];
      const values: unknown[] = [];

      let parameterIndex = 1;

      if (data.nome !== undefined) {
        fields.push(`nome = $${parameterIndex++}`);
        values.push(data.nome);
      }

      if (data.tipo !== undefined) {
        fields.push(`tipo = $${parameterIndex++}`);
        values.push(data.tipo);
      }

      if (data.cnpj !== undefined) {
        fields.push(`cnpj = $${parameterIndex++}`);
        values.push(data.cnpj);
      }

      if (data.email !== undefined) {
        fields.push(`email = $${parameterIndex++}`);
        values.push(data.email);
      }

      if (data.telefone !== undefined) {
        fields.push(`telefone = $${parameterIndex++}`);
        values.push(data.telefone);
      }

      if (data.site !== undefined) {
        fields.push(`site = $${parameterIndex++}`);
        values.push(data.site);
      }

      if (data.ativo !== undefined) {
        fields.push(`ativo = $${parameterIndex++}`);
        values.push(data.ativo);
      }

      if (fields.length === 0) {
        const existing = await this.findById(id);

        if (!existing) {
          throw new Error('Indicador não encontrado');
        }

        return existing;
      }

      values.push(id);

      const result = await pool.query<ParceiroIndicadorRow>(
        `
        UPDATE ${this.table}
        SET ${fields.join(', ')}
        WHERE id = $${parameterIndex}
        RETURNING *
        `,
        values
      );

      if (result.rows.length === 0) {
        throw new Error('Indicador não encontrado');
      }

      return this.mapToEntity(result.rows[0]);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Erro inesperado ao atualizar indicador';

      throw new Error(
        `Erro ao atualizar indicador: ${message}`
      );
    }
  }

  async delete(id: number): Promise<void> {
    try {
      const result = await pool.query(
        `
        DELETE FROM ${this.table}
        WHERE id = $1
        `,
        [id]
      );

      if (result.rowCount === 0) {
        throw new Error('Indicador não encontrado');
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Erro inesperado ao excluir indicador';

      throw new Error(
        `Erro ao excluir indicador: ${message}`
      );
    }
  }
}