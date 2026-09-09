// backend/src/presentation/controllers/PontoColetaController.ts
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

      const parceiroIdAlvo = req.body.parceiroId ?? req.user?.id;

      const dados = {
        ...req.body,
        parceiroId: parceiroIdAlvo ? Number(parceiroIdAlvo) : undefined,
        statusAprovacaoPontoColeta: 'APROVADO',
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
      const userId = req.user?.id;
      const userRole = req.user?.tipo; 

      if (!userId) {
        res.status(401).json({ message: 'Usuário não autenticado' });
        return;
      }

      if (!id) {
        res.status(400).json({ message: 'O ID do ponto de coleta é obrigatório' });
        return;
      }

     
      let parceiroIdParaUso = Number(userId);

      if (userRole === 'admin') {
        const pontoExistente = await this.pontoColetaRepository.findById(Number(id));
        if (pontoExistente) {
          parceiroIdParaUso = pontoExistente.parceiroId; 
        }
      }

      const input = {
        id: isNaN(Number(id)) ? id : Number(id),
        parceiroId: parceiroIdParaUso,
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


  async listarPublicos(req: Request, res: Response): Promise<void> {
    try {
      const todosPontos = await this.pontoColetaRepository.findAll();
      
      let pontosFiltrados = todosPontos.filter(
        (ponto) => ponto.statusAprovacaoPontoColeta === 'APROVADO'
      );

      const { categoria, search } = req.query;

      if (categoria) {
        const categoriaStr = String(categoria).toLowerCase().trim();
        pontosFiltrados = pontosFiltrados.filter((ponto) => {
          const categoriaPonto = String(ponto.categoria).toLowerCase();
          return categoriaPonto.includes(categoriaStr);
        });
      }

      if (search) {
        const termo = String(search).toLowerCase().trim();
        pontosFiltrados = pontosFiltrados.filter((ponto) => {
          const nome = (ponto.nomePontoColeta || '').toLowerCase();
          const logradouro = (ponto.logradouro || '').toLowerCase();
          const bairro = (ponto.bairro || '').toLowerCase();
          const cidade = (ponto.cidade || '').toLowerCase();
          
          return nome.includes(termo) || 
                 logradouro.includes(termo) || 
                 bairro.includes(termo) || 
                 cidade.includes(termo);
        });
      }

      const page = Math.max(1, Number(req.query.page) || 1);
      const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
      const start = (page - 1) * limit;
      const end = start + limit;
      
      const itemsPaginados = pontosFiltrados.slice(start, end);

      const dadosPublicos = itemsPaginados.map((ponto) => 
        this.filtrarDadosPublicos(ponto)
      );

      res.status(200).json({
        items: dadosPublicos,
        total: pontosFiltrados.length,
        page,
        limit,
        totalPages: Math.ceil(pontosFiltrados.length / limit),
      });
    } catch (error) {
      console.error('Erro ao listar pontos públicos:', error);
      const message = error instanceof Error ? error.message : 'Erro interno do servidor';
      res.status(500).json({ message });
    }
  }

  // ============================================
  // MÉTODO PRIVADO - Filtra dados sensíveis
  // ============================================
  private filtrarDadosPublicos(ponto: any) {
    return {
      id: ponto.id,
      nomePontoColeta: ponto.nomePontoColeta,
      categoria: ponto.categoria,
      
      // Endereço público
      endereco: {
        logradouro: ponto.logradouro,
        numero: ponto.numero,
        bairro: ponto.bairro,
        cidade: ponto.cidade,
        estado: ponto.estado || null,
        cep: ponto.cep || null,
        complemento: ponto.complemento || null,
      },
      
      // Coordenadas (se tiver)
      localizacao: ponto.latitude && ponto.longitude ? {
        latitude: ponto.latitude,
        longitude: ponto.longitude,
      } : null,
      
      // Dados de capacidade
      capacidade: {
        bombona: ponto.capacidadeBombona,
        nivelAtual: ponto.nivelAtualPct || 0,
        status: ponto.statusBombona || 'VAZIA',
        expectativaGeracao: ponto.expectativaGeracao || null,
      },
      
      // Datas
      criadoEm: ponto.criadoEm || ponto.createdAt,
      atualizadoEm: ponto.atualizadoEm || ponto.updatedAt,
    };
  }
}