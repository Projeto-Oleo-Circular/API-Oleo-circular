import { z } from 'zod';

export const AtualizarStatusSolicitacaoDTOSchema = z
  .object({
    status: z.enum(['AGUARDANDO', 'AGENDADA', 'EM_ROTA', 'CONCLUIDA']),
    volumeColetado: z
      .number()
      .positive('O volume coletado deve ser maior que zero')
      .optional(),
    dataAgendamento: z.string().optional(),
    observacoes: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.status === 'AGENDADA') {
      if (!data.dataAgendamento) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'dataAgendamento é obrigatória quando o status for AGENDADA',
          path: ['dataAgendamento'],
        });
      } else if (isNaN(Date.parse(data.dataAgendamento))) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'dataAgendamento deve ser uma data válida em formato ISO',
          path: ['dataAgendamento'],
        });
      }
    }

    if (data.status === 'CONCLUIDA' && data.volumeColetado === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'volumeColetado é obrigatório quando o status for CONCLUIDA',
        path: ['volumeColetado'],
      });
    }
  });

export type AtualizarStatusSolicitacaoDTO = z.infer<
  typeof AtualizarStatusSolicitacaoDTOSchema
>;
