import { Router } from 'express';
import axios from 'axios';

import { SupabaseParceiroRepository } from '../../../infrastructure/repositories/SupabaseParceiroRepository';
import { SupabasePontoColetaRepository } from '../../../infrastructure/repositories/SupabasePontoColetaRepository';

import { CriarParceiroUseCase } from '../../../domain/use-cases/parceiro/CriarParceiroUseCase';
import { LoginParceiroUseCase } from '../../../domain/use-cases/parceiro/LoginParceiroUseCase';
import { GetParceiroLogadoUseCase } from '../../../domain/use-cases/parceiro/GetParceiroLogadoUseCase';
import { VerificarDisponibilidadeUseCase } from '../../../domain/use-cases/parceiro/VerificarDisponibilidadeUseCase';

import { ParceiroController } from '../controllers/ParceiroController';
import {
  AuthMiddleware,
  loginLimiter,
} from '../middlewares/AuthMiddleware';
import { ListarParceirosIndicadorAtivos } from '../../../domain/use-cases/parceiroIndicador/ListarParceirosIndicadorAtivos';
import { ListarSolicitacoesColetaQuerySchema } from '../../../shared/dtos/solicitacaoColeta/ListarSolicitacoesColetaQueryDTO';

const router = Router();

// ======================
// DEPENDÊNCIAS
// ======================

const parceiroRepository = new SupabaseParceiroRepository();
const pontoColetaRepository = new SupabasePontoColetaRepository();

const criarParceiroUseCase = new CriarParceiroUseCase(
  parceiroRepository,
  pontoColetaRepository
);

const loginParceiroUseCase = new LoginParceiroUseCase(
  parceiroRepository
);

const getParceiroLogadoUseCase = new  GetParceiroLogadoUseCase(
  parceiroRepository,
  pontoColetaRepository
);

const verificarDisponibilidadeUseCase = new VerificarDisponibilidadeUseCase(
  parceiroRepository
);
const  listarSolicitacoesColetaUseCase = new ListarSolicitacoesColetaUseCase(
    parceiroRepository
    );
const parceiroController = new ParceiroController(
  getParceiroLogadoUseCase,
  verificarDisponibilidadeUseCase,
  listarSolicitacoesColetaUseCase
  
);

// ======================
// SWAGGER / ROTAS
// ======================

/**
 * @swagger
 * tags:
 *   - name: Parceiro
 *     description: Operações relacionadas aos parceiros
 */

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
 *             type: object
 *             required:
 *               - tipoPessoa
 *               - nomeRazaoSocial
 *               - email
 *               - senha
 *               - documento
 *               - cep
 *               - logradouro
 *               - numero
 *               - bairro
 *             properties:
 *               tipoPessoa:
 *                 type: string
 *                 enum: [JURIDICA, FISICA]
 *               tipoParceiro:
 *                 type: string
 *                 enum: [INSTITUCIONAL, COMUNITARIO, SOLIDARIO]
 *               nomeRazaoSocial:
 *                 type: string
 *               nomeSocial:
 *                 type: string
 *               email:
 *                 type: string
 *               senha:
 *                 type: string
 *               documento:
 *                 type: string
 *               telefone:
 *                 type: string
 *               redesSociais:
 *                 type: array
 *                 items:
 *                   type: string
 *               aceiteMarketing:
 *                 type: boolean
 *               parceiroIndicadorId:
 *                 type: string
 *               responsavelLegalNome:
 *                 type: string
 *               responsavelLegalCpf:
 *                 type: string
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
 *     responses:
 *       201:
 *         description: Parceiro cadastrado com sucesso
 *       400:
 *         description: Dados inválidos ou duplicados
 */
router.post('/register', async (req, res) => {
  try {
    const result = await criarParceiroUseCase.execute(req.body);

    return res.status(201).json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Erro inesperado';

    return res.status(400).json({ message });
  }
});

/**
 * @openapi
 * /parceiros/login:
 *   post:
 *     tags:
 *       - Parceiro
 *     summary: Login de parceiro
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - senha
 *             properties:
 *               email:
 *                 type: string
 *               senha:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *       401:
 *         description: Credenciais inválidas
 *       429:
 *         description: Muitas tentativas de login
 */
router.post('/login', loginLimiter, async (req, res) => {
  try {
    const result = await loginParceiroUseCase.execute(req.body);

    return res.status(200).json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Erro inesperado';

    return res.status(401).json({ message });
  }
});

/**
 * @openapi
 * /parceiros/me:
 *   get:
 *     tags:
 *       - Parceiro
 *     summary: Dados do parceiro logado
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dados do parceiro
 *       401:
 *         description: Não autorizado
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
 *     tags:
 *       - Parceiro
 *     summary: Realiza logout do parceiro
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
  (_req, res) => {
    return res.status(200).json({
      message: 'Logout realizado com sucesso. Descarte o token no cliente.',
    });
  }
);

/**
 * @openapi
 * /parceiros/buscar-cep/{cep}:
 *   get:
 *     tags:
 *       - Parceiro
 *     summary: Buscar endereço por CEP
 *     parameters:
 *       - in: path
 *         name: cep
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Dados do endereço
 *       400:
 *         description: CEP inválido
 *       404:
 *         description: CEP não encontrado
 */
router.get('/buscar-cep/:cep', async (req, res) => {
  try {
    const { cep } = req.params;
    const cepLimpo = cep.replace(/\D/g, '');

    if (cepLimpo.length !== 8) {
      return res.status(400).json({
        message: 'CEP inválido',
      });
    }

    const response = await axios.get(
      `https://viacep.com.br/ws/${cepLimpo}/json/`
    );

    if (response.data.erro) {
      return res.status(404).json({
        message: 'CEP não encontrado',
      });
    }

    const endereco = {
      cep: response.data.cep.replace(/\D/g, ''),
      logradouro: response.data.logradouro,
      bairro: response.data.bairro,
      cidade: response.data.localidade,
      estado: response.data.uf,
      complemento: response.data.complemento,
      latitude: null,
      longitude: null,
    };

    return res.status(200).json(endereco);
  } catch (error) {
    console.error('Erro ao buscar CEP:', error);

    return res.status(500).json({
      message: 'Erro ao buscar dados do CEP',
    });
  }
});

/**
 * @openapi
 * /parceiros/verificar-disponibilidade:
 *   get:
 *     tags:
 *       - Parceiro
 *     summary: Verificar disponibilidade de e-mail ou documento
 *     parameters:
 *       - in: query
 *         name: email
 *         required: false
 *         schema:
 *           type: string
 *       - in: query
 *         name: documento
 *         required: false
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Status de disponibilidade retornado com sucesso
 *       400:
 *         description: Parâmetro inválido ou ausente
 */
router.get('/verificar-disponibilidade', (req, res) => 
  parceiroController.verificarDisponibilidade(req, res)
);

export default router;