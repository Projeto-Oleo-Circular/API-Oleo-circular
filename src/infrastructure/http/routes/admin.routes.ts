import { Router } from 'express';

// Repositórios
import { SupabaseAdminRepository } from '../../../infrastructure/repositories/SupabaseAdminRepository';
import { SupabaseParceiroRepository } from '../../../infrastructure/repositories/SupabaseParceiroRepository';
import { SupabasePontoColetaRepository } from '../../../infrastructure/repositories/SupabasePontoColetaRepository';
import { SupabaseSolicitacaoRepository } from '../../../infrastructure/repositories/SupabaseSolicitacaoRepository';
import { SupabaseParceiroIndicadorRepository } from '../../../infrastructure/repositories/SupabaseParceiroIndicadorRepository';

// Use Cases
import { LoginAdminUseCase } from '../../../domain/use-cases/admin/LoginAdminUseCase';
import { AtualizarStatusParceiroUseCase } from '../../../domain/use-cases/admin/AtualizarStatusParceiroUseCase';
import { AtualizarStatusPontoColetaUseCase } from '../../../domain/use-cases/admin/AtualizarStatusPontoColetaUseCase';
import { ListarParceirosPendentesUseCase } from '../../../domain/use-cases/admin/ListarParceirosPendentesUseCase';
import { ListarTodosParceirosUseCase } from '../../../domain/use-cases/admin/ListarTodosParceirosUseCase';
import { ListarTodosPontosUseCase } from '../../../domain/use-cases/admin/ListarTodosPontosUseCase';
import { AtualizarStatusSolicitacaoUseCase } from '../../../domain/use-cases/solicitacao/AtualizarStatusSolicitacaoUseCase';
import { ListarTodasSolicitacoesColetaUseCase } from '../../../domain/use-cases/solicitacao/ListarTodasSolicitacoesColetaUseCase';
import { GetAlogadoUseCase } from '../../../domain/use-cases/admin/getUserAUseCase';
import { AdminManageUseCase } from '../../../domain/use-cases/admin/AdminManageUseCase';
import { CriarParceiroUseCase } from '../../../domain/use-cases/parceiro/CriarParceiroUseCase';
import { AtualizarAdminUseCase } from '../../../domain/use-cases/admin/AtualizarAdminUseCase';
// Controllers
import { AdminController } from '../controllers/AdminController';

// Middlewares
import { AuthMiddleware, loginLimiter } from '../middlewares/AuthMiddleware';

const router = Router();

// ===================== INSTANCIAR REPOSITÓRIOS =====================
const adminRepository = new SupabaseAdminRepository();
const parceiroRepository = new SupabaseParceiroRepository();
const pontoColetaRepository = new SupabasePontoColetaRepository();
const solicitacaoRepository = new SupabaseSolicitacaoRepository();
const indicadorRepository = new SupabaseParceiroIndicadorRepository();

// ===================== INSTANCIAR USE CASES =====================
const loginAdminUseCase = new LoginAdminUseCase(adminRepository);
const criarParceiroUseCase = new CriarParceiroUseCase(parceiroRepository, pontoColetaRepository);
const atualizarAdminUseCase = new AtualizarAdminUseCase(adminRepository)
const atualizarStatusParceiroUseCase = new AtualizarStatusParceiroUseCase(
  parceiroRepository,
  pontoColetaRepository
);
const atualizarStatusPontoColetaUseCase = new AtualizarStatusPontoColetaUseCase(
  pontoColetaRepository,
  parceiroRepository
);
const listarParceirosPendentesUseCase = new ListarParceirosPendentesUseCase(parceiroRepository);
const listarTodosParceirosUseCase = new ListarTodosParceirosUseCase(parceiroRepository);
const listarTodosPontosUseCase = new ListarTodosPontosUseCase(
  pontoColetaRepository,
  parceiroRepository
);
const atualizarStatusSolicitacaoUseCase = new AtualizarStatusSolicitacaoUseCase(
  solicitacaoRepository,
  pontoColetaRepository,
  parceiroRepository
);
const listarTodasSolicitacoesColetaUseCase = new ListarTodasSolicitacoesColetaUseCase(
  solicitacaoRepository,
  pontoColetaRepository,
  parceiroRepository
);
const getUser = new GetAlogadoUseCase(adminRepository);

