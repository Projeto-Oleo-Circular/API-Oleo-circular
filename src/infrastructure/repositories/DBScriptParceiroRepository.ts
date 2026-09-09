import { Parceiro } from '../../domain/entities/Parceiro';
import { IParceiroRepository } from '../../domain/repositories/IParceiroRepository';
import { pool } from '../../shared/config/db';
import { PoolClient } from "pg";
export class DBScriptParceiroRepository implements IParceiroRepository {
  private async obterOuCriarParceiroIndicador(
    nomeOutroParceiro: string
  ): Promise<number> {
    const nomeFormatado = nomeOutroParceiro.trim();

    const existente = await pool.query<{ id: number }>(
      `
      SELECT id
      FROM parceiros_indicadores
      WHERE nome ILIKE $1
      LIMIT 1
      `,
      [nomeFormatado]
    );

    if (existente.rows.length > 0) {
      return existente.rows[0].id;
    }

    const novoIndicador = await pool.query<{ id: number }>(
      `
      INSERT INTO parceiros_indicadores (
        nome,
        tipo,
        ativo
      )
      VALUES ($1, $2, $3)
      RETURNING id
      `,
      [
        nomeFormatado,
        'OUTRO',
        true,
      ]
    );

    return novoIndicador.rows[0].id;
  }

  private async obterOuCriarIndicadorAdmin(
  client: PoolClient
): Promise<number> {
  const nomeIndicador = "Admin/Cataunidos";

  const existente = await client.query<{ id: number }>(
    `
      SELECT id
      FROM parceiros_indicadores
      WHERE LOWER(nome) = LOWER($1)
      LIMIT 1
    `,
    [nomeIndicador]
  );

  if (existente.rows.length > 0) {
    return existente.rows[0].id;
  }

  const criado = await client.query<{ id: number }>(
    `
      INSERT INTO parceiros_indicadores (
        nome,
        tipo,
        ativo
      )
      VALUES (
        $1,
        $2,
        true
      )
      RETURNING id
    `,
    [
      nomeIndicador,
      "ADMIN",
    ]
  );

  return criado.rows[0].id;
}

