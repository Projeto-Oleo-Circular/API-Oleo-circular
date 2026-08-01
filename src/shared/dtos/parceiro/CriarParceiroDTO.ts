// shared/dtos/parceiro/CriarParceiroDTO.ts

import { z } from 'zod';

export const CriarParceiroDTOSchema = z
  .object({
    // ==========================
    // Dados de acesso
    // ==========================
    nomeRazaoSocial: z
      .string()
      .trim()
      .min(3, 'Nome/Razão Social é obrigatório'),

    email: z
      .string()
      .trim()
      .email('E-mail inválido'),

    senha: z
      .string()
      .min(6, 'Senha deve ter no mínimo 6 caracteres'),

    confirmarSenha: z
      .string()
      .min(6, 'Confirmação da senha é obrigatória'),

    telefone: z
      .string()
      .trim()
      .regex(/^\d{10,11}$/, 'Telefone inválido'),

    // ==========================
    // Tipo de pessoa
    // ==========================
    tipoPessoa: z.enum(['FISICA', 'JURIDICA'], {
      message: 'Tipo de pessoa é obrigatório',
    }),

    // ==========================
    // Perfil
    // ==========================
    tipoPerfil: z
      .enum(['INSTITUCIONAL', 'COMUNITARIO', 'SOLIDARIO'])
      .optional(),

    categoriaPerfil: z.string().optional(),

    // ==========================
    // Documento
    // ==========================
    documento: z
      .string()
      .trim()
      .regex(/^\d+$/, 'Documento deve conter apenas números'),

    responsavelLegalNome: z
      .string()
      .trim()
      .optional(),

    responsavelLegalCpf: z
      .string()
      .trim()
      .regex(/^\d+$/, 'CPF do responsável legal inválido')
      .optional(),

        nomeSocial: z.string().trim().optional(),
    redesSociais: z.array(z.string().trim()).optional(),
    // ==========================
    // Endereço
    // ==========================
    cep: z
      .string()
      .trim()
      .regex(/^\d{8}$/, 'CEP inválido'),

    logradouro: z
      .string()
      .trim()
      .min(3, 'Logradouro é obrigatório'),

    numero: z
      .string()
      .trim()
      .min(1, 'Número é obrigatório'),

    bairro: z
      .string()
      .trim()
      .min(2, 'Bairro é obrigatório'),

    cidade: z
      .string()
      .trim()
      .min(2, 'Cidade é obrigatória'),

    estado: z
      .string()
      .trim()
      .optional(),

    complemento: z
      .string()
      .trim()
      .optional(),

    latitude: z.number().optional(),

    longitude: z.number().optional(),

    // ==========================
    // Informações adicionais
    // ==========================
    aceiteMarketing: z.boolean().default(false),

    parceiroIndicadorId: z
      .number()
      .int()
      .positive()
      .optional(),

    tipoParceiro: z
      .enum(['INSTITUCIONAL', 'COMUNITARIO', 'SOLIDARIO'])
      .optional(),

    tipoPorte: z
      .enum(['PEQUENO', 'MEDIO', 'GRANDE'])
      .optional(),
    capacidadeBombona: z
      .number()
      .positive()
      .optional(),

   aceiteTermos: z
  .boolean()
  .refine((value) => value === true, {
    message: 'É necessário aceitar os termos de uso.',
    }),
  })
  .superRefine((data, ctx) => {
    // ==========================
    // Confirmação de senha
    // ==========================
    if (data.senha !== data.confirmarSenha) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['confirmarSenha'],
        message: 'As senhas não coincidem',
      });
    }

    // ==========================
    // Pessoa Física
    // ==========================
    if (data.tipoPessoa === 'FISICA') {
      if (data.documento.length !== 11) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['documento'],
          message: 'CPF deve possuir 11 dígitos',
        });
      }

      if (data.responsavelLegalNome) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['responsavelLegalNome'],
          message:
            'Pessoa Física não deve informar responsável legal',
        });
      }

      if (data.responsavelLegalCpf) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['responsavelLegalCpf'],
          message:
            'Pessoa Física não deve informar CPF do responsável legal',
        });
      }
    }

    // ==========================
    // Pessoa Jurídica
    // ==========================
    if (data.tipoPessoa === 'JURIDICA') {
      if (data.documento.length !== 14) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['documento'],
          message: 'CNPJ deve possuir 14 dígitos',
        });
      }

      if (!data.responsavelLegalNome?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['responsavelLegalNome'],
          message:
            'Nome do responsável legal é obrigatório',
        });
      }

      if (!data.responsavelLegalCpf?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['responsavelLegalCpf'],
          message:
            'CPF do responsável legal é obrigatório',
        });
      } else if (data.responsavelLegalCpf.length !== 11) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['responsavelLegalCpf'],
          message:
            'CPF do responsável legal deve possuir 11 dígitos',
        });
      }
    }
  });

export type CriarParceiroDTO = z.infer<typeof CriarParceiroDTOSchema>;