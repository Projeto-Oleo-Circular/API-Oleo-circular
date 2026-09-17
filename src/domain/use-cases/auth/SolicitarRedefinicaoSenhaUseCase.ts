import { IParceiroRepository } from '../../repositories/IParceiroRepository';
import { IPasswordResetTokenRepository } from '../../repositories/IPasswordResetTokenRepository';
import { EmailService } from '../../../infrastructure/services/Email/EmailService';
import { SolicitarRedefinicaoSenhaDTO } from '../../../shared/dtos/auth/SolicitarRedefinicaoSenhaDTO';
import { redefinirSenhaParceiroTemplate } from '../../../infrastructure/services/Email/templates/auth/redefinirSenha.template';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

export class SolicitarRedefinicaoSenhaUseCase {
  constructor(
    private readonly parceiroRepository: IParceiroRepository,
    private readonly tokenRepository: IPasswordResetTokenRepository
  ) {}

  async execute(dados: SolicitarRedefinicaoSenhaDTO): Promise<void> {
    console.log('========================================');
    console.log('[PASSWORD_RESET] Iniciando solicitação');
    console.log('[PASSWORD_RESET] Email recebido:', dados.email);
    console.log('[PASSWORD_RESET] NODE_ENV:', process.env.NODE_ENV);
    console.log(
      '[PASSWORD_RESET] FRONTEND_URL configurada:',
      Boolean(process.env.FRONTEND_URL)
    );
    console.log(
      '[PASSWORD_RESET] FRONTEND_URL:',
      process.env.FRONTEND_URL || 'NÃO CONFIGURADA'
    );
    console.log('========================================');

    try {
      // ======================================================
      // 1. BUSCAR PARCEIRO
      // ======================================================

      console.log(
        '[PASSWORD_RESET] Buscando parceiro pelo email...'
      );

      const parceiro =
        await this.parceiroRepository.findByEmail(dados.email);

      if (!parceiro) {
        console.warn(
          '[PASSWORD_RESET] Parceiro não encontrado para o email:',
          dados.email
        );

        console.log(
          '[PASSWORD_RESET] Encerrando sem enviar email.'
        );

        return;
      }

      console.log('[PASSWORD_RESET] Parceiro encontrado.');
      console.log('[PASSWORD_RESET] Parceiro ID:', parceiro.id);
      console.log(
        '[PASSWORD_RESET] Nome:',
        parceiro.nome || parceiro.razaoSocial || 'Sem nome'
      );

      // ======================================================
      // 2. GERAR TOKEN
      // ======================================================

      console.log(
        '[PASSWORD_RESET] Gerando token de redefinição...'
      );

      const token =
        crypto.randomBytes(32).toString('hex');

      const expiresAt =
        new Date(
          Date.now() + 15 * 60 * 1000
        );

      console.log(
        '[PASSWORD_RESET] Token gerado com sucesso.'
      );

      console.log(
        '[PASSWORD_RESET] Expira em:',
        expiresAt.toISOString()
      );

      // NÃO LOGAR:
      // console.log(token);

      // ======================================================
      // 3. REMOVER TOKENS ANTIGOS
      // ======================================================

      console.log(
        '[PASSWORD_RESET] Removendo tokens antigos...'
      );

      await this.tokenRepository.deleteByEmail(
        dados.email
      );

      console.log(
        '[PASSWORD_RESET] Tokens antigos removidos.'
      );

      // ======================================================
      // 4. SALVAR NOVO TOKEN
      // ======================================================

      console.log(
        '[PASSWORD_RESET] Salvando novo token no banco...'
      );

      await this.tokenRepository.create({
        email: dados.email,
        token,
        expiresAt,
        used: false,
      });

      console.log(
        '[PASSWORD_RESET] Token salvo no banco.'
      );

      // ======================================================
      // 5. FRONTEND_URL
      // ======================================================

      if (!process.env.FRONTEND_URL) {
        console.error(
          '[PASSWORD_RESET] ERRO: FRONTEND_URL não está configurada.'
        );

        throw new Error(
          'FRONTEND_URL não configurada'
        );
      }

      // Evita problema:
      //
      // https://site.comredefinir-senha
      //
      // caso FRONTEND_URL não termine com "/".

      const frontendUrl =
        process.env.FRONTEND_URL.endsWith('/')
          ? process.env.FRONTEND_URL
          : `${process.env.FRONTEND_URL}/`;

      const resetLink =
        `${frontendUrl}redefinir-senha?token=${token}`;

      console.log(
        '[PASSWORD_RESET] Link de redefinição criado.'
      );

      console.log(
        '[PASSWORD_RESET] URL base:',
        frontendUrl
      );

      // NÃO logamos resetLink porque contém o token.

      // ======================================================
      // 6. TEMPLATE
      // ======================================================

      const nomeParceiro =
        parceiro.nome ||
        parceiro.razaoSocial ||
        'Parceiro';

      console.log(
        '[PASSWORD_RESET] Gerando template do email...'
      );

      const template =
        redefinirSenhaParceiroTemplate({
          nomeParceiro,
          resetLink,
        });

      console.log(
        '[PASSWORD_RESET] Template gerado.'
      );

      console.log(
        '[PASSWORD_RESET] Subject:',
        template.subject
      );

      console.log(
        '[PASSWORD_RESET] HTML gerado:',
        Boolean(template.html)
      );

      console.log(
        '[PASSWORD_RESET] Tamanho HTML:',
        template.html?.length || 0
      );

      // ======================================================
      // 7. ENVIAR EMAIL
      // ======================================================

      console.log('========================================');
      console.log('[PASSWORD_RESET] INICIANDO ENVIO EMAIL');
      console.log('[PASSWORD_RESET] Destinatário:', dados.email);
      console.log('[PASSWORD_RESET] Subject:', template.subject);
      console.log('========================================');

      const resultadoEmail =
        await EmailService.send({
          to: dados.email,
          subject: template.subject,
          html: template.html,
        });

      // ======================================================
      // 8. RESULTADO
      // ======================================================

      console.log('========================================');
      console.log('[PASSWORD_RESET] EMAIL SERVICE FINALIZADO');
      console.log(
        '[PASSWORD_RESET] Retorno EmailService:',
        resultadoEmail
      );
      console.log(
        '[PASSWORD_RESET] Destinatário:',
        dados.email
      );
      console.log('========================================');

    } catch (error) {
      console.error('========================================');
      console.error('[PASSWORD_RESET] ERRO');
      console.error('========================================');

      if (error instanceof Error) {
        console.error(
          '[PASSWORD_RESET] Mensagem:',
          error.message
        );

        console.error(
          '[PASSWORD_RESET] Nome:',
          error.name
        );

        console.error(
          '[PASSWORD_RESET] Stack:',
          error.stack
        );
      } else {
        console.error(
          '[PASSWORD_RESET] Erro desconhecido:',
          error
        );
      }

      console.error('========================================');

      throw error;
    }
  }
}