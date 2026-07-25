import {z} from 'zod';

export const CriarPontoColetaDTOSchema = z.object({
  parceiroId: z.string().uuid(),
  nomePontoColeta: z.string().min(1),
  cep: z.string().min(8).max(8),
  logradouro: z.string().min(1),
  numero: z.string().min(1),
  bairro: z.string().min(1),
  cidade: z.string().optional(),
  uf: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  capacidadeBombona: z.number().nullable(),
  nivelAtualPct: z.number().nullable(),
  statusBombona: z.string().min(1),
});

export type CriarPontoColetaDTO = z.infer<typeof CriarPontoColetaDTOSchema>;    