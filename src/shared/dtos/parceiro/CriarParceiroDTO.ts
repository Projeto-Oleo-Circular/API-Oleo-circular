// shared/dtos/parceiro/CriarParceiroDTO.ts
import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';

extendZodWithOpenApi(z);
export const CriarParceiroDTOSchema = z
  .object({
    nome: z
      .string()
      .trim()
      .min(3, 'Nome é obrigatório')
      .openapi({
        example: 'João da Silva',
        description: 'Nome do parceiro',
      }),

    razaoSocial: z
      .string()
      .trim()
      .min(3, 'Razão Social é obrigatória')
      .optional()
      .openapi({
        example: 'Empresa Exemplo LTDA',
        description: 'Razão social da empresa',
      }),

    email: z
      .string()
      .trim()
      .email('E-mail inválido')
      .openapi({
        example: 'joao@email.com',
      }),

    senha: z
      .string()
      .min(6, 'Senha deve ter no mínimo 6 caracteres')
      .openapi({
        example: '123456',
      }),

    confirmarSenha: z
      .string()
      .min(6, 'Confirmação da senha é obrigatória')
      .openapi({
        example: '123456',
      }),

    telefone: z
      .string()
      .trim()
      .regex(/^\d{10,11}$/, 'Telefone inválido')
      .openapi({
        example: '73999999999',
      }),

    tipoPessoa: z
      .enum(['FISICA', 'JURIDICA'])
      .openapi({
        example: 'FISICA',
      }),

    tipoPerfil: z
      .enum(['INSTITUCIONAL', 'COMUNITARIO', 'SOLIDARIO'])
      .optional()
      .openapi({
        example: 'SOLIDARIO',
      }),

    categoriaPerfil: z
      .string()
      .optional()
      .openapi({
        example: 'Cooperativa',
      }),

    categoria: z
      .union([
        z.literal(1),
        z.literal(2),
        z.literal(3),
        z.literal(4),
        z.literal(5),
        z.literal(6),
        z.literal(7),
      ])
      .optional()
      .openapi({
        example: 1,
      }),

    documento: z
      .string()
      .trim()
      .regex(/^\d+$/, 'Documento deve conter apenas números')
      .openapi({
        example: '12345678901',
        description: 'CPF ou CNPJ sem pontuação',
      }),

    responsavelLegal: z
      .string()
      .trim()
      .optional()
      .openapi({
        example: 'Maria da Silva',
      }),

    redesSociais: z
      .array(z.string().trim())
      .optional()
      .openapi({
        example: [
          'https://instagram.com/exemplo',
        ],
      }),

    cep: z
      .string()
      .trim()
      .regex(/^\d{8}$/, 'CEP inválido')
      .openapi({
        example: '45700000',
      }),

    logradouro: z
      .string()
      .trim()
      .min(3, 'Logradouro é obrigatório')
      .openapi({
        example: 'Rua Principal',
      }),

    numero: z
      .string()
      .trim()
      .min(1, 'Número é obrigatório')
      .openapi({
        example: '100',
      }),

    bairro: z
      .string()
      .trim()
      .min(2, 'Bairro é obrigatório')
      .openapi({
        example: 'Centro',
      }),

    cidade: z
      .string()
      .trim()
      .min(2, 'Cidade é obrigatória')
      .openapi({
        example: 'Itapetinga',
      }),

    estado: z
      .string()
      .trim()
      .optional()
      .openapi({
        example: 'BA',
      }),

    complemento: z
      .string()
      .trim()
      .optional()
      .openapi({
        example: 'Sala 02',
      }),

    aceiteMarketing: z
      .boolean()
      .default(false)
      .openapi({
        example: false,
      }),

    parceiroIndicadorId: z
      .number()
      .int()
      .positive()
      .nullable()
      .optional()
      .openapi({
        example: 1,
      }),

    outroParceiro: z
      .string()
      .trim()
      .nullable()
      .optional()
      .openapi({
        example: 'Outro parceiro',
      }),

    comoConheceu: z
      .string()
      .trim()
      .nullable()
      .optional()
      .openapi({
        example: 'Indicação',
      }),

    observacao: z
      .string()
      .trim()
      .nullable()
      .optional()
      .openapi({
        example: 'Observação adicional',
      }),

    tipoParceiro: z
      .enum(['INSTITUCIONAL', 'COMUNITARIO', 'SOLIDARIO'])
      .optional()
      .openapi({
        example: 'SOLIDARIO',
      }),

    tipoPorte: z
      .enum(['PEQUENO', 'MEDIO', 'GRANDE'])
      .optional()
      .openapi({
        example: 'PEQUENO',
      }),

    capacidadeBombona: z
      .number()
      .positive()
      .optional()
      .openapi({
        example: 100,
      }),

    expectativaGeracao: z
      .number()
      .nonnegative()
      .optional()
      .openapi({
        example: 50,
      }),

    nivelAtualPct: z
      .number()
      .min(0)
      .max(100)
      .optional()
      .openapi({
        example: 30,
      }),

    aceiteTermos: z
      .boolean()
      .refine((value) => value === true, {
        message: 'É necessário aceitar os termos de uso.',
      })
      .openapi({
        example: true,
      }),
      latitude: z
  .string()
  .trim()
  .optional()
  .transform((val) => (val ? Number(val) : null)) // converte para número se preenchido
  .openapi({
    example: "-23.550520", // São Paulo
  }),
longitude: z
  .string()
  .trim()
  .optional()
  .transform((val) => (val ? Number(val) : null))
  .openapi({
    example: "-46.633308",
  }),
  })
  .superRefine((data, ctx) => {
    if (data.senha !== data.confirmarSenha) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['confirmarSenha'],
        message: 'As senhas não coincidem',
      });
    }

    if (data.tipoPessoa === 'FISICA') {
      if (data.documento.length !== 11) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['documento'],
          message: 'CPF deve possuir 11 dígitos',
        });
      }

      if (data.responsavelLegal) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['responsavelLegal'],
          message:
            'Pessoa Física não deve informar responsável legal',
        });
      }
    }

    if (data.tipoPessoa === 'JURIDICA') {
      if (data.documento.length !== 14) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['documento'],
          message: 'CNPJ deve possuir 14 dígitos',
        });
      }

      if (!data.responsavelLegal?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['responsavelLegal'],
          message:
            'Nome do responsável legal é obrigatório',
        });
      }
    }
  });

export type CriarParceiroDTO = z.infer<
  typeof CriarParceiroDTOSchema
>;