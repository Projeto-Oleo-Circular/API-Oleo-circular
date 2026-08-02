// presentation/controllers/SolicitacaoColetaController.ts
import { Request, Response } from 'express';
import { CriarSolicitacaoColetaUseCase } from '../../../domain/use-cases/solicitacao/CriarSolicitacaoColetaUseCase';

export class SolicitacaoColetaController {
  constructor(
    private readonly criarSolicitacaoColetaUseCase: CriarSolicitacaoColetaUseCase
  ) {}

  async criar(req: Request, res: Response) {
    try {
      // O ID do usuário logado vem do AuthMiddleware
      const parceiroLogadoId = req.user?.id;

      if (!parceiroLogadoId) {
        return res.status(401).json({ message: 'Usuário não autenticado.' });
      }

      // Executa o caso de uso passando o parceiro (para garantir a segurança) e os dados
      const result = await this.criarSolicitacaoColetaUseCase.execute(
        parceiroLogadoId,
        req.body
      );

      return res.status(201).json(result);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({ message: error.message });
      }
      return res.status(500).json({ message: 'Erro interno do servidor.' });
    }
  }
}