  async create(data: any): Promise<Parceiro> {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    /*
     * =====================================================
     * PARCEIRO INDICADOR
     * =====================================================
     */

    let parceiroIndicadorIdFinal: number | null = null;

    if (data.criadoPorAdmin === true) {
      parceiroIndicadorIdFinal =
        await this.obterOuCriarIndicadorAdmin(client);
    } else if (
      data.parceiroIndicadorId !== undefined &&
      data.parceiroIndicadorId !== null &&
      String(data.parceiroIndicadorId).trim() !== ""
    ) {
      parceiroIndicadorIdFinal = Number(data.parceiroIndicadorId);
    }

    /*
     * Caso o usuário tenha informado manualmente
     * outro parceiro indicador.
     */
    if (
      data.criadoPorAdmin !== true &&
      !parceiroIndicadorIdFinal &&
      typeof data.outroParceiro === "string" &&
      data.outroParceiro.trim()
    ) {
      const nomeFormatado =
        data.outroParceiro.trim();

      /*
       * Verifica primeiro se já existe.
       */
      const existente =
        await client.query<{ id: number }>(
          `
            SELECT id
            FROM parceiros_indicadores
            WHERE nome ILIKE $1
            LIMIT 1
          `,
          [nomeFormatado]
        );

      if (existente.rows.length > 0) {
        parceiroIndicadorIdFinal =
          existente.rows[0].id;
      } else {
        /*
         * Cria um novo indicador.
         */
        const novoIndicador =
          await client.query<{ id: number }>(
            `
              INSERT INTO parceiros_indicadores (
                nome,
                tipo,
                ativo
              )
              VALUES (
                $1,
                $2,
                $3
              )
              RETURNING id
            `,
            [
              nomeFormatado,
              "OUTRO",
              true,
            ]
          );

        parceiroIndicadorIdFinal =
          novoIndicador.rows[0].id;
      }
    }

    /*
     * =====================================================
     * REDES SOCIAIS
     * =====================================================
     *
     * A coluna no PostgreSQL é JSON/JSONB.
     *
     * O pg NÃO deve receber diretamente:
     *
     * [
     *   "facebook: @teste",
     *   "instagram: @teste"
     * ]
     *
     * Para uma coluna JSON precisamos serializar.
     */

    let redesSociaisJson = "[]";

    if (Array.isArray(data.redesSociais)) {
      redesSociaisJson = JSON.stringify(
        data.redesSociais
      );
    } else if (
      typeof data.redesSociais === "string"
    ) {
      /*
       * Compatibilidade com versões antigas do frontend.
       */
      const rede =
        data.redesSociais.trim();

      redesSociaisJson = JSON.stringify(
        rede ? [rede] : []
      );
    }

    /*
     * =====================================================
     * INSERT PARCEIRO
     * =====================================================
     */

    const comoConheceuFinal =
      data.criadoPorAdmin === true
        ? 'Criado pelo Administrador'
        : typeof data.comoConheceu === 'string' && data.comoConheceu.trim()
          ? data.comoConheceu.trim()
          : null;

    const result =
      await client.query(
        `
          INSERT INTO parceiros (
            tipo_pessoa,
            tipo_parceiro,
            razao_social,
            nome,
            email,
            senha_hash,
            documento,
            telefone,
            responsavel_legal,
            aceite_marketing,
            parceiro_indicador_id,
            como_conheceu,
            observacao,
            status_aprovacao_parceiro,
            redes_sociais
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
            $15::jsonb
          )
          RETURNING *
        `,
        [
          data.tipoPessoa,

          data.tipoParceiro,

          data.razaoSocial,

          data.nome,

          data.email,

          data.senhaHash,

          data.documento,

          data.telefone,

          data.responsavelLegal ?? null,

          Boolean(data.aceiteMarketing),

          parceiroIndicadorIdFinal,

          comoConheceuFinal,

          data.observacao?.trim()
            ? data.observacao.trim()
            : null,

          data.statusAprovacaoParceiro ??
            "PENDENTE",

          /*
           * IMPORTANTE:
           *
           * JSON.stringify foi feito acima.
           */
          redesSociaisJson,
        ]
      );

    await client.query("COMMIT");

    return this.mapToEntity(
      result.rows[0]
    );
  } catch (error) {
    await client.query("ROLLBACK");

    console.error(
      "Erro no repository ao criar parceiro:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "Erro inesperado ao criar parceiro";

    throw new Error(
      `Erro ao criar parceiro: ${message}`
    );
  } finally {
    client.release();
  }
}
  async findByEmail(
    email: string
  ): Promise<Parceiro | null> {
    try {
      const result = await pool.query(
        `
        SELECT
          p.*,
          pi.id AS parceiro_indicador_join_id,
          pi.nome AS parceiro_indicador_nome
        FROM parceiros p
        LEFT JOIN parceiros_indicadores pi
          ON pi.id = p.parceiro_indicador_id
        WHERE p.email = $1
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
          : 'Erro inesperado';

      throw new Error(
        `Erro ao buscar parceiro por email: ${message}`
      );
    }
  }

  async findById(
    id: string | number
  ): Promise<Parceiro | null> {
    try {
      const result = await pool.query(
        `
        SELECT
          p.*,
          pi.id AS parceiro_indicador_join_id,
          pi.nome AS parceiro_indicador_nome
        FROM parceiros p
        LEFT JOIN parceiros_indicadores pi
          ON pi.id = p.parceiro_indicador_id
        WHERE p.id = $1
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
        `Erro ao buscar parceiro por ID: ${message}`
      );
    }
  }

