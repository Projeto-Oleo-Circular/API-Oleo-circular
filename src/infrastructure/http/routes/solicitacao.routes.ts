// presentation/routes/SolicitacaoColetaRouter.ts
import { Router } from 'express';

import { SupabaseSolicitacaoRepository } from '../../../infrastructure/repositories/SupabaseSolicitacaoRepository';
import { SupabasePontoColetaRepository } from '../../../infrastructure/repositories/SupabasePontoColetaRepository';
import { CriarSolicitacaoColetaUseCase } from '../../../domain/use-cases/solicitacao/CriarSolicitacaoColetaUseCase';
import { SolicitacaoColetaController } from '../controllers/SolicitarColetaController';
import { AuthMiddleware } from '../middlewares/AuthMiddleware';

const router = Router();

// ======================
// DEPENDÊNCIAS
// ======================

const solicitacaoRepository = new SupabaseSolicitacaoRepository();
const pontoColetaRepository = new SupabasePontoColetaRepository();

const criarSolicitacaoUseCase = new CriarSolicitacaoColetaUseCase(
  solicitacaoRepository,
  pontoColetaRepository
);

const solicitacaoController = new SolicitacaoColetaController(
  criarSolicitacaoUseCase
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
 *                 description: ID do Ponto de Coleta onde o óleo está armazenado
 *               volumeInformado:
 *                 type: number
 *                 description: Volume estimado de óleo a ser coletado (em litros/unidade)
 *               observacoes:
 *                 type: string
 *                 description: Informações adicionais (ex. "Bombona na portaria 2")
 *     responses:
 *       201:
 *         description: Solicitação criada com sucesso. Status inicial definido como AGUARDANDO.
 *       400:
 *         description: Erro de validação ou o ponto de coleta não pertence ao parceiro logado.
 *       401:
 *         description: Usuário não autenticado.
 */
router.post(
  '/',
  AuthMiddleware.verify,
  AuthMiddleware.requireRole('parceiro'), // Apenas parceiros podem solicitar
  (req, res) => solicitacaoController.criar(req, res)
);

export default router;