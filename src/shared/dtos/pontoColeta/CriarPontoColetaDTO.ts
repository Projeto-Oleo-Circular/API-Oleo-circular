import { z } from 'zod';

export const CriarPontoColetaDTOSchema = z.object({
  parceiroId: z.number(),
  nomePontoColeta: z.string().optional(), 
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