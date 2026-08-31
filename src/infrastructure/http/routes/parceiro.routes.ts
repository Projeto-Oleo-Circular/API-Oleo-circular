import { Router } from 'express';

import { SupabaseParceiroRepository } from '../../../infrastructure/repositories/SupabaseParceiroRepository';
import { SupabasePontoColetaRepository } from '../../../infrastructure/repositories/SupabasePontoColetaRepository';
import { SupabaseSolicitacaoRepository } from '../../../infrastructure/repositories/SupabaseSolicitacaoRepository';

import { CriarParceiroUseCase } from '../../../domain/use-cases/parceiro/CriarParceiroUseCase';
import { LoginParceiroUseCase } from '../../../domain/use-cases/parceiro/LoginParceiroUseCase';
import { GetParceiroLogadoUseCase } from '../../../domain/use-cases/parceiro/GetParceiroLogadoUseCase';
import { VerificarDisponibilidadeUseCase } from '../../../domain/use-cases/parceiro/VerificarDisponibilidadeUseCase';
import { ListarSolicitacoesColetaUseCase } from '../../../domain/use-cases/solicitacao/ListarSolicitacoesColetaUseCase';
import { DeletePontoColetaUseCase } from '../../../domain/use-cases/pontoColeta/DeletePontoColetaUseCase';
import { ParceiroController } from '../controllers/ParceiroController';

import {
  AuthMiddleware,
  loginLimiter,
} from '../middlewares/AuthMiddleware';
import { AtualizarParceiroUseCase } from '../../../domain/use-cases/parceiro/AtualizarParceiroUseCase';

const router = Router();

// ======================
// DEPENDÊNCIAS & CONTROLLER
// ======================

const parceiroRepository = new SupabaseParceiroRepository();
const pontoColetaRepository = new SupabasePontoColetaRepository();
const solicitacaoRepository = new SupabaseSolicitacaoRepository();

const criarParceiroUseCase = new CriarParceiroUseCase(parceiroRepository, pontoColetaRepository);
const loginParceiroUseCase = new LoginParceiroUseCase(parceiroRepository);
const getParceiroLogadoUseCase = new GetParceiroLogadoUseCase(parceiroRepository, pontoColetaRepository);
const verificarDisponibilidadeUseCase = new VerificarDisponibilidadeUseCase(parceiroRepository);
const listarSolicitacoesColetaUseCase = new ListarSolicitacoesColetaUseCase(solicitacaoRepository, pontoColetaRepository);
const deletePontoColetaUseCase = new DeletePontoColetaUseCase(pontoColetaRepository)
const atualizarParceiroUseCase = new AtualizarParceiroUseCase(parceiroRepository);

const parceiroController = new ParceiroController(
  criarParceiroUseCase,
  loginParceiroUseCase,
  getParceiroLogadoUseCase,
  verificarDisponibilidadeUseCase,
  listarSolicitacoesColetaUseCase,
  deletePontoColetaUseCase,
  atualizarParceiroUseCase
);

/**
 * @openapi
 * tags:
 *   - name: Parceiro
 *     description: Operações relacionadas ao cadastro, autenticação e gestão do parceiro
 */

// ======================
// SWAGGER: DOCUMENTAÇÃO DAS ROTAS
// ======================

/**
 * @openapi
 * /parceiros/register:
 *   post:
 *     tags:
 *       - Parceiro
 *     summary: Cadastro de parceiro
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CriarParceiroDTO'
 *     responses:
 *       201:
 *         description: Parceiro cadastrado com sucesso.
 *       400:
 *         description: Dados inválidos ou e-mail/CNPJ já cadastrado.
 */
router.post(
  '/register',
  parceiroController.criar
);

/**
 * @openapi
 * /parceiros/login:
 *    post:
 *     tags:
 *       - Parceiro
 *     summary: Cadastro de parceiro
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginDTO'
 *     responses:
 *       200:
 *         description: Login realizado com sucesso.
 *       401:
 *         description: Credenciais inválidas.
 *       429:
 *         description: Muitas tentativas de login. Tente novamente mais tarde.
 */
router.post(
  '/login',
  loginLimiter,
  parceiroController.login
);

