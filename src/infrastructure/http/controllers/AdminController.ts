import { Request, Response } from 'express';
import { LoginAdminUseCase } from '../../../domain/use-cases/admin/LoginAdminUseCase';
import { AtualizarStatusParceiroUseCase } from '../../../domain/use-cases/admin/AtualizarStatusParceiroUseCase';
import { AtualizarStatusPontoColetaUseCase } from '../../../domain/use-cases/admin/AtualizarStatusPontoColetaUseCase';
import { ListarParceirosPendentesUseCase } from '../../../domain/use-cases/admin/ListarParceirosPendentesUseCase';
import { ListarTodosParceirosUseCase } from '../../../domain/use-cases/admin/ListarTodosParceirosUseCase';
import { ListarTodosPontosUseCase } from '../../../domain/use-cases/admin/ListarTodosPontosUseCase';
import { AtualizarStatusSolicitacaoUseCase } from '../../../domain/use-cases/solicitacao/AtualizarStatusSolicitacaoUseCase';
import { ListarTodasSolicitacoesColetaUseCase } from '../../../domain/use-cases/solicitacao/ListarTodasSolicitacoesColetaUseCase';
import { ListarSolicitacoesColetaQuerySchema } from '../../../shared/dtos/solicitacaoColeta/ListarSolicitacoesColetaQueryDTO';

export class AdminController {
  constructor(
    private readonly loginAdminUseCase: LoginAdminUseCase,
    private readonly atualizarStatusParceiroUseCase: AtualizarStatusParceiroUseCase,
    private readonly atualizarStatusPontoColetaUseCase: AtualizarStatusPontoColetaUseCase,
    private readonly listarParceirosPendentesUseCase: ListarParceirosPendentesUseCase,
    private readonly listarTodosParceirosUseCase: ListarTodosParceirosUseCase,
    private readonly listarTodosPontosUseCase: ListarTodosPontosUseCase,
    private readonly atualizarStatusSolicitacaoUseCase: AtualizarStatusSolicitacaoUseCase,
    private readonly listarTodasSolicitacoesColetaUseCase: ListarTodasSolicitacoesColetaUseCase,
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

  async atualizarStatusParceiro(req: Request, res: Response): Promise<void> {
    try {
      const parceiroId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const { status, observacao } = req.body;

      const allowedStatuses = ['APROVADO', 'REJEITADO', 'PENDENTE'] as const;
      if (!allowedStatuses.includes(status)) {
        throw new Error('Status inválido. Use APROVADO, REJEITADO ou PENDENTE.');
      }

      const result = await this.atualizarStatusParceiroUseCase.execute(
        parceiroId,
        status,
        observacao,
      );

      res.status(200).json(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro inesperado';
      res.status(400).json({ message });
    }
  }

  async atualizarStatusPonto(req: Request, res: Response): Promise<void> {
    try {
      const pontoId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const { status, observacao } = req.body;

      const allowedStatuses = ['APROVADO', 'REJEITADO', 'PENDENTE'] as const;
      if (!allowedStatuses.includes(status)) {
        throw new Error('Status inválido. Use APROVADO, REJEITADO ou PENDENTE.');
      }

      const result = await this.atualizarStatusPontoColetaUseCase.execute(
        pontoId,
        status,
        observacao,
      );

      res.status(200).json(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro inesperado';
      res.status(400).json({ message });
    }
  }

  async listarParceiros(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.listarTodosParceirosUseCase.execute();
      res.status(200).json(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro inesperado';
      res.status(400).json({ message });
    }
  }

  async listarPontos(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.listarTodosPontosUseCase.execute();
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

  async atualizarStatus(req: Request, res: Response): Promise<void> {
    try {
      const solicitacaoId = Number(req.params.id);
      if (Number.isNaN(solicitacaoId)) {
        res.status(400).json({ message: 'ID da solicitação inválido.' });
        return;
      }

      const result = await this.atualizarStatusSolicitacaoUseCase.execute(
        solicitacaoId,
        req.body,
      );

      res.status(200).json(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro inesperado';
      res.status(400).json({ message });
    }
  }

    async listarSolicitacoes(req: Request, res: Response): Promise<void> {
    try {
      const filters = ListarSolicitacoesColetaQuerySchema.parse(req.query);
      const result = await this.listarTodasSolicitacoesColetaUseCase.execute(filters);
      res.status(200).json(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro inesperado';
      res.status(400).json({ message });
    }
  }
}
