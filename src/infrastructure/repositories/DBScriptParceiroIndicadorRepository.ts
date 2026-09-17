import { ParceiroIndicador } from '../../domain/entities/ParceiroIndicador';
import { IParceiroIndicadorRepository } from '../../domain/repositories/IParceiroIndicadorRepository';
import { pool } from '../../shared/config/db';

/*
 * ============================================================
 * TIPO DA LINHA DO POSTGRES
 * ============================================================
 *
 * Aqui usamos os nomes EXATOS das colunas do banco.
 */
interface ParceiroIndicadorRow {
  id: number;

  nome: string;

  nome_responsavel: string | null;

  tipo:
    | 'ASSOCIACAO'
    | 'COOPERATIVA'
    | 'ONG';

  cnpj: string;

  email: string | null;

  telefone: string | null;

  site: string | null;

  ativo: boolean;

  criado_em: string;

  municipio: string | null;
}

/*
 * ============================================================
 * REPOSITORY
 * ============================================================
 */

export class DBScriptParceiroIndicadorRepository
  implements IParceiroIndicadorRepository
{
  private readonly table =
    'parceiros_indicadores';

  /*
   * ==========================================================
   * MAP BANCO -> ENTIDADE
   * ==========================================================
   */

  private mapToEntity(
    row: ParceiroIndicadorRow
  ): ParceiroIndicador {
    return {
      id:
        row.id,

      nome:
        row.nome,

      /*
       * No banco:
       * nome_responsavel
       *
       * Na entidade:
       * nomeResposavel
       *
       * Mantemos o nome atual da sua entidade.
       */
      nomeResposavel:
        row.nome_responsavel ?? '',

      tipo:
        row.tipo,

      cnpj:
        row.cnpj,

      email:
        row.email,

      telefone:
        row.telefone,

      site:
        row.site,

      ativo:
        row.ativo,

      criadoEm:
        new Date(
          row.criado_em
        ),

      municipio:
        row.municipio,
    };
  }

  /*
   * ==========================================================
   * BUSCAR POR ID
   * ==========================================================
   */

  async findById(
    id: number
  ): Promise<ParceiroIndicador | null> {
    try {
      const result =
        await pool.query<ParceiroIndicadorRow>(
          `
          SELECT *
          FROM ${this.table}
          WHERE id = $1
          LIMIT 1
          `,
          [id]
        );

      if (
        result.rows.length === 0
      ) {
        return null;
      }

      return this.mapToEntity(
        result.rows[0]
      );
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

  /*
   * ==========================================================
   * BUSCAR POR EMAIL
   * ==========================================================
   *
   * ESTE ERA O MÉTODO QUE ESTAVA FALTANDO.
   * ==========================================================
   */

  async findByEmail(
    email: string
  ): Promise<ParceiroIndicador | null> {
    try {
      if (
        !email ||
        !email.trim()
      ) {
        return null;
      }

      const emailNormalizado =
        email
          .trim()
          .toLowerCase();

      const result =
        await pool.query<ParceiroIndicadorRow>(
          `
          SELECT *
          FROM ${this.table}
          WHERE LOWER(email) = $1
          LIMIT 1
          `,
          [
            emailNormalizado
          ]
        );

      if (
        result.rows.length === 0
      ) {
        return null;
      }

      return this.mapToEntity(
        result.rows[0]
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Erro inesperado ao buscar indicador por email';

      throw new Error(
        `Erro ao buscar indicador por email: ${message}`
      );
    }
  }

  /*
   * ==========================================================
   * LISTAR ATIVOS
   * ==========================================================
   */

  async findAllAtivos(): Promise<
    ParceiroIndicador[]
  > {
    try {
      const result =
        await pool.query<ParceiroIndicadorRow>(
          `
          SELECT *
          FROM ${this.table}
          WHERE ativo = true
          ORDER BY nome ASC
          `
        );

      return result.rows.map(
        (row) =>
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

  /*
   * ==========================================================
   * LISTAR TODOS
   * ==========================================================
   */

  async findAll(): Promise<
    ParceiroIndicador[]
  > {
    try {
      const result =
        await pool.query<ParceiroIndicadorRow>(
          `
          SELECT *
          FROM ${this.table}
          ORDER BY nome ASC
          `
        );

      return result.rows.map(
        (row) =>
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

  /*
   * ==========================================================
   * CRIAR
   * ==========================================================
   */

  async create(
    data: Omit<
      ParceiroIndicador,
      'id' | 'criadoEm'
    >
  ): Promise<ParceiroIndicador> {
    try {
      /*
       * Normaliza CNPJ.
       */
      const cnpj =
        data.cnpj.replace(
          /\D/g,
          ''
        );

      /*
       * Normaliza email.
       */
      const email =
        data.email
          ? data.email
              .trim()
              .toLowerCase()
          : null;

      /*
       * ------------------------------------------------------
       * Verifica CNPJ duplicado
       * ------------------------------------------------------
       */

      const existingCnpj =
        await pool.query(
          `
          SELECT id
          FROM ${this.table}
          WHERE cnpj = $1
          LIMIT 1
          `,
          [cnpj]
        );

      if (
        existingCnpj.rows.length > 0
      ) {
        throw new Error(
          'CNPJ já cadastrado para outro parceiro indicador'
        );
      }

      /*
       * ------------------------------------------------------
       * Verifica email duplicado
       * ------------------------------------------------------
       */

      if (email) {
        const existingEmail =
          await this.findByEmail(
            email
          );

        if (existingEmail) {
          throw new Error(
            'Email já cadastrado para outro parceiro indicador'
          );
        }
      }

      /*
       * ------------------------------------------------------
       * INSERT
       * ------------------------------------------------------
       */

      const result =
        await pool.query<ParceiroIndicadorRow>(
          `
          INSERT INTO ${this.table} (
            nome,
            tipo,
            cnpj,
            email,
            telefone,
            site,
            ativo,
            nome_responsavel,
            municipio
          )
          VALUES (
            $1,
            $2,
            $3,
            $4,
            $5,
            $6,
            $7,
            $8,
            $9
          )
          RETURNING *
          `,
          [
            data.nome.trim(),

            data.tipo,

            cnpj,

            email,

            data.telefone ??
              null,

            data.site ??
              null,

            data.ativo ??
              true,

            data.nomeResposavel ??
              null,

            data.municipio ??
              null,
          ]
        );

      return this.mapToEntity(
        result.rows[0]
      );
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

  /*
   * ==========================================================
   * ATUALIZAR
   * ==========================================================
   */

  async update(
    id: number,
    data: Partial<ParceiroIndicador>
  ): Promise<ParceiroIndicador> {
    try {
      /*
       * Primeiro verifica se existe.
       */
      const indicadorAtual =
        await this.findById(id);

      if (!indicadorAtual) {
        throw new Error(
          'Indicador não encontrado'
        );
      }

      const fields: string[] = [];

      const values: unknown[] = [];

      let parameterIndex = 1;

      /*
       * ------------------------------------------------------
       * NOME
       * ------------------------------------------------------
       */

      if (
        data.nome !== undefined
      ) {
        fields.push(
          `nome = $${parameterIndex++}`
        );

        values.push(
          data.nome.trim()
        );
      }

      /*
       * ------------------------------------------------------
       * TIPO
       * ------------------------------------------------------
       */

      if (
        data.tipo !== undefined
      ) {
        fields.push(
          `tipo = $${parameterIndex++}`
        );

        values.push(
          data.tipo
        );
      }

      /*
       * ------------------------------------------------------
       * CNPJ
       * ------------------------------------------------------
       */

      if (
        data.cnpj !== undefined
      ) {
        const cnpj =
          data.cnpj.replace(
            /\D/g,
            ''
          );

        const existingCnpj =
          await pool.query(
            `
            SELECT id
            FROM ${this.table}
            WHERE cnpj = $1
              AND id <> $2
            LIMIT 1
            `,
            [
              cnpj,
              id
            ]
          );

        if (
          existingCnpj.rows.length > 0
        ) {
          throw new Error(
            'CNPJ já cadastrado para outro parceiro indicador'
          );
        }

        fields.push(
          `cnpj = $${parameterIndex++}`
        );

        values.push(
          cnpj
        );
      }

      /*
       * ------------------------------------------------------
       * EMAIL
       * ------------------------------------------------------
       */

      if (
        data.email !== undefined
      ) {
        const email =
          data.email
            ? data.email
                .trim()
                .toLowerCase()
            : null;

        if (email) {
          const existingEmail =
            await this.findByEmail(
              email
            );

          if (
            existingEmail &&
            existingEmail.id !== id
          ) {
            throw new Error(
              'Email já cadastrado para outro parceiro indicador'
            );
          }
        }

        fields.push(
          `email = $${parameterIndex++}`
        );

        values.push(
          email
        );
      }

      /*
       * ------------------------------------------------------
       * TELEFONE
       * ------------------------------------------------------
       */

      if (
        data.telefone !== undefined
      ) {
        fields.push(
          `telefone = $${parameterIndex++}`
        );

        values.push(
          data.telefone
        );
      }

      /*
       * ------------------------------------------------------
       * SITE
       * ------------------------------------------------------
       */

      if (
        data.site !== undefined
      ) {
        fields.push(
          `site = $${parameterIndex++}`
        );

        values.push(
          data.site
        );
      }

      /*
       * ------------------------------------------------------
       * ATIVO
       * ------------------------------------------------------
       */

      if (
        data.ativo !== undefined
      ) {
        fields.push(
          `ativo = $${parameterIndex++}`
        );

        values.push(
          data.ativo
        );
      }

      /*
       * ------------------------------------------------------
       * NOME RESPONSÁVEL
       * ------------------------------------------------------
       */

      if (
        data.nomeResposavel !==
        undefined
      ) {
        fields.push(
          `nome_responsavel = $${parameterIndex++}`
        );

        values.push(
          data.nomeResposavel
        );
      }

      /*
       * ------------------------------------------------------
       * MUNICÍPIO
       * ------------------------------------------------------
       */

      if (
        data.municipio !== undefined
      ) {
        fields.push(
          `municipio = $${parameterIndex++}`
        );

        values.push(
          data.municipio
        );
      }

      /*
       * ======================================================
       * NENHUMA ALTERAÇÃO
       * ======================================================
       */

      if (
        fields.length === 0
      ) {
        return indicadorAtual;
      }

      /*
       * ======================================================
       * ID
       * ======================================================
       */

      values.push(id);

      /*
       * ======================================================
       * UPDATE
       * ======================================================
       */

      const result =
        await pool.query<ParceiroIndicadorRow>(
          `
          UPDATE ${this.table}
          SET ${fields.join(', ')}
          WHERE id = $${parameterIndex}
          RETURNING *
          `,
          values
        );

      if (
        result.rows.length === 0
      ) {
        throw new Error(
          'Indicador não encontrado'
        );
      }

      return this.mapToEntity(
        result.rows[0]
      );
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

  /*
   * ==========================================================
   * EXCLUIR
   * ==========================================================
   */

  async delete(
    id: number
  ): Promise<void> {
    try {
      const result =
        await pool.query(
          `
          DELETE FROM ${this.table}
          WHERE id = $1
          `,
          [id]
        );

      if (
        result.rowCount === 0
      ) {
        throw new Error(
          'Indicador não encontrado'
        );
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