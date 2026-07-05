import { IAdminRepository } from '../../repositories/IAdminRepository';
import { compare } from '../../../shared/utils/hash-utils';
import { generate } from '../../../shared/utils/jwt-utils';

export class LoginAdminUseCase {
  constructor(private readonly adminRepository: IAdminRepository) {}

  async execute(email: string, senha: string) {
    const admin = await this.adminRepository.findByEmail(email);

    if (!admin) {
      throw new Error('Credenciais inválidas');
    }

    const senhaValida = await compare(senha, admin.senhaHash);
    if (!senhaValida) {
      throw new Error('Credenciais inválidas');
    }

    const token = generate({ id: admin.id, email: admin.email, tipo: 'admin' });

    return {
      token,
      admin: {
        id: admin.id,
        nome: admin.nome,
        email: admin.email,
        nivelAcesso: admin.nivelAcesso,
      },
    };
  }
}
