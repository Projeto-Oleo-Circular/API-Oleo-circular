import { z } from 'zod';

export const ListarSolicitacoesColetaQuerySchema = z.object({
  nomePonto: z.string().trim().optional(),
  status: z.enum(['AGUARDANDO', 'AGENDADA', 'EM_ROTA', 'CONCLUIDA']).optional(),
  solicitante: z.string().trim().optional(),
  parceiro: z.string().trim().optional(),
  parceiroIndicadorId: z.preprocess(
    (value) => {
      if (typeof value === 'string' && value !== '') {
        return Number(value);
      }
      return value;
    },
    z.number().int().positive().optional(),
  ),
  capacidadeBombona: z.preprocess(
    (value) => {
      if (typeof value === 'string' && value !== '') {
        return Number(value);
      }
      return value;
    },
    z.number().positive().optional(),
  ),
  dataSolicitacao: z.string().trim().optional(),
  endereco: z.string().trim().optional(),
  page: z.preprocess(
    (value) => {
      if (typeof value === 'string' && value !== '') {
        return Number(value);
      }
      return value;
    },
    z.number().int().positive().optional(),
  ),
  limit: z.preprocess(
    (value) => {
      if (typeof value === 'string' && value !== '') {
        return Number(value);
      }
      return value;
    },
    z.number().int().positive().optional(),
  ),
});

export type ListarSolicitacoesColetaQueryDTO = z.infer<
  typeof ListarSolicitacoesColetaQuerySchema
>;
