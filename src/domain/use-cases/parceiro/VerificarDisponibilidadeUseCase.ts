import { IParceiroRepository } from '../../repositories/IParceiroRepository';

interface VerificarDisponibilidadeInput {
  email?: string;
  documento?: string;
}

interface VerificarDisponibilidadeOutput {
  emailDisponivel: boolean | null;
  documentoDisponivel: boolean | null;
}

export class VerificarDisponibilidadeUseCase {
  constructor(private readonly parceiroRepository: IParceiroRepository) {}

  async execute({
    email,
    documento,
  }: VerificarDisponibilidadeInput): Promise<VerificarDisponibilidadeOutput> {

    const [parceiroPorEmail, parceiroPorDocumento] = await Promise.all([
      email
        ? this.parceiroRepository.findByEmail(email)
        : Promise.resolve(null),

      documento
        ? this.parceiroRepository.findByDocumento(documento)
        : Promise.resolve(null),
    ]);

    const emailDisponivel = email
      ? !parceiroPorEmail ||
        parceiroPorEmail.statusAprovacaoParceiro === 'REJEITADO'
      : null;

    const documentoDisponivel = documento
      ? !parceiroPorDocumento ||
        parceiroPorDocumento.statusAprovacaoParceiro === 'REJEITADO'
      : null;

    return {
      emailDisponivel,
      documentoDisponivel,
    };
  }
}