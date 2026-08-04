import { z } from 'zod';
import { CriarPontoColetaDTOSchema } from './CriarPontoColetaDTO';

export const AtualizarPontoColetaDTOSchema = CriarPontoColetaDTOSchema
  .omit({ parceiroId: true }) 
  .partial()                 
  .extend({
    id: z.union([ z.number()]), 
  });

export type AtualizarPontoColetaDTO = z.infer<typeof AtualizarPontoColetaDTOSchema>;