/**
 * @openapi
 * /parceiros/me:
 *   get:
 *     tags:
 *       - Parceiro
 *     summary: Obtém dados do parceiro autenticado
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dados do parceiro autenticado.
 *       401:
 *         description: Não autorizado ou token inválido.
 */
router.get(
  '/me',
  AuthMiddleware.verify,
  AuthMiddleware.requireRole('parceiro'),
  parceiroController.me
);

/**
 * @openapi
 * /parceiros/logout:
 *   put:
 *     tags:
 *       - Parceiro
 *     summary: Encerra a sessão do parceiro
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout realizado com sucesso.
 *       401:
 *         description: Não autorizado.
 */
router.put(
  '/logout',
  AuthMiddleware.verify,
  AuthMiddleware.requireRole('parceiro'),
  parceiroController.logout
);

/**
 * @openapi
 * /parceiros/buscar-cep/{cep}:
 *   get:
 *     tags:
 *       - Parceiro
 *     summary: Busca endereço a partir do CEP
 *     parameters:
 *       - in: path
 *         name: cep
 *         required: true
 *         schema:
 *           type: string
 *         description: CEP com 8 dígitos (apenas números ou formatado)
 *         example: "01001000"
 *     responses:
 *       200:
 *         description: Endereço encontrado.
 *       400:
 *         description: CEP inválido.
 *       404:
 *         description: CEP não encontrado.
 */
router.get(
  '/buscar-cep/:cep',
  parceiroController.buscarCep
);

/**
 * @openapi
 * /parceiros/verificar-disponibilidade:
 *   get:
 *     tags:
 *       - Parceiro
 *     summary: Verifica disponibilidade de e-mail ou CNPJ
 *     parameters:
 *       - in: query
 *         name: email
 *         schema:
 *           type: string
 *         description: E-mail a ser verificado
 *       - in: query
 *         name: cnpj
 *         schema:
 *           type: string
 *         description: CNPJ a ser verificado
 *     responses:
 *       200:
 *         description: Retorna se o parâmetro está disponível ou em uso.
 */
router.get(
  '/verificar-disponibilidade',
  parceiroController.verificarDisponibilidade
);

/**
 * @openapi
 * /parceiros/solicitacoes:
 *   get:
 *     tags:
 *       - Parceiro
 *     summary: Lista as solicitações de coleta vinculadas ao parceiro
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: "Filtrar por status (ex: PENDENTE, CONCLUIDO)"
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número da página
 *     responses:
 *       200:
 *         description: Lista de solicitações recuperada.
 *       401:
 *         description: Não autorizado.
 */
router.get(
  '/solicitacoes',
  AuthMiddleware.verify,
  AuthMiddleware.requireRole('parceiro'),
  parceiroController.listar
);
/**
* @openapi
 * /parceiros/pontos-coleta/{id}:
 *   delete:
 *     tags:
 *       - Parceiro
 *     summary: Exclui um ponto de coleta pertencente ao parceiro autenticado
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do ponto de coleta
 *     responses:
 *       204:
 *         description: Ponto de coleta excluído com sucesso.
 *       401:
 *         description: Não autorizado.
 *       403:
 *         description: Você não tem permissão para excluir este ponto.
 *       404:
 *         description: Ponto de coleta não encontrado.
 *       400:
 *         description: ID inválido.
 */
router.delete(
  '/pontos-coleta/:id',
  AuthMiddleware.verify,
  AuthMiddleware.requireRole('parceiro'),
  parceiroController.deletePontoColeta
);
/**
 * @openapi
 * /parceiros/me:
 *   put:
 *     tags:
 *       - Parceiro
 *     summary: Atualiza os dados do parceiro autenticado
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AtualizarParcerioDTO' 
 *     responses:
 *       200:
 *         description: Dados atualizados com sucesso.
 *       400:
 *         description: Dados inválidos.
 *       401:
 *         description: Não autorizado.
 *       409:
 *         description: E-mail ou documento já em uso.
 */
router.put(
  '/me',
  AuthMiddleware.verify,
  AuthMiddleware.requireRole('parceiro'),
  parceiroController.atualizarPerfil
);

export default router;