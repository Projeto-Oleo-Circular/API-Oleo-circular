import { Request, Response } from 'express';
import { GetParceiroLogadoUseCase } from '../../../domain/use-cases/parceiro/GetParceiroLogadoUseCase';
import { VerificarDisponibilidadeUseCase } from '../../../domain/use-cases/parceiro/VerificarDisponibilidadeUseCase';
import { ListarSolicitacoesColetaUseCase } from '../../../domain/use-cases/solicitacao/ListarSolicitacoesColetaUseCase';

export class ParceiroController {
  constructor(
    private readonly getParceiroLogadoUseCase: GetParceiroLogadoUseCase,
    private readonly verificarDisponibilidadeUseCase: VerificarDisponibilidadeUseCase,
    private readonly listarSolicitacoesColetaUseCase: ListarSolicitacoesColetaUseCase
  ) {
    // Garante o binding dos métodos caso sejam passados como reference por desestruturação nas rotas do Express
    this.me = this.me.bind(this);
    this.verificarDisponibilidade = this.verificarDisponibilidade.bind(this);
    this.listar = this.listar.bind(this);
  }

  async me(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user?.id) {
        res.status(401).json({ message: 'Usuário não autenticado' });
        return;
      }

      const parceiro = await this.getParceiroLogadoUseCase.execute(req.user.id);
      res.status(200).json(parceiro);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Erro inesperado';

      res.status(404).json({ message });
    }
  }

  async verificarDisponibilidade(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const { email, documento } = req.query;

      if (!this.verificarDisponibilidadeUseCase) {
        res.status(500).json({ message: 'Erro interno: Dependência não inicializada' });
        return;
      }

      const resultado =
        await this.verificarDisponibilidadeUseCase.execute({
          email: typeof email === 'string' ? email : undefined,
          documento:
            typeof documento === 'string' ? documento : undefined,
        });

      res.status(200).json(resultado);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
        return;
      }

      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

   async listar(req: Request, res: Response): Promise<void> {
    try {
      const parceiroLogadoId = req.user?.id;
      if (!parceiroLogadoId) {
        res.status(401).json({ message: 'Usuário não autenticado.' });
        return;
      }

      const result = await this.listarSolicitacoesColetaUseCase.execute(parceiroLogadoId);
      res.status(200).json(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro inesperado';
      res.status(400).json({ message });
    }
}}