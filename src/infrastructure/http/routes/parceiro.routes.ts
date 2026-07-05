import { Router } from 'express';
import { SupabaseParceiroRepository } from '../../../infrastructure/repositories/SupabaseParceiroRepository';
import { SupabasePontoColetaRepository } from '../../../infrastructure/repositories/SupabasePontoColetaRepository';
import { CriarParceiroUseCase } from '../../../domain/use-cases/parceiro/CriarParceiroUseCase';
import { LoginParceiroUseCase } from '../../../domain/use-cases/parceiro/LoginParceiroUseCase';
import { GetParceiroLogadoUseCase } from '../../../domain/use-cases/parceiro/GetParceiroLogadoUseCase';
import { ParceiroController } from '../controllers/ParceiroController';
import { AuthMiddleware } from '../middlewares/AuthMiddleware';

const router = Router();

// Instanciar dependências
const parceiroRepository = new SupabaseParceiroRepository();
const pontoColetaRepository = new SupabasePontoColetaRepository();

const criarParceiroUseCase = new CriarParceiroUseCase(parceiroRepository, pontoColetaRepository);
const loginParceiroUseCase = new LoginParceiroUseCase(parceiroRepository);
const getParceiroLogadoUseCase = new GetParceiroLogadoUseCase(parceiroRepository);

const parceiroController = new ParceiroController(getParceiroLogadoUseCase);

// ======================
// ROTAS PÚBLICAS
// ======================

/**
 *  * @swagger
 * tags:
 *   name: Parceiro
 *   description: Módulo de parceiro e aprovações
 *   description: Módulo de  parceiro e aprovações
 *
 * @openapi
 * /parceiros/register:
 *   post:
 *     summary: Cadastro de parceiro
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tipoPessoa:
 *                 type: string
 *                 enum: [FISICA, JURIDICA]
 *               nomeRazaoSocial:
 *                 type: string
 *               email:
 *                 type: string
 *               senha:
 *                 type: string
 *               documento:
 *                 type: string
 *               porte:
 *                 type: string
 *                 enum: [PEQUENO, MEDIO, GRANDE]
 *               aceiteMarketing:
 *                 type: boolean
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
 *         description: Parceiro cadastrado com sucesso
 */
router.post('/register', async (req, res) => {
  try {
    const result = await criarParceiroUseCase.execute(req.body);
    res.status(201).json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro inesperado';
    res.status(400).json({ message });
  }
});

/**
 * @openapi
 * /parceiros/login:
 *   post:
 *     summary: Login de parceiro
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               senha:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 */
router.post('/login', async (req, res) => {
  try {
    const result = await loginParceiroUseCase.execute(req.body);
    res.status(200).json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro inesperado';
    res.status(401).json({ message });
  }
});

// ======================
// ROTAS PROTEGIDAS
// ======================

/**
 * @openapi
 * /parceiros/me:
 *   get:
 *     summary: Dados do parceiro logado
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dados do parceiro
 */
router.get(
  '/me',
  AuthMiddleware.verify,
  AuthMiddleware.requireRole('parceiro'),
  (req, res) => parceiroController.me(req, res)
);

/**
 * @openapi
 * /parceiros/logout:
 *   put:
 *     summary: Realiza logout do parceiro (invalida token no cliente)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout realizado com sucesso
 */
router.put(
  '/logout',
  AuthMiddleware.verify,
  AuthMiddleware.requireRole('parceiro'),
  (req, res) => {
    // O logout no lado do servidor com JWT é feito invalidando o token no cliente.
    // Como usamos JWT stateless, não há estado no servidor para invalidar.
    // A melhor prática é apenas informar o cliente para descartar o token.
    res.status(200).json({ message: 'Logout realizado com sucesso. Descarte o token no cliente.' });
  } );


export default router;