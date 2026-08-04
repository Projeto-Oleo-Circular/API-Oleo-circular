import { Request, Response } from 'express';
import { GetPontoColetaUseCase } from '../../../domain/use-cases/pontoColeta/GetPontoColetaUseCase';
import { AtualizarPontoColetaUseCase } from '../../../domain/use-cases/pontoColeta/UpdatePontoColetaUseCase';
import { CriarPontoColetaUseCase } from '../../../domain/use-cases/pontoColeta/CriarPontoColetaUseCase';
import { IPontoColetaRepository } from '../../../domain/repositories/IPontoColetaRepository';

export class PontoColetaController {
  constructor(
    private readonly getPontoColetaUseCase: GetPontoColetaUseCase,
    private readonly atualizarPontoColetaUseCase: AtualizarPontoColetaUseCase,
    private readonly criarPontoColetaUseCase: CriarPontoColetaUseCase,
    private readonly pontoColetaRepository: IPontoColetaRepository,
  ) {}

  async me(req: Request, res: Response): Promise<void> {
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

  async listMeus(req: Request, res: Response): Promise<void> {
    try {
      const parceiroId = req.user?.id;

      if (!parceiroId) {
        res.status(401).json({ message: 'Usuário não autenticado' });
        return;
      }

      const pontos = await this.pontoColetaRepository.findByParceiroId(parceiroId);

      const result = pontos.map((ponto) => ({
        ...ponto,
        categoria: ponto.categoria,
        categoriaNumero: typeof ponto.categoria === 'number' ? ponto.categoria : undefined,
      }));

      res.status(200).json(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro interno do servidor';
      res.status(400).json({ message });
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const dados = {
        ...req.body,
        parceiroId: req.user?.id,
      };

      const result = await this.criarPontoColetaUseCase.execute(dados);
      res.status(201).json(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro interno do servidor';
      res.status(400).json({ message });
    }
  }

 async update(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const parceiroId = req.user?.id;

    if (!parceiroId) {
      res.status(401).json({ message: 'Usuário não autenticado' });
      return;
    }

    if (!id) {
      res.status(400).json({ message: 'O ID do ponto de coleta é obrigatório' });
      return;
    }

    const input = {
      id: isNaN(Number(id)) ? id : Number(id),
      parceiroId: Number(parceiroId),
      ...req.body,
    };

    const pontoColetaAtualizado = await this.atualizarPontoColetaUseCase.execute(input);
    res.status(200).json(pontoColetaAtualizado);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro inesperado';

    if (message.includes('permissão')) {
      res.status(403).json({ message });
      return;
    }

    if (message.includes('não encontrado')) {
      res.status(404).json({ message });
      return;
    }

    res.status(400).json({ message });
  }
}
  async findById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const pontoColeta = await this.pontoColetaRepository.findById(Number(id));

      if (!pontoColeta) {
        res.status(404).json({ message: 'Ponto de coleta não encontrado' });
        return;
      }

      res.status(200).json(pontoColeta);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro interno do servidor';
      res.status(400).json({ message });
    }
  }
}