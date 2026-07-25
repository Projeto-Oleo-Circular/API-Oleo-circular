import {z} from 'zod';

export const CriarPontoColetaDTOSchema = z.object({
  parceiroId: z.string().uuid(),
  nomePontoColeta: z.string().min(1),
  cep: z.string().min(8).max(8),
  logradouro: z.string().min(1),
  numero: z.string().min(1),
  bairro: z.string().min(1),
  cidade: z.string().min(1),
  estado: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  capacidadeBombona: z.number(),
  nivelAtualPct: z.number(),
 statusBombona: z.enum([
  'VAZIA',
  'PARCIAL',
  'CHEIA',
  'EM_COLETA',
]),
  statusAprovacaoPontoColeta: z.string().min(1),
});

export type CriarPontoColetaDTO = z.infer<typeof CriarPontoColetaDTOSchema>;    