// ===== NOVO USE CASE DE GESTÃO (CRUD) =====
const adminManageUseCase = new AdminManageUseCase(
  adminRepository,
  parceiroRepository,
  indicadorRepository
);

// ===================== INSTANCIAR CONTROLLER =====================
const adminController = new AdminController(
  loginAdminUseCase,
  atualizarStatusParceiroUseCase,
  atualizarStatusPontoColetaUseCase,
  listarParceirosPendentesUseCase,
  listarTodosParceirosUseCase,
  listarTodosPontosUseCase,
  atualizarStatusSolicitacaoUseCase,
  listarTodasSolicitacoesColetaUseCase,
  getUser,
  adminManageUseCase,
  criarParceiroUseCase,
  atualizarAdminUseCase


  
);

// =================================================================
// ===================== ROTAS PÚBLICAS ============================
// =================================================================

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
router.post('/login', loginLimiter, (req, res) => adminController.login(req, res));

// =================================================================
// ===================== ROTAS AUTENTICADAS ========================
// =================================================================

router.use(AuthMiddleware.verify, AuthMiddleware.requireRole('admin'));

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
 *                   type: number
 *                 nome:
 *                   type: string
 *                 email:
 *                   type: string
 *                 nivelAcesso:
 *                   type: string
 *                 ultimoAcesso:
 *                   type: string
 *                   format: date-time
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Acesso negado (não é admin)
 */
router.get('/me', (req, res) => adminController.me(req, res));

// =================================================================
// ===== PARCEIROS - APROVAÇÃO E LISTAGEM ==========================
// =================================================================

/**
 * @swagger
 * /admin/parceiros/pendentes:
 *   get:
 *     summary: Lista parceiros pendentes de aprovação
 *     tags: [Admin - Parceiros]
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
 *                 $ref: '#/components/schemas/Parceiro'
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Acesso negado (não é admin)
 */
router.get('/parceiros/pendentes', (req, res) => adminController.listarPendentes(req, res));

/**
 * @swagger
 * /admin/parceiros:
 *   get:
 *     summary: Lista todos os parceiros
 *     tags: [Admin - Parceiros]
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
 *                 $ref: '#/components/schemas/Parceiro'
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Acesso negado (não é admin)
 */
router.get('/parceiros', (req, res) => adminController.listarParceiros(req, res));

/**
 * @swagger
 * /admin/parceiros/{id}/status:
 *   patch:
 *     summary: Atualiza status e observação de um parceiro
 *     tags: [Admin - Parceiros]
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
 *       400:
 *         description: Dados inválidos ou parceiro não encontrado
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Acesso negado (não é admin)
 */
router.patch('/parceiros/:id/status', (req, res) => adminController.atualizarStatusParceiro(req, res));

// =================================================================
// ===== PONTOS DE COLETA ==========================================
// =================================================================

/**
 * @swagger
 * /admin/pontos:
 *   get:
 *     summary: Lista pontos de coleta com filtros e paginação
 *     tags: [Admin - Pontos de Coleta]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: categoria
 *         schema:
 *           oneOf:
 *             - type: integer
 *               enum: [1, 2, 3, 4, 5, 6, 7]
 *             - type: string
 *         description: Filtra pela categoria do ponto de coleta
 *       - in: query
 *         name: nomePonto
 *         schema:
 *           type: string
 *         description: Busca por nome do ponto de coleta
 *       - in: query
 *         name: statusBombona
 *         schema:
 *           type: string
 *         description: Filtra pelo status da bombona
 *       - in: query
 *         name: parceiro
 *         schema:
 *           type: string
 *         description: Busca pelo nome do parceiro
 *       - in: query
 *         name: statusAprovacao
 *         schema:
 *           type: string
 *           enum: [APROVADO, REJEITADO, PENDENTE]
 *         description: Filtra pelo status de aprovação do ponto
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
 *         description: Lista paginada de pontos de coleta
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Acesso negado (não é admin)
 */
router.get('/pontos', (req, res) => adminController.listarPontos(req, res));

