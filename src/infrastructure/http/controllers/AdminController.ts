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
import { ListarPontosColetaQuerySchema } from '../../../shared/dtos/pontoColeta/ListarPontosColetaQueryDTO';
import { GetAlogadoUseCase} from '../../../domain/use-cases/admin/getUserAUseCase'
import{AdminManageUseCase } from '../../../domain/use-cases/admin/AdminManageUseCase'
import { CriarParceiroUseCase } from '../../../domain/use-cases/parceiro/CriarParceiroUseCase';
import { AtualizarAdminUseCase } from '../../../domain/use-cases/admin/AtualizarAdminUseCase';

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
    private readonly getUser : GetAlogadoUseCase,
    private readonly adminUseCase: AdminManageUseCase ,
    private readonly criarParceiroUseCase: CriarParceiroUseCase,
    private readonly atualizarAdminUseCase: AtualizarAdminUseCase

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
      const parceiroId = Array.isArray(req.params.id) ? Number(req.params.id[0]) : Number(req.params.id);
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
        Number(pontoId),
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
      const filters = ListarPontosColetaQuerySchema.parse(req.query);
      const result = await this.listarTodosPontosUseCase.execute(filters);
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
  try {
    // Obtém o ID do usuário autenticado
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Usuário não autenticado' });
      return;
    }

    // Busca os dados completos do admin usando o ID
    const admin = await this.getUser.execute(userId);
    if (!admin) {
      res.status(404).json({ message: 'Admin não encontrado' });
      return;
    }

    // Retorna os dados (incluindo email, que pode vir do req.user ou do admin)
   res.status(200).json({
  id: admin.id,
  email: admin.email, // string
  nome: admin.nome,
  nivelAcesso: admin.nivelAcesso,
  ultimoAcesso: admin.ultimoAcesso,
});
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao carregar perfil' });
  }
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
    async criarAdmin(req: Request, res: Response) {
    try {
      const admin = await this.adminUseCase.criarAdmin(req.body);
      res.status(201).json(admin);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro inesperado';
      res.status(400).json({ message });
    }
}

  async alterarSenhaAdmin(req: Request, res: Response) {
    try {
      const { id, senhaAtual, novaSenha } = req.body;
      await this.adminUseCase.alterarSenhaAdmin(id, senhaAtual, novaSenha);
      res.json({ message: 'Senha alterada com sucesso' });
    } catch (error) {
     const message = error instanceof Error ? error.message : 'Erro inesperado';
      res.status(400).json({ message });
    
    }
  }

  // PARCEIRO
  async criarParceiro(req: Request, res: Response) {
    try {
      const parceiro = await this.criarParceiroUseCase.execute(req.body)
      res.status(201).json(parceiro);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro inesperado';
      res.status(400).json({ message });
    }
  }

  async atualizarParceiro(req: Request, res: Response) {
    try {
      const parceiro = await this.adminUseCase.atualizarParceiro(Number(req.params.id), req.body);
      res.json(parceiro);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro inesperado';
      res.status(400).json({ message });
    }
  }

  async excluirParceiro(req: Request, res: Response) {
    try {
      await this.adminUseCase.excluirParceiro(Number(req.params.id));
      res.status(204).send();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro inesperado';
      res.status(400).json({ message });
    }
  }

  // ===================== PARCEIROS INDICADORES (NOVOS) =====================
  async criarIndicador(req: Request, res: Response): Promise<void> {
    try {
      const indicador = await this.adminUseCase.criarIndicador(req.body);
      res.status(201).json(indicador);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro inesperado';
      res.status(400).json({ message });
    }
  }


  async listarIndicadoresAtivos(req: Request, res: Response): Promise<void> {
    try {
      const indicadores = await this.adminUseCase.listarIndicadoresAtivos();
      res.status(200).json(indicadores);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro inesperado';
      res.status(400).json({ message });
    }
  }

  async atualizarIndicador(req: Request, res: Response): Promise<void> {
    try {
      const indicador = await this.adminUseCase.atualizarIndicador(Number(req.params.id), req.body);
      res.json(indicador);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro inesperado';
      res.status(400).json({ message });
    }
  }

  async excluirIndicador(req: Request, res: Response): Promise<void> {
    try {
      await this.adminUseCase.excluirIndicador(Number(req.params.id));
      res.status(204).send();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro inesperado';
      res.status(400).json({ message });
    }
  }
  async atualizarAdmin(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { nome, email, senhaAtual, novaSenha, nivelAcesso } = req.body;

      const adminAtualizado = await this.atualizarAdminUseCase.execute(Number(id), {
        nome,
        email,
        senhaAtual,
        novaSenha,
        nivelAcesso,
      });

      res.status(200).json({
        id: adminAtualizado.id,
        nome: adminAtualizado.nome,
        email: adminAtualizado.email,
        nivelAcesso: adminAtualizado.nivelAcesso,
        atulizadoEm: adminAtualizado.atulizadoEm,
      });
    } catch (error: any) {
      const message = error.message || 'Erro inesperado ao atualizar administrador';
      res.status(400).json({ message });
    }
  }
  }

