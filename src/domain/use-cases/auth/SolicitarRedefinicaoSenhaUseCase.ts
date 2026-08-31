// domain/use-cases/auth/SolicitarRedefinicaoSenhaUseCase.ts
import { IParceiroRepository } from '../../repositories/IParceiroRepository';
import { IPasswordResetTokenRepository } from '../../repositories/IPasswordResetTokenRepository';
import { EmailService } from '../../../infrastructure/services/Email/EmailService';
import { SolicitarRedefinicaoSenhaDTO } from '../../../shared/dtos/auth/SolicitarRedefinicaoSenhaDTO';
import crypto from 'crypto';

export class SolicitarRedefinicaoSenhaUseCase {
  constructor(
    private parceiroRepository: IParceiroRepository,
    private tokenRepository: IPasswordResetTokenRepository,
    private emailService: EmailService
  ) {}

  async execute(dados: SolicitarRedefinicaoSenhaDTO): Promise<void> {
    // 1. Verifica se o e-mail existe
    const parceiro = await this.parceiroRepository.findByEmail(dados.email);
    if (!parceiro) {
      // Por segurança, não informamos que o e-mail não existe
      return;
    }

    // 2. Gera token único (ex: UUID ou JWT)
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos

    // 3. Remove tokens antigos para este e-mail (opcional)
    await this.tokenRepository.deleteByEmail(dados.email);

    // 4. Salva token no banco
    await this.tokenRepository.create({
      email: dados.email,
      token,
      expiresAt,
      used: false,
    });

    // 5. Envia e-mail com link
    const resetLink = `${process.env.FRONTEND_URL}/redefinir-senha?token=${token}`;
    await this.emailService.sendPasswordResetEmail(dados.email, resetLink);
  }
}