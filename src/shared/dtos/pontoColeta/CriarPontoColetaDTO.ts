import { z } from 'zod';
import { normalizeCategoriaPontoColeta } from '../../../domain/entities/PontoColeta';

export const CriarPontoColetaDTOSchema = z.object({
  parceiroId: z.number(),
  nomePontoColeta: z.string().optional(),
  categoria: z.preprocess(
    (value) => {
      if (typeof value === 'string' || typeof value === 'number') {
        return normalizeCategoriaPontoColeta(value);
      }

      return value;
    },
    z.union([
      z.literal(1),
      z.literal(2),
      z.literal(3),
      z.literal(4),
      z.literal(5),
      z.literal(6),
      z.literal(7),
    ]),
  ),
  cep: z.string().min(8).max(9),
  logradouro: z.string().min(1),
  numero: z.string().min(1),
  bairro: z.string().min(1),
  cidade: z.string().min(1),
  estado: z.string().length(2).optional(),
  complemento: z.string().optional(),
  expectativaGeracao: z.number().optional(),
  capacidadeBombona: z.number().positive(),
  nivelAtualPct: z.number().min(0).max(100).optional(),
  statusBombona: z.enum([
    'VAZIA',
    'PARCIAL',
    'CHEIA',
    'EM_COLETA',
  ]).optional(),
});

export type CriarPontoColetaDTO = z.infer<typeof CriarPontoColetaDTOSchema>;