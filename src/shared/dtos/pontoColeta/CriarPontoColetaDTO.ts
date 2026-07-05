import {z} from 'zod';

export const CriarPontoColetaDTOSchema = z.object({
  parceiroId: z.string().uuid(),
  nomePontoColeta: z.string().min(1),
  cep: z.string().min(8).max(8),
  logradouro: z.string().min(1),
  numero: z.string().min(1),
  bairro: z.string().min(1),
  latitude: z.number().nullable(),
  longitude: z.number().nullable(),
  capacidadeBombona: z.number().nullable(),
  nivelAtualPct: z.number().nullable(),
  statusBombona: z.string().min(1),
  statusAprovacaoPontoColeta: z.string().min(1),
});

export type CriarPontoColetaDTO = z.infer<typeof CriarPontoColetaDTOSchema>;    