/**
 * @swagger
 * /admin/pontos/{id}/status:
 *   patch:
 *     summary: Atualiza status e observação de um ponto de coleta
 *     tags: [Admin - Pontos de Coleta]
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
 *       400:
 *         description: Dados inválidos ou ponto não encontrado
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Acesso negado (não é admin)
 */
router.patch('/pontos/:id/status', (req, res) => adminController.atualizarStatusPonto(req, res));

// =================================================================
// ===== SOLICITAÇÕES DE COLETA ====================================
// =================================================================

/**
 * @swagger
 * /admin/solicitacoes-coleta:
 *   get:
 *     summary: Lista todas as solicitações de coleta com filtros
 *     tags: [Admin - Solicitações]
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
router.get('/solicitacoes-coleta', (req, res) => adminController.listarSolicitacoes(req, res));

/**
 * @swagger
 * /admin/solicitacoes-coleta/{id}/status:
 *   patch:
 *     summary: Atualiza o status de uma solicitação de coleta
 *     tags: [Admin - Solicitações]
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
router.patch('/solicitacoes-coleta/:id/status', (req, res) => adminController.atualizarStatus(req, res));

// =================================================================
// ===== CRUD - ADMINISTRADORES (apenas admin) ====================
// =================================================================

/**
 * @swagger
 * /admin/admins:
 *   post:
 *     summary: Cria um novo administrador (apenas admin)
 *     tags: [Admin - Gestão de Admins]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nome
 *               - email
 *               - senha
 *               - nivelAcesso
 *             properties:
 *               nome:
 *                 type: string
 *                 example: "João Silva"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "joao@admin.com"
 *               senha:
 *                 type: string
 *                 format: password
 *                 example: "123456"
 *               nivelAcesso:
 *                 type: string
 *                 enum: [admin, gerente]
 *                 example: "gerente"
 *     responses:
 *       201:
 *         description: Administrador criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Admin'
 *       400:
 *         description: Dados inválidos ou email já existe
 *       403:
 *         description: Acesso negado (não é admin)
 */
router.post('/admins', AuthMiddleware.requireRole('admin'), (req, res) => adminController.criarAdmin(req, res));


/**
 * @swagger
 * /admin/parceiros:
 *   post:
 *     summary: Cria um novo parceiro (admin ou gerente)
 *     tags: [Admin - Gestão de Parceiros]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - senha
 *               - documento
 *               - razaoSocial
 *               - nome
 *               - tipoParceiro
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               senha:
 *                 type: string
 *                 format: password
 *               documento:
 *                 type: string
 *               razaoSocial:
 *                 type: string
 *               nome:
 *                 type: string
 *               telefone:
 *                 type: string
 *               tipoParceiro:
 *                 type: string
 *                 enum: [INSTITUCIONAL, COMUNITARIO, SOLIDARIO]
 *               statusAprovacaoParceiro:
 *                 type: string
 *                 enum: [PENDENTE, APROVADO, REJEITADO]
 *                 default: PENDENTE
 *               parceiroIndicadorId:
 *                 type: integer
 *               redesSociais:
 *                 type: array
 *                 items:
 *                   type: string
 *               responsavelLegal:
 *                 type: string
 *               aceiteMarketing:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Parceiro criado com sucesso
 *       400:
 *         description: Dados inválidos ou email/documento já existente
 */
router.post('/parceiros', AuthMiddleware.requireRole('admin'), (req, res) => adminController.criarParceiro(req, res));

/**
 * @swagger
 * /admin/parceiros/{id}:
 *   put:
 *     summary: Atualiza um parceiro (admin ou gerente)
 *     tags: [Admin - Gestão de Parceiros]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do parceiro
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               razaoSocial:
 *                 type: string
 *               nome:
 *                 type: string
 *               telefone:
 *                 type: string
 *               statusAprovacaoParceiro:
 *                 type: string
 *                 enum: [PENDENTE, APROVADO, REJEITADO]
 *               parceiroIndicadorId:
 *                 type: integer
 *               redesSociais:
 *                 type: array
 *                 items:
 *                   type: string
 *               responsavelLegal:
 *                 type: string
 *               aceiteMarketing:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Parceiro atualizado com sucesso
 *       404:
 *         description: Parceiro não encontrado
 */
router.put('/parceiros/:id', AuthMiddleware.requireRole('admin'), (req, res) => adminController.atualizarParceiro(req, res));

