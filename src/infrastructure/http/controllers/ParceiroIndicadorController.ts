import { Request, Response } from 'express';
import { ListarParceirosIndicadorAtivos } from '../../../domain/use-cases/parceiroIndicador/ListarParceirosIndicadorAtivos';

export class ParceiroIndicadorController {
  constructor(
    private readonly listarParceirosIndicadorAtivos: ListarParceirosIndicadorAtivos
  ) {}

  async listarAtivos(_req: Request, res: Response): Promise<void> {
    try {
      const parceiros = await this.listarParceirosIndicadorAtivos.execute();

      res.status(200).json(parceiros);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
        return;
      }

      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }
  
}