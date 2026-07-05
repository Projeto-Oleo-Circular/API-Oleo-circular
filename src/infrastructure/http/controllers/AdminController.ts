import { Request, Response } from 'express';
import { LoginAdminUseCase } from '../../../domain/use-cases/admin/LoginAdminUseCase';
import { AprovarParceiroUseCase } from '../../../domain/use-cases/admin/AprovarParceiroUseCase';
import { AprovarPontoColetaUseCase } from '../../../domain/use-cases/admin/AprovarPontoColetaUseCase';
import { ListarParceirosPendentesUseCase } from '../../../domain/use-cases/admin/ListarParceirosPendentesUseCase';

export class AdminController {
  constructor(
    private readonly loginAdminUseCase: LoginAdminUseCase,
    private readonly aprovarParceiroUseCase: AprovarParceiroUseCase,
    private readonly aprovarPontoColetaUseCase: AprovarPontoColetaUseCase,
    private readonly listarParceirosPendentesUseCase: ListarParceirosPendentesUseCase,
  ) {}

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, senha } = req.body;
      const result = await this.loginAdminUseCase.execute(email, senha);
      res.status(200).json(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro inesperado';
      res.status(401).json({ message });
    }
  }

  async aprovarParceiro(req: Request, res: Response): Promise<void> {
    try {
      const parceiroId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const result = await this.aprovarParceiroUseCase.execute(parceiroId);
      res.status(200).json(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro inesperado';
      res.status(400).json({ message });
    }
  }

  async aprovarPonto(req: Request, res: Response): Promise<void> {
    try {
      const pontoId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const result = await this.aprovarPontoColetaUseCase.execute(pontoId);
      res.status(200).json(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro inesperado';
      res.status(400).json({ message });
    }
  }

  async listarPendentes(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.listarParceirosPendentesUseCase.execute();
      res.status(200).json(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro inesperado';
      res.status(400).json({ message });
    }
  }

  async me(req: Request, res: Response): Promise<void> {
    res.status(200).json({
      id: req.user?.id,
      email: req.user?.email,
      tipo: req.user?.tipo,
    });
  }
}
