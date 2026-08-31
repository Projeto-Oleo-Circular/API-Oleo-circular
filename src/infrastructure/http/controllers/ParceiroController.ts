import { Request, Response } from 'express';
import axios from 'axios';
import { AtualizarParceiroDTOSchema } from '../../../shared/dtos/parceiro/AtualizarParceiroDTO';

import { CriarParceiroUseCase } from '../../../domain/use-cases/parceiro/CriarParceiroUseCase';
import { LoginParceiroUseCase } from '../../../domain/use-cases/parceiro/LoginParceiroUseCase';
import { GetParceiroLogadoUseCase } from '../../../domain/use-cases/parceiro/GetParceiroLogadoUseCase';
import { VerificarDisponibilidadeUseCase } from '../../../domain/use-cases/parceiro/VerificarDisponibilidadeUseCase';
import { ListarSolicitacoesColetaUseCase } from '../../../domain/use-cases/solicitacao/ListarSolicitacoesColetaUseCase';
import { DeletePontoColetaUseCase } from '../../../domain/use-cases/pontoColeta/DeletePontoColetaUseCase';
import { AtualizarParceiroUseCase} from '../../../domain/use-cases/parceiro/AtualizarParceiroUseCase';
import { SolicitarRedefinicaoSenhaUseCase } from '../../../domain/use-cases/auth/SolicitarRedefinicaoSenhaUseCase';
import { RedefinirSenhaUseCase } from '../../../domain/use-cases/auth/RedefinirSenhaUseCase';
import { SolicitarRedefinicaoSenhaDTOSchema } from '../../../shared/dtos/auth/SolicitarRedefinicaoSenhaDTO';
import { RedefinirSenhaDTOSchema } from '../../../shared/dtos/auth/RedefinirSenhaDTO';
export class ParceiroController {
  constructor(
    private readonly criarParceiroUseCase: CriarParceiroUseCase,
    private readonly loginParceiroUseCase: LoginParceiroUseCase,
    private readonly getParceiroLogadoUseCase: GetParceiroLogadoUseCase,
    private readonly verificarDisponibilidadeUseCase: VerificarDisponibilidadeUseCase,
    private readonly listarSolicitacoesColetaUseCase: ListarSolicitacoesColetaUseCase,
    private readonly deletePontoColetaUseCase: DeletePontoColetaUseCase,
    private readonly atualizarParceiro: AtualizarParceiroUseCase

  ) {
    this.criar = this.criar.bind(this);
    this.login = this.login.bind(this);
    this.me = this.me.bind(this);
    this.logout = this.logout.bind(this);
    this.buscarCep = this.buscarCep.bind(this);
    this.verificarDisponibilidade =
      this.verificarDisponibilidade.bind(this);
    this.listar = this.listar.bind(this);
    this.deletePontoColeta = this.deletePontoColeta.bind(this);
    this.atualizarPerfil = this.atualizarPerfil.bind(this);
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
   async deletePontoColeta(req: Request, res: Response): Promise<void> {
  try {
    const parceiroId = req.user?.id;
    if (!parceiroId) {
      res.status(401).json({ message: 'Usuário não autenticado.' });
      return;
    }

    // Extrai o id dos parâmetros e garante que seja uma string
    const idParam = req.params.id;
    if (!idParam) {
      res.status(400).json({ message: 'ID do ponto de coleta não fornecido.' });
      return;
    }

    // Se for um array, pega o primeiro elemento
    const idString = Array.isArray(idParam) ? idParam[0] : idParam;
    const pontoColetaId = parseInt(idString, 10);

    if (isNaN(pontoColetaId)) {
      res.status(400).json({ message: 'ID do ponto de coleta inválido.' });
      return;
    }

    await this.deletePontoColetaUseCase.execute(parceiroId, pontoColetaId);

    res.status(204).send();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro inesperado';

    if (message.includes('não encontrado')) {
      res.status(404).json({ message });
    } else if (message.includes('permissão')) {
      res.status(403).json({ message });
    } else {
      res.status(400).json({ message });
    }
  }
}

async atualizarPerfil(req: Request, res: Response): Promise<void> {
  try {
    const parceiroId = req.user?.id;
    if (!parceiroId) {
      res.status(401).json({ message: 'Usuário não autenticado.' });
      return;
    }

    // 1. Validar o body com o schema Zod
    const dadosValidados = AtualizarParceiroDTOSchema.parse(req.body);

    // 2. Executar o use case com os dados validados
    const parceiroAtualizado = await this.atualizarParceiro.execute(
      parceiroId,
      dadosValidados
    );

    res.status(200).json(parceiroAtualizado);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro inesperado';

    if (message.includes('não encontrado')) {
      res.status(404).json({ message });
    } else if (message.includes('permissão')) {
      res.status(403).json({ message });
    } else {
      res.status(400).json({ message });
    }
  }

}
async solicitarRedefinicaoSenha(req: Request, res: Response): Promise<void> {
  try {
    const dados = SolicitarRedefinicaoSenhaDTOSchema.parse(req.body);
    await this.solicitarRedefinicaoSenhaUseCase.execute(dados);
    res.status(200).json({ message: 'E-mail de redefinição enviado.' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ errors: error.errors });
      return;
    }
    res.status(400).json({ message: error instanceof Error ? error.message : 'Erro inesperado' });
  }
}

async redefinirSenha(req: Request, res: Response): Promise<void> {
  try {
    const dados = RedefinirSenhaDTOSchema.parse(req.body);
    await this.redefinirSenhaUseCase.execute(dados);
    res.status(200).json({ message: 'Senha redefinida com sucesso.' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ errors: error.errors });
      return;
    }
    res.status(400).json({ message: error instanceof Error ? error.message : 'Erro inesperado' });
  }
}
}