/**
 * @swagger
 * /admin/parceiros/{id}:
 *   delete:
 *     summary: Exclui um parceiro (apenas admin)
 *     tags: [Admin - Gestão de Parceiros]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do parceiro
 *     responses:
 *       204:
 *         description: Parceiro excluído com sucesso
 *       403:
 *         description: Acesso negado (não é admin)
 *       404:
 *         description: Parceiro não encontrado
 */
router.delete('/parceiros/:id', AuthMiddleware.requireRole('admin'), (req, res) => adminController.excluirParceiro(req, res));

// =================================================================
// ===== CRUD - PARCEIROS INDICADORES ==============================
// =================================================================

/**
 * @swagger
 * /admin/indicadores:
 *   post:
 *     summary: Cria um novo parceiro indicador (admin ou gerente)
 *     tags: [Admin - Gestão de Indicadores]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nome
 *               - tipo
 *               - cnpj
 *             properties:
 *               nome:
 *                 type: string
 *               tipo:
 *                 type: string
 *                 enum: [ASSOCIACAO, COOPERATIVA, ONG]
 *               cnpj:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               telefone:
 *                 type: string
 *               site:
 *                 type: string
 *               ativo:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       201:
 *         description: Indicador criado com sucesso
 *       400:
 *         description: Dados inválidos ou CNPJ já existe
 */
router.post('/indicadores', AuthMiddleware.requireRole('admin'), (req, res) => adminController.criarIndicador(req, res));

/**
 * @swagger
 * /admin/indicadores:
 *   get:
 *     summary: Lista todos os parceiros indicadores (admin ou gerente)
 *     tags: [Admin - Gestão de Indicadores]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de indicadores
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ParceiroIndicador'
 */
router.get('/indicadores', AuthMiddleware.requireRole('admin'), (req, res) => adminController.listarIndicadoresAtivos(req, res));

/**
 * @swagger
 * /admin/indicadores/ativos:
 *   get:
 *     summary: Lista apenas os indicadores ativos (admin ou gerente)
 *     tags: [Admin - Gestão de Indicadores]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de indicadores ativos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ParceiroIndicador'
 */
router.get('/indicadores/ativos', AuthMiddleware.requireRole('admin'), (req, res) => adminController.listarIndicadoresAtivos(req, res));

/**
 * @swagger
 * /admin/indicadores/{id}:
 *   put:
 *     summary: Atualiza um parceiro indicador (admin ou gerente)
 *     tags: [Admin - Gestão de Indicadores]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do indicador
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *               tipo:
 *                 type: string
 *                 enum: [ASSOCIACAO, COOPERATIVA, ONG]
 *               cnpj:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               telefone:
 *                 type: string
 *               site:
 *                 type: string
 *               ativo:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Indicador atualizado com sucesso
 *       404:
 *         description: Indicador não encontrado
 */
router.put('/indicadores/:id', AuthMiddleware.requireRole('admin'), (req, res) => adminController.atualizarIndicador(req, res));

/**
 * @swagger
 * /admin/indicadores/{id}:
 *   delete:
 *     summary: Exclui um parceiro indicador (apenas admin)
 *     tags: [Admin - Gestão de Indicadores]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do indicador
 *     responses:
 *       204:
 *         description: Indicador excluído com sucesso
 *       403:
 *         description: Acesso negado (não é admin)
 *       404:
 *         description: Indicador não encontrado
 */
router.delete('/indicadores/:id', AuthMiddleware.requireRole('admin'), (req, res) => adminController.excluirIndicador(req, res));
/**
 * @swagger
 * /admin/admins/{id}:
 *   put:
 *     summary: Atualiza um administrador existente (apenas admin)
 *     tags: [Admin - Gestão de Admins]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do administrador
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               senha:
 *                 type: string
 *                 format: password
 *               nivelAcesso:
 *                 type: string
 *                 enum: [admin, gerente]
 *     responses:
 *       200:
 *         description: Administrador atualizado com sucesso
 *       400:
 *         description: Dados inválidos ou email já em uso
 *       404:
 *         description: Administrador não encontrado
 */
router.put('/admins/:id', AuthMiddleware.requireRole('admin'), (req, res) => adminController.atualizarAdmin(req, res));
export default router;