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

  async execute({ email, documento }: VerificarDisponibilidadeInput): Promise<VerificarDisponibilidadeOutput> {
    const [emailExists, documentoExists] = await Promise.all([
      email ? this.parceiroRepository.findByEmail(email) : Promise.resolve(null),
      documento ? this.parceiroRepository.findByDocumento(documento) : Promise.resolve(null),
    ]);

    return {
      emailDisponivel: email ? !emailExists : null,
      documentoDisponivel: documento ? !documentoExists : null,
    };
  }
}