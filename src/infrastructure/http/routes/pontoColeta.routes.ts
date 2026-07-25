import { Router } from 'express';
import { SupabasePontoColetaRepository } from '../../../infrastructure/repositories/SupabasePontoColetaRepository';
import { SupabaseParceiroRepository } from '../../../infrastructure/repositories/SupabaseParceiroRepository';
import { CriarPontoColetaUseCase } from '../../../domain/use-cases/pontoColeta/CriarPontoColetaUseCase';
import { GetPontoColetaUseCase } from '../../../domain/use-cases/pontoColeta/GetPontoColetaUseCase';
import { PontoColetaController } from '../controllers/PontoColetaController';
import { AuthMiddleware } from '../middlewares/AuthMiddleware';
import { GeocodingService } from '../../../infrastructure/services/GeocodingService';

const router = Router();

// Instanciar dependências
const pontoColetaRepository = new SupabasePontoColetaRepository();
const parceiroRepository = new SupabaseParceiroRepository();
const geocodingService = new GeocodingService();
const criarPontoColetaUseCase = new CriarPontoColetaUseCase(pontoColetaRepository, parceiroRepository, geocodingService);
const getPontoColetaUseCase = new GetPontoColetaUseCase(pontoColetaRepository);
const pontoColetaController = new PontoColetaController(getPontoColetaUseCase);

// ======================
// ROTAS PÚBLICAS (ou abertas)
// ======================

/**
 * @openapi
 * /pontos-coleta/pontos-coleta/{id}:
 *   get:
 *     summary: Buscar ponto de coleta por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do ponto de coleta
 *     responses:
 *       200:
 *         description: Ponto de coleta encontrado
 *       404:
 *         description: Ponto de coleta não encontrado
 */
router.get('/pontos-coleta/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const pontoColeta = await pontoColetaRepository.findById(id);

    if (!pontoColeta) {
      res.status(404).json({ message: 'Ponto de coleta não encontrado' });
      return;
    }

    res.json(pontoColeta);
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ message: error.message });
      return;
    }
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// ======================
// ROTAS PROTEGIDAS (APENAS PARCEIRO)
// ======================

/**
 * @openapi
 * /pontos-coleta/pontos-coleta:
 *   post:
 *     summary: Cadastro de ponto de coleta
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               parceiroId:
 *                 type: string
 *               nomePontoColeta:
 *                 type: string
 *               cep:
 *                 type: string
 *               logradouro:
 *                 type: string
 *               numero:
 *                 type: string
 *               bairro:
 *                 type: string
 *               capacidadeBombona:
 *                 type: number
 *     responses:
 *       201:
 *         description: Ponto de coleta cadastrado com sucesso
 */
router.post(
  '/pontos-coleta',
  AuthMiddleware.verify,
  AuthMiddleware.requireRole('parceiro'),
  async (req, res) => {
    try {
      // Adiciona o parceiroId automaticamente a partir do token
      const dados = {
        ...req.body,
        parceiroId: req.user?.id
      };

      const result = await criarPontoColetaUseCase.execute(dados);
      res.status(201).json(result);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
        return;
      }
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }
);

/**
 * @openapi
 * /pontos-coleta/meus:
 *   get:
 *     summary: Listar pontos de coleta do parceiro logado
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de pontos de coleta do parceiro
 */
router.get(
  '/pontos-coleta/meus',
  AuthMiddleware.verify,
  AuthMiddleware.requireRole('parceiro'),
  async (req, res) => {
    try {
      const parceiroId = req.user?.id;
      const pontos = await pontoColetaRepository.findByParceiroId(parceiroId!);
      res.json(pontos);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
        return;
      }
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }
);

export default router;