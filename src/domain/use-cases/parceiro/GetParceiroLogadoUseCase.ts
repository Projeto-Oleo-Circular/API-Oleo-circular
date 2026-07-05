import { IParceiroRepository } from '../../repositories/IParceiroRepository';

export class GetParceiroLogadoUseCase {
  constructor(private readonly parceiroRepository: IParceiroRepository) {}

  async execute(id: string) {
    const parceiro = await this.parceiroRepository.findById(id);

    if (!parceiro) {
      throw new Error('Parceiro não encontrado');
    }

    return {
      id: parceiro.id,
      nomeRazaoSocial: parceiro.nomeRazaoSocial,
      email: parceiro.email,
      tipoPessoa: parceiro.tipoPessoa,
      porte: parceiro.porte,
      statusAprovacaoParceiro: parceiro.statusAprovacaoParceiro,
    };
  }
}
