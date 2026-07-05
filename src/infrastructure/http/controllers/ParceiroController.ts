import { Request, Response } from 'express';
import { GetParceiroLogadoUseCase } from '../../../domain/use-cases/parceiro/GetParceiroLogadoUseCase';

export class ParceiroController {
  constructor(private readonly getParceiroLogadoUseCase: GetParceiroLogadoUseCase) {}

  async me(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user?.id) {
        res.status(401).json({ message: 'Usuário não autenticado' });
        return;
      }

      const parceiro = await this.getParceiroLogadoUseCase.execute(req.user.id);
      res.status(200).json(parceiro);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro inesperado';
      res.status(404).json({ message });
    }
  }
}
