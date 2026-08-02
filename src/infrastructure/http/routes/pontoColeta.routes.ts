import { Router } from 'express';

import { SupabasePontoColetaRepository } from '../../../infrastructure/repositories/SupabasePontoColetaRepository';
import { SupabaseParceiroRepository } from '../../../infrastructure/repositories/SupabaseParceiroRepository';
import { GeocodingService } from '../../../infrastructure/services/GeocodingService';

import { CriarPontoColetaUseCase } from '../../../domain/use-cases/pontoColeta/CriarPontoColetaUseCase';
import { GetPontoColetaUseCase } from '../../../domain/use-cases/pontoColeta/GetPontoColetaUseCase';

import { PontoColetaController } from '../controllers/PontoColetaController';
import { AuthMiddleware } from '../middlewares/AuthMiddleware';

const router = Router();

// ======================
// DEPENDÊNCIAS
// ======================

const pontoColetaRepository = new SupabasePontoColetaRepository();
const parceiroRepository = new SupabaseParceiroRepository();
const geocodingService = new GeocodingService();

const criarPontoColetaUseCase = new CriarPontoColetaUseCase(
  pontoColetaRepository
);

const getPontoColetaUseCase = new GetPontoColetaUseCase(
  pontoColetaRepository
);

const pontoColetaController = new PontoColetaController(
  getPontoColetaUseCase
);

// ======================
// SWAGGER
// ======================

/**
 * @swagger
 * tags:
 *   - name: Ponto de Coleta
 *     description: Operações relacionadas aos pontos de coleta
 */


// ======================
// ROTAS PROTEGIDAS (Específicas primeiro para evitar conflito com /:id)
// ======================

/**
 * @openapi
 * /pontos-coleta/meus:
 *   get:
 *     tags:
 *       - Ponto de Coleta
 *     summary: Listar pontos de coleta do parceiro logado
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de pontos de coleta do parceiro
 */
router.get(
  '/meus',
  AuthMiddleware.verify,
  AuthMiddleware.requireRole('parceiro'),
  async (req, res) => {
    try {
      const parceiroId = req.user?.id;

      const pontos = await pontoColetaRepository.findByParceiroId(
        parceiroId!
      );

      return res.status(200).json(
        pontos.map((ponto) => ({
          ...ponto,
          categoria: ponto.categoria,
          categoriaNumero: typeof ponto.categoria === 'number' ? ponto.categoria : undefined,
        }))
      );
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({
          message: error.message,
        });
      }

      return res.status(500).json({
        message: 'Erro interno do servidor',
      });
    }
  }
);

/**
 * @openapi
 * /pontos-coleta:
 *   post:
 *     tags:
 *       - Ponto de Coleta
 *     summary: Cadastro de ponto de coleta
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - cep
 *               - logradouro
 *               - numero
 *               - bairro
 *               - cidade
 *               - capacidadeBombona
 *             properties:
 *               parceiroId:
 *                 type: number
 *               nomePontoColeta:
 *                 type: string
 *               categoria:
 *                 oneOf:
 *                   - type: integer
 *                     enum: [1, 2, 3, 4, 5, 6, 7]
 *                   - type: string
 *                     example: Escola / Universidade
 *                 description: Aceita número da categoria ou o nome traduzido da categoria.
 *               cep:
 *                 type: string
 *               logradouro:
 *                 type: string
 *               numero:
 *                 type: string
 *               bairro:
 *                 type: string
 *               cidade:
 *                 type: string
 *               estado:
 *                 type: string
 *               complemento:
 *                 type: string
 *               expectativaGeracao:
 *                 type: number
 *               capacidadeBombona:
 *                 type: number
 *               nivelAtualPct:
 *                 type: number
 *               statusBombona:
 *                 type: string
 *                 enum: [VAZIA, PARCIAL, CHEIA, EM_COLETA]
 *     responses:
 *       201:
 *         description: Ponto de coleta cadastrado com sucesso
 */
router.post(
  '/',
  AuthMiddleware.verify,
  AuthMiddleware.requireRole('parceiro'),
  async (req, res) => {
    try {
      const dados = {
        ...req.body,
        parceiroId: req.user?.id,
      };

      const result = await criarPontoColetaUseCase.execute(dados);

      return res.status(201).json(result);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({
          message: error.message,
        });
      }

      return res.status(500).json({
        message: 'Erro interno do servidor',
      });
    }
  }
);

// ======================
// ROTAS PÚBLICAS (Dinâmicas por último)
// ======================

/**
 * @openapi
 * /pontos-coleta/{id}:
 *   get:
 *     tags:
 *       - Ponto de Coleta
 *     summary: Buscar ponto de coleta por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do ponto de coleta
 *     responses:
 *       200:
 *         description: Ponto de coleta encontrado
 *       404:
 *         description: Ponto de coleta não encontrado
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const pontoColeta = await pontoColetaRepository.findById(id);

    if (!pontoColeta) {
      return res.status(404).json({
        message: 'Ponto de coleta não encontrado',
      });
    }

    return res.status(200).json(pontoColeta);
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({
        message: error.message,
      });
    }

    return res.status(500).json({
      message: 'Erro interno do servidor',
    });
  }
});

export default router;