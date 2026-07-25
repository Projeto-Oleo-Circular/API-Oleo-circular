// shared/dtos/parceiro/CriarParceiroDTO.ts
import { z } from 'zod';

export const CriarParceiroDTOSchema = z
  .object({
    // Dados de Acesso (Tela 1)
    nomeRazaoSocial: z.string().min(3, 'Nome completo é obrigatório'),
    email: z.string().email('E-mail inválido'),
    senha: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
    confirmarSenha: z.string().min(6, 'Confirmação da senha é obrigatória'),
    telefone: z.string().min(10, 'Telefone inválido'),

    // Perfil (Tela 2)
    tipoPerfil: z.enum(['INSTITUCIONAL', 'COMUNITARIO', 'SOLIDARIO']).optional(),
    categoriaPerfil: z.string().optional(),

    // Informações (Tela 3)
    documento: z.string().min(11, 'CNPJ/CPF inválido').max(14),
    responsavelLegalNome: z.string().optional(),
    responsavelLegalCpf: z.string().optional(),

    // Endereço (Tela 3)
    cep: z.string().min(8, 'CEP inválido'),
    logradouro: z.string().min(3, 'Rua é obrigatória'),
    numero: z.string().min(1, 'Número é obrigatório'),
    bairro: z.string().min(2, 'Bairro é obrigatório'),
    cidade: z.string().min(2, 'Cidade é obrigatória'),
    estado: z.string().optional(),
    complemento: z.string().optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),

    // Volume e Marketing (Tela 4)
    aceiteMarketing: z.boolean().default(false),
    expectativaGeracao: z.number().positive('Quantidade estimada deve ser maior que 0').optional(),
    observacao: z.string().optional(),

    // Quem indicou (parceiro indicador)
    parceiroIndicadorId: z.number().int().positive().optional(),
    // meioConhecimentoId: z.number().int().positive().optional(),

    // Campos extras para compatibilidade com API
    tipoPessoa: z.enum(['FISICA', 'JURIDICA']).optional(),
    porte: z.enum(['PEQUENO', 'MEDIO', 'GRANDE']).optional(),
    capacidadeBombona: z.number().positive().optional(),
    aceiteTermos: z.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    // Validação: senhas devem ser iguais
    if (data.senha !== data.confirmarSenha) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['confirmarSenha'],
        message: 'As senhas não coincidem',
      });
    }

    // Validação: tipo de documento baseado no perfil
    if (data.tipoPerfil === 'INSTITUCIONAL' || data.tipoPerfil === 'COMUNITARIO') {
      if (data.documento.length !== 14) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['documento'],
          message: 'CNPJ inválido (deve ter 14 dígitos)',
        });
      }
      
      if (!data.responsavelLegalNome?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['responsavelLegalNome'],
          message: 'Nome do responsável legal é obrigatório',
        });
      }

      if (!data.responsavelLegalCpf?.trim() || data.responsavelLegalCpf.length !== 11) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['responsavelLegalCpf'],
          message: 'CPF do responsável legal é obrigatório',
        });
      }
    }

    if (data.tipoPerfil === 'SOLIDARIO') {
      if (data.documento.length !== 11) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['documento'],
          message: 'CPF inválido (deve ter 11 dígitos)',
        });
      }
    }
  });

export type CriarParceiroDTO = z.infer<typeof CriarParceiroDTOSchema>;