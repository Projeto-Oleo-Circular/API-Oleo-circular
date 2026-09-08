// src/infrastructure/http/routes/impactoAmbiental.routes.ts

import { Router } from 'express';

import { AuthMiddleware } from '../middlewares/AuthMiddleware';

// Repository
import { DBScriptImpactoAmbientalRepository } from '../../repositories/DBScriptImpactoAmbientalRepository';

// Use Cases
import { GetImpactoGeralUseCase } from '../../../domain/use-cases/impacto-ambiental/GetImpactoGeralUseCase';
import { GetImpactoParceiroUseCase } from '../../../domain/use-cases/impacto-ambiental/GetImpactoParceiroUseCase';
import { GetImpactoPontoUseCase } from '../../../domain/use-cases/impacto-ambiental/GetImpactoPontoUseCase';
import { GetImpactoPontoParceiroUseCase } from '../../../domain/use-cases/impacto-ambiental/GetImpactoPontoParceiroUseCase';

// Controller
import { ImpactoAmbientalController } from '../controllers/ImpactoAmbientalController';

const router = Router();

// ======================================================
// DEPENDÊNCIAS
// ======================================================

const impactoRepository =
  new DBScriptImpactoAmbientalRepository();

const getImpactoGeralUseCase =
  new GetImpactoGeralUseCase(
    impactoRepository
  );

const getImpactoParceiroUseCase =
  new GetImpactoParceiroUseCase(
    impactoRepository
  );

const getImpactoPontoUseCase =
  new GetImpactoPontoUseCase(
    impactoRepository
  );

const getImpactoPontoParceiroUseCase =
  new GetImpactoPontoParceiroUseCase(
    impactoRepository
  );

const impactoController =
  new ImpactoAmbientalController(
    getImpactoGeralUseCase,
    getImpactoParceiroUseCase,
    getImpactoPontoUseCase,
    getImpactoPontoParceiroUseCase
  );

// ======================================================
// TODAS AS ROTAS PRECISAM DE LOGIN
// ======================================================

router.use(AuthMiddleware.verify);

// ======================================================
// ADMIN - IMPACTO GERAL
// ======================================================

/**
 * @swagger
 * /impacto-ambiental/admin/geral:
 *   get:
 *     summary: Retorna o impacto ambiental geral da plataforma
 *     description: >
 *       Retorna os indicadores ambientais calculados a partir de todas
 *       as coletas concluídas de todos os parceiros e pontos de coleta.
 *     tags:
 *       - Impacto Ambiental
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Impacto ambiental geral retornado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalParceiros:
 *                       type: integer
 *                       example: 20
 *                     totalPontos:
 *                       type: integer
 *                       example: 35
 *                     totalColetas:
 *                       type: integer
 *                       example: 150
 *                     volumeTotalColetado:
 *                       type: number
 *                       example: 5000
 *                     biodieselEstimadoLitros:
 *                       type: number
 *                       example: 3750
 *                     energiaBiodieselMj:
 *                       type: number
 *                       example: 124348
 *                     dieselEquivalenteLitros:
 *                       type: number
 *                       example: 3500
 *                     co2EvitadoKg:
 *                       type: number
 *                       example: 9212
 *                     residuoDesviadoKg:
 *                       type: number
 *                       example: 4500
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Acesso permitido apenas para administrador
 *       500:
 *         description: Erro interno
 */
router.get(
  '/admin/geral',
  AuthMiddleware.requireRole('admin'),
  (req, res) =>
    impactoController.geral(req, res)
);

// ======================================================
// ADMIN - IMPACTO DE UM PARCEIRO
// ======================================================

/**
 * @swagger
 * /impacto-ambiental/admin/parceiros/{parceiroId}:
 *   get:
 *     summary: Retorna o impacto ambiental de um parceiro
 *     tags:
 *       - Impacto Ambiental
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: parceiroId
 *         required: true
 *         schema:
 *           type: integer
 *         example: 10
 *     responses:
 *       200:
 *         description: Impacto ambiental do parceiro
 *       400:
 *         description: ID inválido
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Acesso permitido apenas para administrador
 *       404:
 *         description: Parceiro não encontrado
 */
