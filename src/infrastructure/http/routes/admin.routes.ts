import { Router } from 'express';
import { SupabaseAdminRepository } from '../../../infrastructure/repositories/SupabaseAdminRepository';
import { SupabaseParceiroRepository } from '../../../infrastructure/repositories/SupabaseParceiroRepository';
import { SupabasePontoColetaRepository } from '../../../infrastructure/repositories/SupabasePontoColetaRepository';
import { LoginAdminUseCase } from '../../../domain/use-cases/admin/LoginAdminUseCase';
import { AtualizarStatusParceiroUseCase } from '../../../domain/use-cases/admin/AtualizarStatusParceiroUseCase';
import { AtualizarStatusPontoColetaUseCase } from '../../../domain/use-cases/admin/AtualizarStatusPontoColetaUseCase';
import { ListarParceirosPendentesUseCase } from '../../../domain/use-cases/admin/ListarParceirosPendentesUseCase';
import { ListarTodosParceirosUseCase } from '../../../domain/use-cases/admin/ListarTodosParceirosUseCase';
import { ListarTodosPontosUseCase } from '../../../domain/use-cases/admin/ListarTodosPontosUseCase';
import { AdminController } from '../controllers/AdminController';
import { AuthMiddleware, loginLimiter } from '../middlewares/AuthMiddleware';

const router = Router();

// Instanciação dos repositórios
const adminRepository = new SupabaseAdminRepository();
const parceiroRepository = new SupabaseParceiroRepository();
const pontoColetaRepository = new SupabasePontoColetaRepository();

// Instanciação dos Use Cases
const loginAdminUseCase = new LoginAdminUseCase(adminRepository);
const atualizarStatusParceiroUseCase = new AtualizarStatusParceiroUseCase(parceiroRepository, pontoColetaRepository);
const atualizarStatusPontoColetaUseCase = new AtualizarStatusPontoColetaUseCase(pontoColetaRepository, parceiroRepository);
const listarParceirosPendentesUseCase = new ListarParceirosPendentesUseCase(parceiroRepository);
const listarTodosParceirosUseCase = new ListarTodosParceirosUseCase(parceiroRepository);
const listarTodosPontosUseCase = new ListarTodosPontosUseCase(pontoColetaRepository);

// Instanciação do Controller
const adminController = new AdminController(
  loginAdminUseCase,
  atualizarStatusParceiroUseCase,
  atualizarStatusPontoColetaUseCase,
  listarParceirosPendentesUseCase,
  listarTodosParceirosUseCase,
  listarTodosPontosUseCase,
);

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Módulo de administração e aprovações
 */

/**
 * @swagger
 * /admin/login:
 *   post:
 *     summary: Login do administrador
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: admin@cooperativa.com
 *               senha:
 *                 type: string
 *                 example: admin123
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 usuario:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     nome:
 *                       type: string
 *                     email:
 *                       type: string
 *       401:
 *         description: Credenciais inválidas
 */
router.post('/login', loginLimiter, async(req, res) => adminController.login(req, res));

/**
 * @swagger
 * /admin/me:
 *   get:
 *     summary: Dados do admin logado
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dados do admin
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 nome:
 *                   type: string
 *                 email:
 *                   type: string
 *                 nivelAcesso:
 *                   type: string
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Acesso negado (não é admin)
 */
router.get('/me', AuthMiddleware.verify, AuthMiddleware.requireRole('admin'), (req, res) => adminController.me(req, res));

/**
 * @swagger
 * /admin/parceiros/pendentes:
 *   get:
 *     summary: Lista parceiros pendentes de aprovação
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de parceiros pendentes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   nomeRazaoSocial:
 *                     type: string
 *                   email:
 *                     type: string
 *                   documento:
 *                     type: string
 *                   porte:
 *                     type: string
 *                   criadoEm:
 *                     type: string
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Acesso negado (não é admin)
 */
router.get('/parceiros/pendentes', AuthMiddleware.verify, AuthMiddleware.requireRole('admin'), (req, res) => adminController.listarPendentes(req, res));

/**
 * @swagger
 * /admin/parceiros:
 *   get:
 *     summary: Lista todos os parceiros
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de parceiros
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   nomeRazaoSocial:
 *                     type: string
 *                   email:
 *                     type: string
 *                   statusAprovacaoParceiro:
 *                     type: string
 *                   observacao:
 *                     type: string
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Acesso negado (não é admin)
 */
router.get('/parceiros', AuthMiddleware.verify, AuthMiddleware.requireRole('admin'), (req, res) => adminController.listarParceiros(req, res));

/**
 * @swagger
 * /admin/parceiros/{id}/status:
 *   patch:
 *     summary: Atualiza status e observação de um parceiro
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do parceiro
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [APROVADO, REJEITADO, PENDENTE]
 *               observacao:
 *                 type: string
 *     responses:
 *       200:
 *         description: Parceiro atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 statusAprovacaoParceiro:
 *                   type: string
 *                 observacao:
 *                   type: string
 *       400:
 *         description: Dados inválidos ou parceiro não encontrado
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Acesso negado (não é admin)
 */
router.patch('/parceiros/:id/status', AuthMiddleware.verify, AuthMiddleware.requireRole('admin'), (req, res) => adminController.atualizarStatusParceiro(req, res));

/**
 * @swagger
 * /admin/pontos:
 *   get:
 *     summary: Lista todos os pontos de coleta
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de pontos de coleta
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   parceiroId:
 *                     type: string
 *                   statusAprovacaoPontoColeta:
 *                     type: string
 *                   observacao:
 *                     type: string
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Acesso negado (não é admin)
 */
router.get('/pontos', AuthMiddleware.verify, AuthMiddleware.requireRole('admin'), (req, res) => adminController.listarPontos(req, res));

/**
 * @swagger
 * /admin/pontos/{id}/status:
 *   patch:
 *     summary: Atualiza status e observação de um ponto de coleta
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do ponto de coleta
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [APROVADO, REJEITADO, PENDENTE]
 *               observacao:
 *                 type: string
 *     responses:
 *       200:
 *         description: Ponto atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 statusAprovacaoPontoColeta:
 *                   type: string
 *                 observacao:
 *                   type: string
 *       400:
 *         description: Dados inválidos ou ponto não encontrado
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Acesso negado (não é admin)
 */
router.patch('/pontos/:id/status', AuthMiddleware.verify, AuthMiddleware.requireRole('admin'), (req, res) => adminController.atualizarStatusPonto(req, res));

export default router;