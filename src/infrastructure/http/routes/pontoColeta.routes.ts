import { Router } from 'express';

import { SupabasePontoColetaRepository } from '../../../infrastructure/repositories/SupabasePontoColetaRepository';
import { CriarPontoColetaUseCase } from '../../../domain/use-cases/pontoColeta/CriarPontoColetaUseCase';
import { GetPontoColetaUseCase } from '../../../domain/use-cases/pontoColeta/GetPontoColetaUseCase';
import { AtualizarPontoColetaUseCase } from '../../../domain/use-cases/pontoColeta/UpdatePontoColetaUseCase';

import { PontoColetaController } from '../controllers/PontoColetaController';
import { AuthMiddleware } from '../middlewares/AuthMiddleware';
import { ParceiroIndicadorController } from '../controllers/ParceiroIndicadorController';
import { SupabaseParceiroRepository } from '../../repositories/SupabaseParceiroRepository';

const router = Router();

// ======================
// DEPENDÊNCIAS
// ======================

const pontoColetaRepository = new SupabasePontoColetaRepository();
const parceiroRepository = new SupabaseParceiroRepository();
const criarPontoColetaUseCase = new CriarPontoColetaUseCase(pontoColetaRepository);
const getPontoColetaUseCase = new GetPontoColetaUseCase(pontoColetaRepository);
const atualizarPontoColetaUseCase = new AtualizarPontoColetaUseCase(pontoColetaRepository,parceiroRepository);

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
 *     description: Atualiza os dados de um ponto de coleta. Apenas o parceiro proprietário do ponto tem permissão para editá-lo. Todos os campos no corpo da requisição são OPCIONAIS; envie apenas o que deseja atualizar ou todos os campos de uma vez.
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
 *       description: Objeto com os campos para atualização. Nenhum campo é obrigatório.
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nomePontoColeta:
 *                 type: string
 *                 example: Ponto Principal - Filial Centro
 *               categoria:
 *                 oneOf:
 *                   - type: integer
 *                     enum: [1, 2, 3, 4, 5, 6, 7]
 *                   - type: string
 *                     example: Escola / Universidade
 *               cep:
 *                 type: string
 *                 example: "01001000"
 *               logradouro:
 *                 type: string
 *                 example: Praça da Sé
 *               numero:
 *                 type: string
 *                 example: "100"
 *               bairro:
 *                 type: string
 *                 example: Sé
 *               cidade:
 *                 type: string
 *                 example: São Paulo
 *               estado:
 *                 type: string
 *                 example: SP
 *               complemento:
 *                 type: string
 *                 example: Bloco A
 *               expectativaGeracao:
 *                 type: number
 *                 example: 150
 *               capacidadeBombona:
 *                 type: number
 *                 example: 200
 *               nivelAtualPct:
 *                 type: number
 *                 description: Porcentagem do nível atual da bombona (0 a 100)
 *                 example: 75
 *               statusBombona:
 *                 type: string
 *                 enum: [VAZIA, PARCIAL, CHEIA, EM_COLETA]
 *                 example: PARCIAL
 *           examples:
 *             todosOsCampos:
 *               summary: Exemplo completo (atualizando TODOS os campos de uma vez)
 *               value:
 *                 nomePontoColeta: "Ponto Matriz Renovado"
 *                 categoria: 2
 *                 cep: "01310100"
 *                 logradouro: "Avenida Paulista"
 *                 numero: "1500"
 *                 bairro: "Bela Vista"
 *                 cidade: "São Paulo"
 *                 estado: "SP"
 *                 complemento: "Conjunto 42"
 *                 expectativaGeracao: 300
 *                 capacidadeBombona: 500
 *                 nivelAtualPct: 90
 *                 statusBombona: "CHEIA"
 *             apenasNivelBombona:
 *               summary: Exemplo parcial (atualizando apenas o nível da bombona)
 *               value:
 *                 nivelAtualPct: 80
 *                 statusBombona: "PARCIAL"
 *     responses:
 *       200:
 *         description: Ponto de coleta atualizado com sucesso
 *       400:
 *         description: Dados de entrada inválidos
 *       401:
 *         description: Usuário não autenticado
 *       403:
 *         description: Acesso negado. O ponto de coleta pertence a outro parceiro
 *       404:
 *         description: Ponto de coleta não encontrado
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