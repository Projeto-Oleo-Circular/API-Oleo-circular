import { Router } from 'express';

// Repositórios
import { SupabaseAdminRepository } from '../../../infrastructure/repositories/SupabaseAdminRepository';
import { SupabaseParceiroRepository } from '../../../infrastructure/repositories/SupabaseParceiroRepository';
import { SupabasePontoColetaRepository } from '../../../infrastructure/repositories/SupabasePontoColetaRepository';
import { SupabaseSolicitacaoRepository } from '../../../infrastructure/repositories/SupabaseSolicitacaoRepository';



// Use Cases
import { LoginAdminUseCase } from '../../../domain/use-cases/admin/LoginAdminUseCase';
import { AtualizarStatusParceiroUseCase } from '../../../domain/use-cases/admin/AtualizarStatusParceiroUseCase';
import { AtualizarStatusPontoColetaUseCase } from '../../../domain/use-cases/admin/AtualizarStatusPontoColetaUseCase';
import { ListarParceirosPendentesUseCase } from '../../../domain/use-cases/admin/ListarParceirosPendentesUseCase';
import { ListarTodosParceirosUseCase } from '../../../domain/use-cases/admin/ListarTodosParceirosUseCase';
import { ListarTodosPontosUseCase } from '../../../domain/use-cases/admin/ListarTodosPontosUseCase';
import { AtualizarStatusSolicitacaoUseCase } from '../../../domain/use-cases/solicitacao/AtualizarStatusSolicitacaoUseCase';
import { ListarTodasSolicitacoesColetaUseCase } from '../../../domain/use-cases/solicitacao/ListarTodasSolicitacoesColetaUseCase';

// Controllers
import { AdminController } from '../controllers/AdminController';

// Middlewares
import { AuthMiddleware, loginLimiter } from '../middlewares/AuthMiddleware';

const router = Router();

// Instanciação dos repositórios
const adminRepository = new SupabaseAdminRepository();
const parceiroRepository = new SupabaseParceiroRepository();
const pontoColetaRepository = new SupabasePontoColetaRepository();
const solicitacaoRepository = new SupabaseSolicitacaoRepository();

// Instanciação dos Use Cases
const loginAdminUseCase = new LoginAdminUseCase(adminRepository);
const atualizarStatusParceiroUseCase = new AtualizarStatusParceiroUseCase(parceiroRepository, pontoColetaRepository);
const atualizarStatusPontoColetaUseCase = new AtualizarStatusPontoColetaUseCase(pontoColetaRepository, parceiroRepository);
const listarParceirosPendentesUseCase = new ListarParceirosPendentesUseCase(parceiroRepository);
const listarTodosParceirosUseCase = new ListarTodosParceirosUseCase(parceiroRepository);
const listarTodosPontosUseCase = new ListarTodosPontosUseCase(pontoColetaRepository);
const atualizarStatusSolicitacaoUseCase = new AtualizarStatusSolicitacaoUseCase(solicitacaoRepository, pontoColetaRepository, parceiroRepository);
const listarTodasSolicitacoesColetaUseCase = new ListarTodasSolicitacoesColetaUseCase(solicitacaoRepository, pontoColetaRepository, parceiroRepository);

// Instanciação dos Controllers
const adminController = new AdminController(
  loginAdminUseCase,
  atualizarStatusParceiroUseCase,
  atualizarStatusPontoColetaUseCase,
  listarParceirosPendentesUseCase,
  listarTodosParceirosUseCase,
  listarTodosPontosUseCase,
  atualizarStatusSolicitacaoUseCase,
  listarTodasSolicitacoesColetaUseCase,
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
router.post('/login', loginLimiter, async (req, res) => adminController.login(req, res));

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

/**
 * @swagger
 * /admin/solicitacoes-coleta/{id}/status:
 *   patch:
 *     summary: Atualiza o status de uma solicitação de coleta
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da solicitação de coleta
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [AGUARDANDO, AGENDADA, EM_ROTA, CONCLUIDA]
 *               dataAgendamento:
 *                 type: string
 *                 format: date-time
 *               volumeColetado:
 *                 type: number
 *               observacoes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Solicitação atualizada com sucesso
 *       400:
 *         description: Erro de validação ou solicitação não encontrada
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Acesso negado (não é admin)
 */
router.patch(
  '/solicitacoes-coleta/:id/status',
  AuthMiddleware.verify,
  AuthMiddleware.requireRole('admin'),
  (req, res) => adminController.atualizarStatus(req, res)
);
/**
 * @swagger
 * /admin/solicitacoes-coleta:
 *   get:
 *     summary: Lista todas as solicitações de coleta com filtros
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: nomePonto
 *         schema:
 *           type: string
 *         description: Busca por nome do ponto de coleta
 *       - in: query
 *         name: parceiro
 *         schema:
 *           type: string
 *         description: Busca por nome do parceiro solicitante
 *       - in: query
 *         name: parceiroIndicadorId
 *         schema:
 *           type: integer
 *         description: Filtra por parceiro indicador
 *       - in: query
 *         name: capacidadeBombona
 *         schema:
 *           type: number
 *         description: Filtra pela capacidade da bombona
 *       - in: query
 *         name: dataSolicitacao
 *         schema:
 *           type: string
 *           format: date
 *         description: Filtra por data da solicitação (AAAA-MM-DD)
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [AGUARDANDO, AGENDADA, EM_ROTA, CONCLUIDA]
 *         description: Filtra pelo status da solicitação
 *       - in: query
 *         name: endereco
 *         schema:
 *           type: string
 *         description: Busca pelo endereço do ponto de coleta
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número da página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Quantidade de itens por página
 *     responses:
 *       200:
 *         description: Lista retornada com sucesso
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Acesso negado (não é admin)
 */
router.get(
  '/solicitacoes-coleta',
  AuthMiddleware.verify,
  AuthMiddleware.requireRole('admin'),
  (req, res) => adminController.listarSolicitacoes(req, res)
);
export default router;