router.get(
  '/admin/parceiros/:parceiroId',
  AuthMiddleware.requireRole('admin'),
  (req, res) =>
    impactoController.parceiroAdmin(req, res)
);

// ======================================================
// ADMIN - IMPACTO DE UM PONTO
// ======================================================

/**
 * @swagger
 * /impacto-ambiental/admin/pontos/{pontoId}:
 *   get:
 *     summary: Retorna o impacto ambiental de um ponto de coleta
 *     tags:
 *       - Impacto Ambiental
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: pontoId
 *         required: true
 *         schema:
 *           type: integer
 *         example: 15
 *     responses:
 *       200:
 *         description: Impacto ambiental do ponto
 *       400:
 *         description: ID inválido
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Acesso permitido apenas para administrador
 *       404:
 *         description: Ponto não encontrado
 */
router.get(
  '/admin/pontos/:pontoId',
  AuthMiddleware.requireRole('admin'),
  (req, res) =>
    impactoController.pontoAdmin(req, res)
);

// ======================================================
// PARCEIRO - MEU IMPACTO GERAL
// ======================================================

/**
 * @swagger
 * /impacto-ambiental/parceiro/me:
 *   get:
 *     summary: Retorna o impacto ambiental geral do parceiro logado
 *     description: >
 *       Soma o impacto ambiental de todos os pontos pertencentes
 *       ao parceiro autenticado.
 *     tags:
 *       - Impacto Ambiental
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Impacto ambiental do parceiro logado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     parceiroId:
 *                       type: integer
 *                       example: 10
 *                     nome:
 *                       type: string
 *                       example: José Santos
 *                     razaoSocial:
 *                       type: string
 *                       example: Restaurante Exemplo LTDA
 *                     totalPontos:
 *                       type: integer
 *                       example: 3
 *                     totalColetas:
 *                       type: integer
 *                       example: 20
 *                     volumeTotalColetado:
 *                       type: number
 *                       example: 750
 *                     biodieselEstimadoLitros:
 *                       type: number
 *                       example: 562.5
 *                     energiaBiodieselMj:
 *                       type: number
 *                       example: 18652
 *                     dieselEquivalenteLitros:
 *                       type: number
 *                       example: 525
 *                     co2EvitadoKg:
 *                       type: number
 *                       example: 1381
 *                     residuoDesviadoKg:
 *                       type: number
 *                       example: 675
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Acesso permitido apenas para parceiro
 *       404:
 *         description: Parceiro não encontrado
 */
router.get(
  '/parceiro/me',
  AuthMiddleware.requireRole('parceiro'),
  (req, res) =>
    impactoController.meuImpacto(req, res)
);

// ======================================================
// PARCEIRO - IMPACTO DE UM DOS PRÓPRIOS PONTOS
// ======================================================

/**
 * @swagger
 * /impacto-ambiental/parceiro/pontos/{pontoId}:
 *   get:
 *     summary: Retorna o impacto ambiental de um ponto do parceiro logado
 *     description: >
 *       Retorna os indicadores ambientais de um ponto específico,
 *       desde que o ponto pertença ao parceiro autenticado.
 *     tags:
 *       - Impacto Ambiental
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: pontoId
 *         required: true
 *         schema:
 *           type: integer
 *         example: 20
 *     responses:
 *       200:
 *         description: Impacto ambiental do ponto
 *       400:
 *         description: ID inválido
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Acesso permitido apenas para parceiro
 *       404:
 *         description: Ponto não encontrado ou não pertence ao parceiro
 */
router.get(
  '/parceiro/pontos/:pontoId',
  AuthMiddleware.requireRole('parceiro'),
  (req, res) =>
    impactoController.meuPonto(req, res)
);

export default router;