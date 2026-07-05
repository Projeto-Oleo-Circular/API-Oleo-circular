import { Router } from 'express';
import { SupabaseAdminRepository } from '../../../infrastructure/repositories/SupabaseAdminRepository';
import { SupabaseParceiroRepository } from '../../../infrastructure/repositories/SupabaseParceiroRepository';
import { SupabasePontoColetaRepository } from '../../../infrastructure/repositories/SupabasePontoColetaRepository';
import { LoginAdminUseCase } from '../../../domain/use-cases/admin/LoginAdminUseCase';
import { AprovarParceiroUseCase } from '../../../domain/use-cases/admin/AprovarParceiroUseCase';
import { AprovarPontoColetaUseCase } from '../../../domain/use-cases/admin/AprovarPontoColetaUseCase';
import { ListarParceirosPendentesUseCase } from '../../../domain/use-cases/admin/ListarParceirosPendentesUseCase';
import { AdminController } from '../controllers/AdminController';
import { AuthMiddleware } from '../middlewares/AuthMiddleware';

const router = Router();

// Instanciação dos repositórios
const adminRepository = new SupabaseAdminRepository();
const parceiroRepository = new SupabaseParceiroRepository();
const pontoColetaRepository = new SupabasePontoColetaRepository();

// Instanciação dos Use Cases
const loginAdminUseCase = new LoginAdminUseCase(adminRepository);
const aprovarParceiroUseCase = new AprovarParceiroUseCase(parceiroRepository);
const aprovarPontoColetaUseCase = new AprovarPontoColetaUseCase(pontoColetaRepository);
const listarParceirosPendentesUseCase = new ListarParceirosPendentesUseCase(parceiroRepository);

// Instanciação do Controller
const adminController = new AdminController(
  loginAdminUseCase,
  aprovarParceiroUseCase,
  aprovarPontoColetaUseCase,
  listarParceirosPendentesUseCase,
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
router.post('/login', (req, res) => adminController.login(req, res));

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
 * /admin/parceiros/{id}/aprovar:
 *   post:
 *     summary: Aprova um parceiro
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
 *     responses:
 *       200:
 *         description: Parceiro aprovado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 nomeRazaoSocial:
 *                   type: string
 *                 statusAprovacao:
 *                   type: string
 *                   example: APROVADO
 *       400:
 *         description: Parceiro não encontrado ou já aprovado
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Acesso negado (não é admin)
 */
router.post('/parceiros/:id/aprovar', AuthMiddleware.verify, AuthMiddleware.requireRole('admin'), (req, res) => adminController.aprovarParceiro(req, res));

/**
 * @swagger
 * /admin/pontos/{id}/aprovar:
 *   post:
 *     summary: Aprova um ponto de coleta
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
 *     responses:
 *       200:
 *         description: Ponto aprovado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 endereco:
 *                   type: string
 *                 statusAprovacao:
 *                   type: string
 *                   example: APROVADO
 *       400:
 *         description: Ponto não encontrado ou já aprovado
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Acesso negado (não é admin)
 */
router.post('/pontos/:id/aprovar', AuthMiddleware.verify, AuthMiddleware.requireRole('admin'), (req, res) => adminController.aprovarPonto(req, res));

export default router;