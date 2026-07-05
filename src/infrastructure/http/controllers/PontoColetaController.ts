import {request, response} from 'express';
import { GetPontoColetaUseCase } from '../../../domain/use-cases/pontoColeta/GetPontoColetaUseCase';

export class PontoColetaController {
  constructor(private readonly getPontoColetaUseCase: GetPontoColetaUseCase) {}

  async me(req: typeof request, res: typeof response): Promise<void> {
    try {
      if (!req.user?.id) {
        res.status(401).json({ message: 'Usuário não autenticado' });
        return;
      }

      const pontoColeta = await this.getPontoColetaUseCase.execute(req.user.id);
      res.status(200).json(pontoColeta);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro inesperado';
      res.status(404).json({ message });
    }
  }
}