  async findByDocumento(
    documento: string
  ): Promise<Parceiro | null> {
    try {
      const result = await pool.query(
        `
        SELECT
          p.*,
          pi.id AS parceiro_indicador_join_id,
          pi.nome AS parceiro_indicador_nome
        FROM parceiros p
        LEFT JOIN parceiros_indicadores pi
          ON pi.id = p.parceiro_indicador_id
        WHERE p.documento = $1
        LIMIT 1
        `,
        [documento]
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
        `Erro ao buscar parceiro por documento: ${message}`
      );
    }
  }

  async update(
    id: string | number,
    data: Partial<any>
  ): Promise<Parceiro> {
    try {
      const fields: string[] = [];
      const values: unknown[] = [];

      let index = 1;

      if (data.razaoSocial !== undefined) {
        fields.push(`razao_social = $${index++}`);
        values.push(data.razaoSocial);
      }

      if (data.nome !== undefined) {
        fields.push(`nome = $${index++}`);
        values.push(data.nome);
      }

      if (data.telefone !== undefined) {
        fields.push(`telefone = $${index++}`);
        values.push(data.telefone);
      }

      if (data.statusAprovacaoParceiro !== undefined) {
        fields.push(
          `status_aprovacao_parceiro = $${index++}`
        );

        values.push(
          data.statusAprovacaoParceiro
        );
      }

      if (data.parceiroIndicadorId !== undefined) {
        fields.push(
          `parceiro_indicador_id = $${index++}`
        );

        values.push(
          data.parceiroIndicadorId
        );
      }

      if (data.aceiteMarketing !== undefined) {
        fields.push(
          `aceite_marketing = $${index++}`
        );

        values.push(
          data.aceiteMarketing
        );
      }

      if (data.responsavelLegal !== undefined) {
        fields.push(
          `responsavel_legal = $${index++}`
        );

        values.push(
          data.responsavelLegal
        );
      }

      if (data.redesSociais !== undefined) {
        fields.push(
          `redes_sociais = $${index++}::jsonb`
        );

        values.push(
          JSON.stringify(data.redesSociais ?? [])
        );
      }

      if (data.tipoParceiro !== undefined) {
        fields.push(
          `tipo_parceiro = $${index++}`
        );

        values.push(
          data.tipoParceiro
        );
      }

      if (data.comoConheceu !== undefined) {
        fields.push(
          `como_conheceu = $${index++}`
        );

        values.push(
          data.comoConheceu
        );
      }

      if (data.observacao !== undefined) {
        fields.push(
          `observacao = $${index++}`
        );

        values.push(
          data.observacao
        );
      }

      if (data.expectativaGeracao !== undefined) {
        fields.push(
          `expectativa_geracao = $${index++}`
        );

        values.push(
          data.expectativaGeracao
        );
      }

      if (data.tipoPorte !== undefined) {
        fields.push(
          `tipo_porte = $${index++}`
        );

        values.push(
          data.tipoPorte
        );
      }

      if (data.senhaHash !== undefined) {
        fields.push(
          `senha_hash = $${index++}`
        );

        values.push(
          data.senhaHash
        );
      }

      if (fields.length === 0) {
        const parceiro = await this.findById(id);

        if (!parceiro) {
          throw new Error(
            'Parceiro não encontrado para atualização.'
          );
        }

        return parceiro;
      }

      values.push(id);

      const result = await pool.query(
        `
        UPDATE parceiros
        SET ${fields.join(', ')}
        WHERE id = $${index}
        RETURNING *
        `,
        values
      );

      if (result.rows.length === 0) {
        throw new Error(
          'Parceiro não encontrado para atualização.'
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
        `Erro ao atualizar parceiro: ${message}`
      );
    }
  }

  async delete(id: number): Promise<void> {
    try {
      const result = await pool.query(
        `
        DELETE FROM parceiros
        WHERE id = $1
        `,
        [id]
      );

      if (result.rowCount === 0) {
        throw new Error(
          'Parceiro não encontrado.'
        );
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Erro inesperado';

      throw new Error(
        `Erro ao excluir parceiro: ${message}`
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
  ): Promise<Parceiro> {
    try {
      const result = await pool.query(
        `
        UPDATE parceiros
        SET
          status_aprovacao_parceiro = $1,
          observacao = $2
        WHERE id = $3
        RETURNING *
        `,
        [
          status,
          observacao,
          id,
        ]
      );

      if (result.rows.length === 0) {
        throw new Error(
          'Parceiro não encontrado.'
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
        `Erro ao atualizar status: ${message}`
      );
    }
  }

  async findByStatus(
    status: string
  ): Promise<Parceiro[]> {
    try {
      const result = await pool.query(
        `
        SELECT
          p.*,
          pi.id AS parceiro_indicador_join_id,
          pi.nome AS parceiro_indicador_nome
        FROM parceiros p
        LEFT JOIN parceiros_indicadores pi
          ON pi.id = p.parceiro_indicador_id
        WHERE p.status_aprovacao_parceiro = $1
        `,
        [status]
      );

      return result.rows.map(
        (row) => this.mapToEntity(row)
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Erro inesperado';

      throw new Error(
        `Erro ao buscar parceiros por status: ${message}`
      );
    }
  }

  async findAll(): Promise<Parceiro[]> {
    try {
      const result = await pool.query(
        `
        SELECT
          p.*,
          pi.id AS parceiro_indicador_join_id,
          pi.nome AS parceiro_indicador_nome
        FROM parceiros p
        LEFT JOIN parceiros_indicadores pi
          ON pi.id = p.parceiro_indicador_id
        ORDER BY p.criado_em DESC
        `
      );

      return result.rows.map(
        (row) => this.mapToEntity(row)
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Erro inesperado';

      throw new Error(
        `Erro ao buscar todos os parceiros: ${message}`
      );
    }
  }

  async getParceirosIndicadores(): Promise<any[]> {
    try {
      const result = await pool.query(
        `
        SELECT *
        FROM parceiros_indicadores
        WHERE ativo = true
        ORDER BY nome ASC
        `
      );

      return result.rows;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Erro inesperado';

      throw new Error(
        `Erro ao buscar parceiros indicadores: ${message}`
      );
    }
  }

  async updatePasswordByEmail(
    email: string,
    senhaHash: string
  ): Promise<void> {
    try {
      const result = await pool.query(
        `
        UPDATE parceiros
        SET senha_hash = $1
        WHERE email = $2
        RETURNING id
        `,
        [
          senhaHash,
          email,
        ]
      );

      if (result.rows.length === 0) {
        throw new Error(
          'Parceiro não encontrado para este e-mail.'
        );
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Erro inesperado';

      throw new Error(
        `Erro ao atualizar senha: ${message}`
      );
    }
  }

  private mapToEntity(data: any): Parceiro {
    return {
      id: data.id,
      tipoPessoa: data.tipo_pessoa,
      tipoParceiro: data.tipo_parceiro,
      razaoSocial: data.razao_social,
      nome: data.nome,
      email: data.email,
      senhaHash: data.senha_hash,
      documento: data.documento,
      telefone: data.telefone,
      responsavelLegal:
        data.responsavel_legal,
      redesSociais:
        data.redes_sociais,
      aceiteMarketing:
        data.aceite_marketing,
      parceiroIndicadorId:
        data.parceiro_indicador_id,
      parceiroIndicador:
        data.parceiro_indicador_join_id
          ? {
              id: data.parceiro_indicador_join_id,
              nome: data.parceiro_indicador_nome,
            }
          : null,
      outroParceiro:
        data.outro_parceiro ?? null,
      comoConheceu:
        data.como_conheceu,
      observacao:
        data.observacao,
      statusAprovacaoParceiro:
        data.status_aprovacao_parceiro,
      expectativaGeracao:
        data.expectativa_geracao ?? null,
      tipoPorte:
        data.tipo_porte ?? null,
      criadoEm:
        data.criado_em,
      updatedEm:
        data.updated_at,
    } as Parceiro;
  }
}
