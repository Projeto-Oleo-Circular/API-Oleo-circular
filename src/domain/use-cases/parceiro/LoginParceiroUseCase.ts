import { IParceiroRepository } from '../../repositories/IParceiroRepository';
import { LoginDTO, LoginDTOSchema } from '../../../shared/dtos/parceiro/LoginDTO';
import { compare } from '../../../shared/utils/hash-utils';
import { generate } from '../../../shared/utils/jwt-utils';

export class LoginParceiroUseCase {
  constructor(private readonly parceiroRepository: IParceiroRepository) {}

  async execute(input: LoginDTO) {
    const parsed = LoginDTOSchema.safeParse(input);

    if (!parsed.success) {
      throw new Error(parsed.error.issues.map((issue) => issue.message).join(', '));
    }

    const data = parsed.data;
    const parceiro = await this.parceiroRepository.findByEmail(data.email);

    if (!parceiro) {
      throw new Error('Credenciais inválidas');
    }

    const senhaValida = await compare(data.senha, parceiro.senhaHash);
    if (!senhaValida) {
      throw new Error('Credenciais inválidas');
    }

    if (parceiro.statusAprovacaoParceiro !== 'APROVADO') {
      throw new Error('Seu cadastro ainda está pendente de aprovação pela cooperativa.');
    }

    const token = generate({ id: parceiro.id, email: parceiro.email, tipo: 'parceiro' });

    return {
      token,
      parceiro: {
        id: parceiro.id,
        nomeRazaoSocial: parceiro.nomeRazaoSocial,
        email: parceiro.email,
        statusAprovacaoParceiro: parceiro.statusAprovacaoParceiro,
      },
    };
  }
}
