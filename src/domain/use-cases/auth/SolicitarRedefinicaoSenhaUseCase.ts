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
    const parceiro = await this.parceiroRepository.findByEmail(dados.email);
    if (!parceiro) {
      return;
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); 

    await this.tokenRepository.deleteByEmail(dados.email);

    await this.tokenRepository.create({
      email: dados.email,
      token,
      expiresAt,
      used: false,
    });

    const resetLink = `${process.env.FRONTEND_URL}redefinir-senha?token=${token}`;
    console.log(resetLink)
    const nomeParceiro = parceiro.nome || parceiro.razaoSocial || 'Parceiro';

    const template = redefinirSenhaParceiroTemplate({
      nomeParceiro,
      resetLink,
    });

    await EmailService.send({
      to: dados.email,
      subject: template.subject,
      html: template.html,
    });
  }
}