import { z } from 'zod';
import { normalizeCategoriaPontoColeta } from '../../../domain/entities/PontoColeta';

const parseNumber = (value: unknown) => {
  if (typeof value === 'string' && value !== '') {
    return Number(value);
  }

  return value;
};

export const ListarPontosColetaQuerySchema = z.object({
  categoria: z.preprocess(
    (value) => {
      if (typeof value === 'string' || typeof value === 'number') {
        return normalizeCategoriaPontoColeta(value);
      }

      return parseNumber(value);
    },
    z
      .number()
      .int()
      .positive()
      .refine((value) => value >= 1 && value <= 7, {
        message: 'Categoria inválida',
      })
      .optional(),
  ),
  nomePonto: z.string().trim().optional(),
  statusBombona: z.string().trim().optional(),
  parceiro: z.string().trim().optional(),
  statusAprovacao: z.enum(['APROVADO', 'REJEITADO', 'PENDENTE']).optional(),
  page: z.preprocess(parseNumber, z.number().int().positive().optional()),
  limit: z.preprocess(parseNumber, z.number().int().positive().optional()),
});

export type ListarPontosColetaQueryDTO = z.infer<typeof ListarPontosColetaQuerySchema>;
