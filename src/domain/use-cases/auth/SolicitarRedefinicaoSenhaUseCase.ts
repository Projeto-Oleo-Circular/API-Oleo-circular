import { IParceiroRepository } from '../../repositories/IParceiroRepository';
import { IPasswordResetTokenRepository } from '../../repositories/IPasswordResetTokenRepository';
import { EmailService } from '../../../infrastructure/services/Email/EmailService';
import { SolicitarRedefinicaoSenhaDTO } from '../../../shared/dtos/auth/SolicitarRedefinicaoSenhaDTO';
import crypto from 'crypto';

export class SolicitarRedefinicaoSenhaUseCase {
  constructor(
    private readonly parceiroRepository: IParceiroRepository,
    private readonly tokenRepository: IPasswordResetTokenRepository
    // Removido o emailService daqui para usar o padrão estático igual ao CriarParceiroUseCase
  ) {}

  async execute(dados: SolicitarRedefinicaoSenhaDTO): Promise<void> {
    // 1. Verifica se o e-mail existe
    const parceiro = await this.parceiroRepository.findByEmail(dados.email);
    if (!parceiro) {
      // Por segurança, não informamos que o e-mail não existe
      return;
    }

    // 2. Gera token único
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos

    // 3. Remove tokens antigos para este e-mail
    await this.tokenRepository.deleteByEmail(dados.email);

    // 4. Salva token no banco
    await this.tokenRepository.create({
      email: dados.email,
      token,
      expiresAt,
      used: false,
    });

    // 5. Envia e-mail com link (usando o padrão estático igual ao CriarParceiroUseCase)
    const resetLink = `${process.env.FRONTEND_URL}/redefinir-senha?token=${token}`;
    const nomeParceiro = parceiro.nome || parceiro.razaoSocial || 'Parceiro';

    await EmailService.send({
      to: dados.email,
      subject: 'Redefinição de Senha',
      html: `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <h2>Olá, ${nomeParceiro}</h2>
          <p>Recebemos uma solicitação para redefinir a sua senha.</p>
          <p>Para criar uma nova senha, clique no link abaixo (o link expira em 15 minutos):</p>
          <p>
            <a href="${resetLink}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Redefinir Senha
            </a>
          </p>
          <p>Se você não solicitou isso, pode ignorar este e-mail.</p>
        </div>
      `,
    });
  }
}