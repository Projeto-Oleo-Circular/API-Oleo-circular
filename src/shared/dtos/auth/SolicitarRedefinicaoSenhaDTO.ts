// shared/dtos/auth/SolicitarRedefinicaoSenhaDTO.ts
import { z } from 'zod';

export const SolicitarRedefinicaoSenhaDTOSchema = z.object({
  email: z.string().email('E-mail inválido'),
});

export type SolicitarRedefinicaoSenhaDTO = z.infer<typeof SolicitarRedefinicaoSenhaDTOSchema>;