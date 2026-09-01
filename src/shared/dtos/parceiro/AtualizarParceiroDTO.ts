// shared/dtos/parceiro/UpdateParceiroDTO.ts
import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';

extendZodWithOpenApi(z);

export const AtualizarParceiroDTOSchema = z
  .object({
    nome: z
      .string()
      .trim()
      .min(3, 'Nome é obrigatório')
      .optional()
      .openapi({ example: 'update João da Silva' }),

    razaoSocial: z
      .string()
      .trim()
      .min(3, 'Razão Social é obrigatória')
      .optional()
      .openapi({ example: 'Empresa Exemplo LTDA' }),

    email: z
      .string()
      .trim()
      .email('E-mail inválido')
      .optional()
      .openapi({ example: 'joao@email.com' }),

    telefone: z
      .string()
      .trim()
      .regex(/^\d{10,11}$/, 'Telefone inválido')
      .optional()
      .openapi({ example: '73999999999' }),

    documento: z
      .string()
      .trim()
      .regex(/^\d+$/, 'Documento deve conter apenas números')
      .optional()
      .openapi({ example: '12345678901' }),

    responsavelLegal: z
      .string()
      .trim()
      .optional()
      .openapi({ example: 'Maria da Silva' }),

    redesSociais: z
      .array(z.string().trim())
      .optional()
      .openapi({ example: ['https://instagram.com/exemplo'] }),

    aceiteMarketing: z
      .boolean()
      .default(false)
      .optional()
      .openapi({ example: true }),

    tipoParceiro: z
      .enum(['INSTITUCIONAL', 'COMUNITARIO', 'SOLIDARIO'])
      .optional()
      .openapi({ example: 'SOLIDARIO' }),

    tipoPorte: z
      .enum(['PEQUENO', 'MEDIO', 'GRANDE'])
      .optional()
      .openapi({ example: 'PEQUENO' }),

    expectativaGeracao: z
      .number()
      .nonnegative()
      .optional()
      .openapi({ example: 50 }),

    observacao: z
      .string()
      .trim()
      .nullable()
      .optional()
      .openapi({ example: 'Observação adicional' }),

    // Campos de endereço (opcionais)
    cep: z
      .string()
      .trim()
      .regex(/^\d{8}$/, 'CEP inválido')
      .optional()
      .openapi({ example: '45700000' }),

    logradouro: z
      .string()
      .trim()
      .min(3, 'Logradouro é obrigatório')
      .optional()
      .openapi({ example: 'Rua Principal' }),

    numero: z
      .string()
      .trim()
      .min(1, 'Número é obrigatório')
      .optional()
      .openapi({ example: '100' }),

    bairro: z
      .string()
      .trim()
      .min(2, 'Bairro é obrigatório')
      .optional()
      .openapi({ example: 'Centro' }),

    cidade: z
      .string()
      .trim()
      .min(2, 'Cidade é obrigatória')
      .optional()
      .openapi({ example: 'Itapetinga' }),

    estado: z
      .string()
      .trim()
      .optional()
      .openapi({ example: 'BA' }),

    complemento: z
      .string()
      .trim()
      .optional()
      .openapi({ example: 'Sala 02' }),

    latitude: z
      .string()
      .trim()
      .optional()
      .transform((val) => (val ? Number(val) : undefined))
      .openapi({ example: '-23.550520' }),

    longitude: z
      .string()
      .trim()
      .optional()
      .transform((val) => (val ? Number(val) : undefined))
      .openapi({ example: '-46.633308' }),

    senhaAtual: z
      .string()
      .optional()
      .openapi({ example: 'senhaAntiga123' }),
      
    novaSenha: z
      .string()
      .optional()
      .openapi({ example: 'novaSenha123' }),
  })
  .superRefine((data, ctx) => {

    if (data.documento && data.documento.length !== 11 && data.documento.length !== 14) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['documento'],
        message: 'Documento deve ter 11 dígitos (CPF) ou 14 (CNPJ)',
      });
    }
  });

export type AtualizarParceiroDTO= z.infer<typeof AtualizarParceiroDTOSchema>;