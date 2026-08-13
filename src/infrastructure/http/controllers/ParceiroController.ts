import { Request, Response } from 'express';
import axios from 'axios';

import { CriarParceiroUseCase } from '../../../domain/use-cases/parceiro/CriarParceiroUseCase';
import { LoginParceiroUseCase } from '../../../domain/use-cases/parceiro/LoginParceiroUseCase';
import { GetParceiroLogadoUseCase } from '../../../domain/use-cases/parceiro/GetParceiroLogadoUseCase';
import { VerificarDisponibilidadeUseCase } from '../../../domain/use-cases/parceiro/VerificarDisponibilidadeUseCase';
import { ListarSolicitacoesColetaUseCase } from '../../../domain/use-cases/solicitacao/ListarSolicitacoesColetaUseCase';

export class ParceiroController {
  constructor(
    private readonly criarParceiroUseCase: CriarParceiroUseCase,
    private readonly loginParceiroUseCase: LoginParceiroUseCase,
    private readonly getParceiroLogadoUseCase: GetParceiroLogadoUseCase,
    private readonly verificarDisponibilidadeUseCase: VerificarDisponibilidadeUseCase,
    private readonly listarSolicitacoesColetaUseCase: ListarSolicitacoesColetaUseCase
  ) {
    this.criar = this.criar.bind(this);
    this.login = this.login.bind(this);
    this.me = this.me.bind(this);
    this.logout = this.logout.bind(this);
    this.buscarCep = this.buscarCep.bind(this);
    this.verificarDisponibilidade =
      this.verificarDisponibilidade.bind(this);
    this.listar = this.listar.bind(this);
  }

  async criar(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.criarParceiroUseCase.execute(req.body);

      res.status(201).json(result);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Erro inesperado';

      res.status(400).json({ message });
    }
  }

  async login(req: Request, res: Response): Promise<void> {
  try {
    const result = await this.loginParceiroUseCase.execute(req.body);

    res.status(200).json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Erro inesperado';

    res.status(401).json({ message });
  }
}

  async me(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user?.id) {
        res.status(401).json({
          message: 'Usuário não autenticado',
        });
        return;
      }

      const parceiro =
        await this.getParceiroLogadoUseCase.execute(req.user.id);

      res.status(200).json(parceiro);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Erro inesperado';

      res.status(404).json({ message });
    }
  }

  async logout(req: Request, res: Response): Promise<void> {
    res.status(200).json({
      message:
        'Logout realizado com sucesso. Descarte o token no cliente.',
    });
  }

  async buscarCep(req: Request, res: Response): Promise<void> {
    try {
      const { cep } = req.params;

      const cepLimpo = cep.toLocaleString().replace(/\D/g, '');

      if (cepLimpo.length !== 8) {
        res.status(400).json({
          message: 'CEP inválido',
        });
        return;
      }

      const response = await axios.get(
        `https://viacep.com.br/ws/${cepLimpo}/json/`
      );

      if (response.data.erro) {
        res.status(404).json({
          message: 'CEP não encontrado',
        });
        return;
      }

      const endereco = {
        cep: response.data.cep.replace(/\D/g, ''),
        logradouro: response.data.logradouro,
        bairro: response.data.bairro,
        cidade: response.data.localidade,
        estado: response.data.uf,
        complemento: response.data.complemento,
      };

      res.status(200).json(endereco);
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);

      res.status(500).json({
        message: 'Erro ao buscar dados do CEP',
      });
    }
  }

  async verificarDisponibilidade(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const { email, documento } = req.query;

      const resultado =
        await this.verificarDisponibilidadeUseCase.execute({
          email:
            typeof email === 'string'
              ? email
              : undefined,

          documento:
            typeof documento === 'string'
              ? documento
              : undefined,
        });

      res.status(200).json(resultado);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({
          message: error.message,
        });
        return;
      }

      res.status(500).json({
        message: 'Erro interno do servidor',
      });
    }
  }

  async listar(req: Request, res: Response): Promise<void> {
    try {
      const parceiroLogadoId = req.user?.id;

      if (!parceiroLogadoId) {
        res.status(401).json({
          message: 'Usuário não autenticado.',
        });
        return;
      }

      const result =
        await this.listarSolicitacoesColetaUseCase.execute(
          parceiroLogadoId
        );

      res.status(200).json(result);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Erro inesperado';

      res.status(400).json({ message });
    }
  }
}