// shared/dtos/auth/RedefinirSenhaDTO.ts
import { z } from 'zod';

export const RedefinirSenhaDTOSchema = z.object({
  token: z.string().min(1, 'Token é obrigatório'),
  novaSenha: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  confirmarSenha: z.string().min(6, 'Confirmação de senha é obrigatória'),
}).superRefine((data, ctx) => {
  if (data.novaSenha !== data.confirmarSenha) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['confirmarSenha'],
      message: 'As senhas não coincidem',
    });
  }
});

export type RedefinirSenhaDTO = z.infer<typeof RedefinirSenhaDTOSchema>;