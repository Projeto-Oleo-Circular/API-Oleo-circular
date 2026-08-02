import { z } from 'zod';

export const CriarSolicitacaoColetaDTOSchema = z.object({
  pontoColetaId: z.number().positive('ID do ponto de coleta é obrigatório'),
  volumeInformado: z.number().positive('O volume informado deve ser maior que zero'),
  observacoes: z.string().optional(),
});

export type CriarSolicitacaoColetaDTO = z.infer<typeof CriarSolicitacaoColetaDTOSchema>;