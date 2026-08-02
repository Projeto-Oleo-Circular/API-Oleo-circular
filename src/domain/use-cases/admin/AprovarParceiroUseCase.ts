import { IParceiroRepository } from '../../repositories/IParceiroRepository';

export class AprovarParceiroUseCase {
  constructor(private readonly parceiroRepository: IParceiroRepository) {}

  async execute(parceiroId: number) {
    const parceiro = await this.parceiroRepository.findById(parceiroId);

    if (!parceiro) {
      throw new Error('Parceiro não encontrado');
    }

    const parceiroAprovado = await this.parceiroRepository.update(parceiroId, {
      statusAprovacaoParceiro: 'APROVADO',
    });

    return {
      id: parceiroAprovado.id,
      nomeRazaoSocial: parceiroAprovado.nomeRazaoSocial,
      email: parceiroAprovado.email,
      statusAprovacaoParceiro: parceiroAprovado.statusAprovacaoParceiro,
    };
  }
}
