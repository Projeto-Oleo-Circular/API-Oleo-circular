// domain/use-cases/auth/RedefinirSenhaUseCase.ts
import { IParceiroRepository } from '../../repositories/IParceiroRepository';
import { IPasswordResetTokenRepository } from '../../repositories/IPasswordResetTokenRepository';
import { RedefinirSenhaDTO } from '../../../shared/dtos/auth/RedefinirSenhaDTO';
import bcrypt from 'bcrypt';

export class RedefinirSenhaUseCase {
  constructor(
    private parceiroRepository: IParceiroRepository,
    private tokenRepository: IPasswordResetTokenRepository
  ) {}

  async execute(dados: RedefinirSenhaDTO): Promise<void> {
    // 1. Buscar token válido
    const tokenData = await this.tokenRepository.findByToken(dados.token);
    if (!tokenData) {
      throw new Error('Token inválido ou expirado.');
    }

    // 2. Verificar se token já foi usado ou expirou
    if (tokenData.used) {
      throw new Error('Token já foi utilizado.');
    }
    if (new Date() > tokenData.expiresAt) {
      throw new Error('Token expirado.');
    }

    // 3. Buscar parceiro pelo e-mail do token
    const parceiro = await this.parceiroRepository.findByEmail(tokenData.email);
    if (!parceiro) {
      throw new Error('Usuário não encontrado.');
    }

    // 4. Hash da nova senha
    const senhaHash = await bcrypt.hash(dados.novaSenha, 10);

    // 5. Atualizar senha do parceiro (usando o método update do repositório)
    await this.parceiroRepository.update(parceiro.id, { senhaHash } as any);

    // 6. Marcar token como usado
    await this.tokenRepository.markAsUsed(tokenData.id);
  }
}