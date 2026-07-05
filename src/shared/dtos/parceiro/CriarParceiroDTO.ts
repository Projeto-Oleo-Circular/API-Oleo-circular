import { z } from 'zod';

export const CriarParceiroDTOSchema = z
  .object({
    tipoPessoa: z.enum(['FISICA', 'JURIDICA']),
    nomeRazaoSocial: z.string().min(3),
    nomeSocial: z.string().min(3).optional(),
    email: z.string().email(),
    senha: z.string().min(6),
    documento: z.string().min(11).max(14),
    telefone: z.string().optional(),
    porte: z.enum(['PEQUENO', 'MEDIO', 'GRANDE']),
    aceiteMarketing: z.boolean(),
    canalAquisicaoId: z.number().int().positive().optional(),
    expectativaGeracao: z.number().positive().optional(),
    responsavelLegalNome: z.string().min(3).optional(),
    responsavelLegalCpf: z.string().length(11).optional(),
    cep: z.string(),
    logradouro: z.string().min(3),
    numero: z.string().min(1),
    bairro: z.string().min(2),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    capacidadeBombona: z.number().positive(),
  })
  .superRefine((data, ctx) => {
    if (data.tipoPessoa === 'JURIDICA') {
      if (!data.responsavelLegalNome?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['responsavelLegalNome'],
          message: 'responsavelLegalNome é obrigatório para pessoas jurídicas',
        });
      }

      if (!data.responsavelLegalCpf?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['responsavelLegalCpf'],
          message: 'responsavelLegalCpf é obrigatório para pessoas jurídicas',
        });
      }
    }

    if (data.tipoPessoa === 'FISICA' && data.nomeSocial && data.nomeSocial.trim().length < 3) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['nomeSocial'],
        message: 'nomeSocial deve ter pelo menos 3 caracteres quando informado',
      });
    }
  });

export type CriarParceiroDTO = z.infer<typeof CriarParceiroDTOSchema>;
