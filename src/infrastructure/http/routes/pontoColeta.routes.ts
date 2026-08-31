import { Router } from 'express';

import { SupabasePontoColetaRepository } from '../../../infrastructure/repositories/SupabasePontoColetaRepository';
import { CriarPontoColetaUseCase } from '../../../domain/use-cases/pontoColeta/CriarPontoColetaUseCase';
import { GetPontoColetaUseCase } from '../../../domain/use-cases/pontoColeta/GetPontoColetaUseCase';
import { AtualizarPontoColetaUseCase } from '../../../domain/use-cases/pontoColeta/UpdatePontoColetaUseCase';

import { PontoColetaController } from '../controllers/PontoColetaController';
import { AuthMiddleware } from '../middlewares/AuthMiddleware';
import { SupabaseParceiroRepository } from '../../repositories/SupabaseParceiroRepository';

const router = Router();

// ======================
// DEPENDÊNCIAS
// ======================

const pontoColetaRepository = new SupabasePontoColetaRepository();
const parceiroRepository = new SupabaseParceiroRepository();
const criarPontoColetaUseCase = new CriarPontoColetaUseCase(pontoColetaRepository);
const getPontoColetaUseCase = new GetPontoColetaUseCase(pontoColetaRepository);
const atualizarPontoColetaUseCase = new AtualizarPontoColetaUseCase(pontoColetaRepository, parceiroRepository);

const pontoColetaController = new PontoColetaController(
  getPontoColetaUseCase,
  atualizarPontoColetaUseCase,
  criarPontoColetaUseCase,
  pontoColetaRepository
);

// ======================
// SWAGGER TAG
// ======================

/**
 * @swagger
 * tags:
 *   - name: Ponto de Coleta
 *     description: Operações relacionadas aos pontos de coleta
 */

// ======================
// ROTAS PROTEGIDAS ESPECÍFICAS
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
  (req, res) => pontoColetaController.listMeus(req, res)
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
 *               nomePontoColeta:
 *                 type: string
 *               categoria:
 *                 oneOf:
 *                   - type: integer
 *                     enum: [1, 2, 3, 4, 5, 6, 7]
 *                   - type: string
 *                     example: Escola / Universidade
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
  (req, res) => pontoColetaController.create(req, res)
);

/**
 * @openapi
 * /pontos-coleta/{id}:
 *   put:
 *     tags:
 *       - Ponto de Coleta
 *     summary: Atualizar um ponto de coleta existente
 *     description: Atualiza os dados de um ponto de coleta. Apenas o parceiro proprietário do ponto tem permissão para editá-lo.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do ponto de coleta a ser atualizado
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *            type: object
 *     responses:
 *       200:
 *         description: Ponto de coleta atualizado com sucesso
 */
router.put(
  '/:id',
  AuthMiddleware.verify,
  AuthMiddleware.requireRole('parceiro'),
  (req, res) => pontoColetaController.update(req, res)
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
router.get('/:id', (req, res) => pontoColetaController.findById(req, res));

export default router;