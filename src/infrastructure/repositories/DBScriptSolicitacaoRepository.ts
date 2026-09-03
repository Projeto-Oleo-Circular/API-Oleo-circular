import { SolicitacaoColeta } from '../../domain/entities/SolicitacaoColeta';
import { ISolicitacaoColetaRepository } from '../../domain/repositories/ISolicitacaoColetaRepository';
import { pool } from '../../shared/config/db';

interface SolicitacaoColetaRow {
  id: number;
  ponto_coleta_id: number;
  status: string;
  volume_informado: number | string;
  volume_coletado: number | string | null;
  observacoes: string | null;
  data_solicitacao: string | Date;
  data_agendamento: string | Date | null;
  data_conclusao: string | Date | null;
}

export class DBScriptSolicitacaoRepository
  implements ISolicitacaoColetaRepository
{
  async create(
    data: Omit<SolicitacaoColeta, 'id' | 'dataSolicitacao'>
  ): Promise<SolicitacaoColeta> {
    try {
      const result = await pool.query<SolicitacaoColetaRow>(
        `
        INSERT INTO solicitacoes_coleta (
          ponto_coleta_id,
          status,
          volume_informado,
          volume_coletado,
          observacoes,
          data_agendamento,
          data_conclusao
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
          data.pontoColetaId,
          data.status ?? 'AGUARDANDO',
          data.volumeInformado,
          data.volumeColetado ?? null,
          data.observacoes ?? null,
          data.dataAgendamento ?? null,
          data.dataConclusao ?? null,
        ]
      );

      return this.mapToEntity(result.rows[0]);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Erro inesperado';

      throw new Error(
        `Erro ao criar solicitação de coleta: ${message}`
      );
    }
  }

  async findById(
    id: number
  ): Promise<SolicitacaoColeta | null> {
    try {
      const result = await pool.query<SolicitacaoColetaRow>(
        `
        SELECT *
        FROM solicitacoes_coleta
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
        `Erro ao buscar solicitação: ${message}`
      );
    }
  }

  async findByPontoColetaId(
    pontoColetaId: number
  ): Promise<SolicitacaoColeta[]> {
    try {
      const result = await pool.query<SolicitacaoColetaRow>(
        `
        SELECT *
        FROM solicitacoes_coleta
        WHERE ponto_coleta_id = $1
        ORDER BY data_solicitacao DESC
        `,
        [pontoColetaId]
      );

      return result.rows.map((item) =>
        this.mapToEntity(item)
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Erro inesperado';

      throw new Error(
        `Erro ao buscar solicitações do ponto: ${message}`
      );
    }
  }

  async update(
    id: number,
    data: Partial<SolicitacaoColeta>
  ): Promise<SolicitacaoColeta> {
    try {
      const fields: string[] = [];
      const values: unknown[] = [];

      let index = 1;

      if (data.status !== undefined) {
        fields.push(`status = $${index++}`);
        values.push(data.status);
      }

      if (data.volumeColetado !== undefined) {
        fields.push(
          `volume_coletado = $${index++}`
        );
        values.push(data.volumeColetado);
      }

      if (data.observacoes !== undefined) {
        fields.push(
          `observacoes = $${index++}`
        );
        values.push(data.observacoes);
      }

      if (data.dataAgendamento !== undefined) {
        fields.push(
          `data_agendamento = $${index++}`
        );
        values.push(data.dataAgendamento);
      }

      if (data.dataConclusao !== undefined) {
        fields.push(
          `data_conclusao = $${index++}`
        );
        values.push(data.dataConclusao);
      }

      if (fields.length === 0) {
        const existente = await this.findById(id);

        if (!existente) {
          throw new Error(
            'Solicitação não encontrada.'
          );
        }

        return existente;
      }

      values.push(id);

      const result = await pool.query<SolicitacaoColetaRow>(
        `
        UPDATE solicitacoes_coleta
        SET ${fields.join(', ')}
        WHERE id = $${index}
        RETURNING *
        `,
        values
      );

      if (result.rows.length === 0) {
        throw new Error(
          'Solicitação não encontrada.'
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
        `Erro ao atualizar solicitação: ${message}`
      );
    }
  }

  async findAll(): Promise<SolicitacaoColeta[]> {
    try {
      const result = await pool.query<SolicitacaoColetaRow>(
        `
        SELECT *
        FROM solicitacoes_coleta
        ORDER BY data_solicitacao DESC
        `
      );

      return result.rows.map((item) =>
        this.mapToEntity(item)
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Erro inesperado';

      throw new Error(
        `Erro ao buscar todas as solicitações: ${message}`
      );
    }
  }

  async findAtivaByPontoColetaId(
    pontoColetaId: number
  ): Promise<SolicitacaoColeta | null> {
    try {
      const statusAtivos = [
        'AGUARDANDO',
        'AGENDADA',
        'EM_ROTA',
        'EM_ANDAMENTO',
        'SOLICITADA',
      ];

      const result = await pool.query<SolicitacaoColetaRow>(
        `
        SELECT *
        FROM solicitacoes_coleta
        WHERE ponto_coleta_id = $1
          AND status = ANY($2::text[])
        ORDER BY data_solicitacao DESC
        LIMIT 1
        `,
        [
          pontoColetaId,
          statusAtivos,
        ]
      );

      if (result.rows.length === 0) {
        return null;
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
        `Erro ao buscar solicitação ativa: ${message}`
      );
    }
  }

  private formatToBrasilia(
    dateInput: unknown
  ): string | null {
    if (!dateInput) {
      return null;
    }

    const date = new Date(
      dateInput as string | number | Date
    );

    if (Number.isNaN(date.getTime())) {
      return null;
    }

    const formatter =
      new Intl.DateTimeFormat(
        'en-CA',
        {
          timeZone:
            'America/Sao_Paulo',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        }
      );

    const parts =
      formatter.formatToParts(date);

    const getPart = (
      type: string
    ) =>
      parts.find(
        (part) =>
          part.type === type
      )?.value ?? '';

    const year =
      getPart('year');

    const month =
      getPart('month');

    const day =
      getPart('day');

    const hour =
      getPart('hour');

    const minute =
      getPart('minute');

    const second =
      getPart('second');

    return `${year}-${month}-${day}T${hour}:${minute}:${second}`;
  }

  private mapToEntity(
    data: SolicitacaoColetaRow
  ): SolicitacaoColeta {
    return {
      id: data.id,

      pontoColetaId:
        data.ponto_coleta_id,

      status:
        data.status as SolicitacaoColeta['status'],

      volumeInformado:
        Number(
          data.volume_informado
        ),

      volumeColetado:
        data.volume_coletado !== null
          ? Number(
              data.volume_coletado
            )
          : null,

      observacoes:
        data.observacoes,

      dataSolicitacao:
        this.formatToBrasilia(
          data.data_solicitacao
        )!,

      dataAgendamento:
        this.formatToBrasilia(
          data.data_agendamento
        ),

      dataConclusao:
        this.formatToBrasilia(
          data.data_conclusao
        ),
    };
  }
}