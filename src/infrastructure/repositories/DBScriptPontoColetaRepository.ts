import {
  getCategoriaPontoColetaLabel,
  PontoColeta,
} from '../../domain/entities/PontoColeta';

import { IPontoColetaRepository } from '../../domain/repositories/IPontoColetaRepository';
import { pool } from '../../shared/config/db';

export class DBScriptPontoColetaRepository
  implements IPontoColetaRepository
{
  async create(
    data: Omit<PontoColeta, 'id' | 'criadoEm'>
  ): Promise<PontoColeta> {
    try {
      const result = await pool.query(
        `
        INSERT INTO pontos_coleta (
          parceiro_id,
          categoria,
          cep,
          logradouro,
          numero,
          bairro,
          cidade,
          estado,
          complemento,
          expectativa_geracao,
          capacidade_bombona,
          nivel_atual_pct,
          status_bombona,
          status_aprovacao_ponto_coleta,
          nome_ponto_coleta,
          longitude,
          latitude
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
          $9,
          $10,
          $11,
          $12,
          $13,
          $14,
          $15,
          $16,
          $17
        )
        RETURNING *
        `,
        [
          data.parceiroId,
          data.categoria,
          data.cep,
          data.logradouro,
          data.numero,
          data.bairro,
          data.cidade,
          data.estado,
          data.complemento,
          data.expectativaGeracao,
          data.capacidadeBombona,
          data.nivelAtualPct,
          data.statusBombona,
          data.statusAprovacaoPontoColeta,
          data.nomePontoColeta,
          data.longitude,
          data.latitude,
        ]
      );

      return this.mapToEntity(result.rows[0]);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Erro inesperado';

      throw new Error(
        `Erro ao criar ponto de coleta: ${message}`
      );
    }
  }

  async findById(
    id: string | number
  ): Promise<PontoColeta | null> {
    try {
      const result = await pool.query(
        `
        SELECT *
        FROM pontos_coleta
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
          : 'Erro inesperado';

      throw new Error(
        `Erro ao buscar ponto de coleta: ${message}`
      );
    }
  }

  async findByParceiroId(
    parceiroId: number
  ): Promise<PontoColeta[]> {
    try {
      const result = await pool.query(
        `
        SELECT *
        FROM pontos_coleta
        WHERE parceiro_id = $1
        ORDER BY criado_em DESC
        `,
        [parceiroId]
      );

      return result.rows.map((row) =>
        this.mapToEntity(row)
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Erro inesperado';

      throw new Error(
        `Erro ao buscar pontos de coleta: ${message}`
      );
    }
  }

  async update(
    id: string | number,
    data: Partial<PontoColeta>
  ): Promise<PontoColeta> {
    try {
      const fields: string[] = [];
      const values: unknown[] = [];

      let index = 1;

      if (data.categoria !== undefined) {
        fields.push(`categoria = $${index++}`);
        values.push(data.categoria);
      }

      if (data.cep !== undefined) {
        fields.push(`cep = $${index++}`);
        values.push(data.cep);
      }

      if (data.logradouro !== undefined) {
        fields.push(`logradouro = $${index++}`);
        values.push(data.logradouro);
      }

      if (data.numero !== undefined) {
        fields.push(`numero = $${index++}`);
        values.push(data.numero);
      }

      if (data.bairro !== undefined) {
        fields.push(`bairro = $${index++}`);
        values.push(data.bairro);
      }

      if (data.cidade !== undefined) {
        fields.push(`cidade = $${index++}`);
        values.push(data.cidade);
      }

      if (data.estado !== undefined) {
        fields.push(`estado = $${index++}`);
        values.push(data.estado);
      }

      if (data.complemento !== undefined) {
        fields.push(`complemento = $${index++}`);
        values.push(data.complemento);
      }

      if (data.expectativaGeracao !== undefined) {
        fields.push(
          `expectativa_geracao = $${index++}`
        );

        values.push(
          data.expectativaGeracao
        );
      }

      if (data.capacidadeBombona !== undefined) {
        fields.push(
          `capacidade_bombona = $${index++}`
        );

        values.push(
          data.capacidadeBombona
        );
      }

      if (data.nivelAtualPct !== undefined) {
        fields.push(
          `nivel_atual_pct = $${index++}`
        );

        values.push(
          data.nivelAtualPct
        );
      }

      if (data.statusBombona !== undefined) {
        fields.push(
          `status_bombona = $${index++}`
        );

        values.push(
          data.statusBombona
        );
      }

      if (
        data.statusAprovacaoPontoColeta !== undefined
      ) {
        fields.push(
          `status_aprovacao_ponto_coleta = $${index++}`
        );

        values.push(
          data.statusAprovacaoPontoColeta
        );
      }

      if (data.nomePontoColeta !== undefined) {
        fields.push(
          `nome_ponto_coleta = $${index++}`
        );

        values.push(
          data.nomePontoColeta
        );
      }

      if (data.longitude !== undefined) {
        fields.push(
          `longitude = $${index++}`
        );

        values.push(
          data.longitude
        );
      }

      if (data.latitude !== undefined) {
        fields.push(
          `latitude = $${index++}`
        );

        values.push(
          data.latitude
        );
      }

      // se sua tabela realmente tem a coluna "updated"
      fields.push(
        `updated = $${index++}`
      );

      values.push(
        new Date()
      );

      values.push(id);

      const result = await pool.query(
        `
        UPDATE pontos_coleta
        SET ${fields.join(', ')}
        WHERE id = $${index}
        RETURNING *
        `,
        values
      );

      if (result.rows.length === 0) {
        throw new Error(
          'Ponto de coleta não encontrado.'
        );
      }

      return this.mapToEntity(
        result.rows[0]
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Erro inesperado';

      throw new Error(
        `Erro ao atualizar ponto de coleta: ${message}`
      );
    }
  }

  async updateStatusComObservacao(
    id: number,
    status:
      | 'APROVADO'
      | 'REJEITADO'
      | 'PENDENTE',
    observacao: string | null
  ): Promise<PontoColeta> {
    try {
      const result = await pool.query(
        `
        UPDATE pontos_coleta
        SET
          status_aprovacao_ponto_coleta = $1,
          updated = $2
        WHERE id = $3
        RETURNING *
        `,
        [
          status,
          new Date(),
          id,
        ]
      );

      if (result.rows.length === 0) {
        throw new Error(
          'Ponto de coleta não encontrado.'
        );
      }

      return this.mapToEntity(
        result.rows[0]
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Erro inesperado';

      throw new Error(
        `Erro ao atualizar status do ponto de coleta: ${message}`
      );
    }
  }

  async findAll(): Promise<PontoColeta[]> {
    try {
      const result = await pool.query(
        `
        SELECT *
        FROM pontos_coleta
        ORDER BY criado_em DESC
        `
      );

      return result.rows.map((row) =>
        this.mapToEntity(row)
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Erro inesperado';

      throw new Error(
        `Erro ao buscar todos os pontos de coleta: ${message}`
      );
    }
  }

  async delete(id: number): Promise<void> {
    try {
      const result = await pool.query(
        `
        DELETE FROM pontos_coleta
        WHERE id = $1
        `,
        [id]
      );

      if (result.rowCount === 0) {
        throw new Error(
          'Ponto de coleta não encontrado.'
        );
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Erro inesperado';

      throw new Error(
        `Erro ao excluir ponto de coleta: ${message}`
      );
    }
  }

  private mapToEntity(
    data: any
  ): PontoColeta {
    const categoriaNumero =
      data.categoria;

    const categoriaLabel =
      getCategoriaPontoColetaLabel(
        categoriaNumero
      );

    return {
      id: data.id,
      parceiroId:
        data.parceiro_id,

      categoria:
        categoriaLabel ??
        categoriaNumero,

      cep: data.cep,
      logradouro:
        data.logradouro,

      numero:
        data.numero,

      bairro:
        data.bairro,

      cidade:
        data.cidade,

      estado:
        data.estado,

      complemento:
        data.complemento,

      expectativaGeracao:
        data.expectativa_geracao,

      capacidadeBombona:
        data.capacidade_bombona,

      nivelAtualPct:
        data.nivel_atual_pct,

      statusBombona:
        data.status_bombona,

      statusAprovacaoPontoColeta:
        data.status_aprovacao_ponto_coleta,

      nomePontoColeta:
        data.nome_ponto_coleta,

      atualizadoEm:
        data.updated,

      latitude:
        data.latitude,

      longitude:
        data.longitude,
    };
  }
}