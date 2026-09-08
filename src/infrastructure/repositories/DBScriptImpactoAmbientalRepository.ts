import { pool } from "../../shared/config/db";

import {
  IImpactoAmbientalRepository
} from "../../domain/repositories/IImpactoAmbientalRepository";

import {
  ImpactoAmbientalGeral,
  ImpactoAmbientalParceiro,
  ImpactoAmbientalPonto,
} from "../../domain/entities/ImpactoAmbiental";


export class DBScriptImpactoAmbientalRepository
  implements IImpactoAmbientalRepository {

  async getGeral(): Promise<ImpactoAmbientalGeral> {

    const { rows } = await pool.query(`
      SELECT *
      FROM public.view_impacto_ambiental_geral
    `);

    const row = rows[0];

    return {
      totalParceiros: Number(row.total_parceiros ?? 0),
      totalPontos: Number(row.total_pontos ?? 0),
      totalColetas: Number(row.total_coletas ?? 0),

      volumeTotalColetado: Number(
        row.volume_total_coletado ?? 0
      ),

      biodieselEstimadoLitros: Number(
        row.biodiesel_estimado_litros ?? 0
      ),

      energiaBiodieselMj: Number(
        row.energia_biodiesel_mj ?? 0
      ),

      dieselEquivalenteLitros: Number(
        row.diesel_equivalente_litros ?? 0
      ),

      co2EvitadoKg: Number(
        row.co2_evitado_kg ?? 0
      ),

      residuoDesviadoKg: Number(
        row.residuo_desviado_kg ?? 0
      ),
    };
  }


  async getPorParceiro(
  parceiroId: number
): Promise<ImpactoAmbientalParceiro | null> {

  const { rows } = await pool.query(
    `
    SELECT *
    FROM public.view_impacto_ambiental_parceiro
    WHERE parceiro_id = $1
    `,
    [parceiroId]
  );

  if (rows.length === 0) {
    return null;
  }

  const row = rows[0];

  return {
    parceiroId: Number(row.parceiro_id),
    nome: row.nome ?? null,
    razaoSocial: row.razao_social ?? null,
    totalPontos: Number(row.total_pontos ?? 0),
    totalColetas: Number(row.total_coletas ?? 0),
    volumeTotalColetado: Number(row.volume_total_coletado ?? 0),
    biodieselEstimadoLitros: Number(
      row.biodiesel_estimado_litros ?? 0
    ),
    energiaBiodieselMj: Number(
      row.energia_biodiesel_mj ?? 0
    ),
    dieselEquivalenteLitros: Number(
      row.diesel_equivalente_litros ?? 0
    ),
    co2EvitadoKg: Number(
      row.co2_evitado_kg ?? 0
    ),
    residuoDesviadoKg: Number(
      row.residuo_desviado_kg ?? 0
    ),
  };
}


  async getPorPonto(
    pontoId: number
  ): Promise<ImpactoAmbientalPonto | null> {

    const { rows } = await pool.query(
      `
      SELECT *
      FROM public.view_impacto_ambiental_ponto
      WHERE ponto_id = $1
      `,
      [pontoId]
    );

    if (rows.length === 0) {
      return null;
    }

    return this.mapPonto(rows[0]);
  }


  async getPontoDoParceiro(
    parceiroId: number,
    pontoId: number
  ): Promise<ImpactoAmbientalPonto | null> {

    const { rows } = await pool.query(
      `
      SELECT *
      FROM public.view_impacto_ambiental_ponto
      WHERE ponto_id = $1
        AND parceiro_id = $2
      `,
      [
        pontoId,
        parceiroId
      ]
    );

    if (rows.length === 0) {
      return null;
    }

    return this.mapPonto(rows[0]);
  }


  private mapPonto(row: any): ImpactoAmbientalPonto {

    return {
      pontoId: Number(row.ponto_id),
      parceiroId: Number(row.parceiro_id),

      nomePontoColeta:
        row.nome_ponto_coleta,

      cidade:
        row.cidade ?? null,

      estado:
        row.estado ?? null,

      totalColetas: Number(
        row.total_coletas ?? 0
      ),

      volumeTotalColetado: Number(
        row.volume_total_coletado ?? 0
      ),

      biodieselEstimadoLitros: Number(
        row.biodiesel_estimado_litros ?? 0
      ),

      energiaBiodieselMj: Number(
        row.energia_biodiesel_mj ?? 0
      ),

      dieselEquivalenteLitros: Number(
        row.diesel_equivalente_litros ?? 0
      ),

      co2EvitadoKg: Number(
        row.co2_evitado_kg ?? 0
      ),

      residuoDesviadoKg: Number(
        row.residuo_desviado_kg ?? 0
      ),
    };
  }
}