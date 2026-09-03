// presentation/routes/SolicitacaoColetaRouter.ts
import { Router } from 'express';

import { DBScriptSolicitacaoRepository } from '../../repositories/DBScriptSolicitacaoRepository';
import { DBScriptPontoColetaRepository } from '../../repositories/DBScriptPontoColetaRepository';
import { DBScriptParceiroRepository } from '../../repositories/DBScriptParceiroRepository';
import { CriarSolicitacaoColetaUseCase } from '../../../domain/use-cases/solicitacao/CriarSolicitacaoColetaUseCase';
import { ListarSolicitacoesColetaUseCase } from '../../../domain/use-cases/solicitacao/ListarSolicitacoesColetaUseCase';
import { SolicitacaoColetaController } from '../controllers/SolicitarColetaController';
import { AuthMiddleware } from '../middlewares/AuthMiddleware';

const router = Router();

// ======================
// DEPENDÊNCIAS
// ======================

const solicitacaoRepository = new DBScriptSolicitacaoRepository();
const pontoColetaRepository = new DBScriptPontoColetaRepository();
const parceiroRepository = new DBScriptParceiroRepository();

const criarSolicitacaoUseCase = new CriarSolicitacaoColetaUseCase(
  solicitacaoRepository,
  pontoColetaRepository,
  parceiroRepository,
);

const listarSolicitacoesColetaUseCase = new ListarSolicitacoesColetaUseCase(
  solicitacaoRepository,
  pontoColetaRepository,
);

const solicitacaoController = new SolicitacaoColetaController(
  criarSolicitacaoUseCase,
  listarSolicitacoesColetaUseCase
);

// ======================
// SWAGGER
// ======================

/**
 * @swagger
 * tags:
 *   - name: Solicitação de Coleta
 *     description: Operações relacionadas às solicitações de retirada de óleo
 */

/**
 * @openapi
 * /solicitacoes-coleta:
 *   post:
 *     tags:
 *       - Solicitação de Coleta
 *     summary: Cria uma nova solicitação de coleta para um ponto específico
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - pontoColetaId
 *               - volumeInformado
 *             properties:
 *               pontoColetaId:
 *                 type: integer
 *                 description: ID do ponto de coleta onde o óleo está armazenado
 *                 example: 1
 *               volumeInformado:
 *                 type: number
 *                 description: Volume estimado de óleo a ser coletado (em litros)
 *                 example: 50
 *               observacoes:
 *                 type: string
 *                 description: Informações adicionais
 *                 example: Bombona localizada na portaria principal
 *     responses:
 *       201:
 *         description: Solicitação criada com sucesso
 *       400:
 *         description: Erro de validação ou ponto não pertence ao parceiro
 *       401:
 *         description: Usuário não autenticado
 */
router.post(
  '/',
  AuthMiddleware.verify,
  AuthMiddleware.requireRole('parceiro'),
  (req, res) => solicitacaoController.criar(req, res),
);

/**
 * @openapi
 * /solicitacoes-coleta:
 *   get:
 *     tags:
 *       - Solicitação de Coleta
 *     summary: Lista as solicitações de coleta do parceiro logado
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de solicitações de coleta
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 10
 *                   status:
 *                     type: string
 *                     example: AGUARDANDO
 *                   volumeInformado:
 *                     type: number
 *                     example: 50
 *                   observacoes:
 *                     type: string
 *                     example: Bombona localizada na portaria principal
 *                   criadoEm:
 *                     type: string
 *                     format: date-time
 *                     example: "2026-08-01T15:30:00.000Z"
 *                   pontoColeta:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       nome:
 *                         type: string
 *                         example: Restaurante Sabor Caseiro
 *                       endereco:
 *                         type: string
 *                         example: Rua das Flores, 123
 *       401:
 *         description: Usuário não autenticado
 */
router.get(
  '/',
  AuthMiddleware.verify,
  AuthMiddleware.requireRole('parceiro'),
  (req, res) => solicitacaoController.listar(req, res),
);

export default router;