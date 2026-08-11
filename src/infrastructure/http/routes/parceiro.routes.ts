import { Router } from 'express';
import axios from 'axios';

import { SupabaseParceiroRepository } from '../../../infrastructure/repositories/SupabaseParceiroRepository';
import { SupabasePontoColetaRepository } from '../../../infrastructure/repositories/SupabasePontoColetaRepository';
import { SupabaseSolicitacaoRepository } from '../../../infrastructure/repositories/SupabaseSolicitacaoRepository';
import { CriarParceiroUseCase } from '../../../domain/use-cases/parceiro/CriarParceiroUseCase';
import { LoginParceiroUseCase } from '../../../domain/use-cases/parceiro/LoginParceiroUseCase';
import { GetParceiroLogadoUseCase } from '../../../domain/use-cases/parceiro/GetParceiroLogadoUseCase';
import { VerificarDisponibilidadeUseCase } from '../../../domain/use-cases/parceiro/VerificarDisponibilidadeUseCase';
import { ListarSolicitacoesColetaUseCase } from "../../../domain/use-cases/solicitacao/ListarSolicitacoesColetaUseCase";
import { ParceiroController } from '../controllers/ParceiroController';
const solicitacaoRepository = new SupabaseSolicitacaoRepository();
import {
  AuthMiddleware,
  loginLimiter,
} from '../middlewares/AuthMiddleware';

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
    solicitacaoRepository,
    pontoColetaRepository
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
 *               - nome
 *               - razaoSocial
 *               - email
 *               - senha
 *               - confirmarSenha
 *               - telefone
 *               - tipoPessoa
 *               - documento
 *               - cep
 *               - logradouro
 *               - numero
 *               - bairro
 *               - cidade
 *               - aceiteTermos
 *             properties:
 *
 *               nome:
 *                 type: string
 *                 example: "João da Silva"
 *                 description: Nome do parceiro.
 *
 *               razaoSocial:
 *                 type: string
 *                 example: "Empresa Exemplo LTDA"
 *                 description: Razão social do parceiro.
 *
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "joao@exemplo.com"
 *
 *               senha:
 *                 type: string
 *                 format: password
 *                 minLength: 6
 *                 example: "123456"
 *
 *               confirmarSenha:
 *                 type: string
 *                 format: password
 *                 minLength: 6
 *                 example: "123456"
 *
 *               telefone:
 *                 type: string
 *                 example: "77999999999"
 *                 description: Telefone contendo apenas números.
 *
 *               tipoPessoa:
 *                 type: string
 *                 enum:
 *                   - FISICA
 *                   - JURIDICA
 *                 example: JURIDICA
 *
 *               tipoPerfil:
 *                 type: string
 *                 enum:
 *                   - INSTITUCIONAL
 *                   - COMUNITARIO
 *                   - SOLIDARIO
 *                 example: COMUNITARIO
 *
 *               categoriaPerfil:
 *                 type: string
 *                 example: "Associação"
 *
 *               categoria:
 *                 type: integer
 *                 enum:
 *                   - 1
 *                   - 2
 *                   - 3
 *                   - 4
 *                   - 5
 *                   - 6
 *                   - 7
 *                 example: 1
 *
 *               documento:
 *                 type: string
 *                 pattern: '^\d+$'
 *                 example: "12345678000199"
 *                 description: CPF ou CNPJ, de acordo com o tipo de pessoa.
 *
 *               responsavelLegal:
 *                 type: string
 *                 example: "Maria da Silva"
 *                 description: Nome do responsável legal. Obrigatório para pessoa jurídica.
 *
 *               redesSociais:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example:
 *                   - "https://instagram.com/exemplo"
 *                   - "https://facebook.com/exemplo"
 *
 *               cep:
 *                 type: string
 *                 pattern: '^\d{8}$'
 *                 example: "45700000"
 *
 *               logradouro:
 *                 type: string
 *                 example: "Rua Exemplo"
 *
 *               numero:
 *                 type: string
 *                 example: "123"
 *
 *               bairro:
 *                 type: string
 *                 example: "Centro"
 *
 *               cidade:
 *                 type: string
 *                 example: "Itapetinga"
 *
 *               estado:
 *                 type: string
 *                 example: "BA"
 *
 *               complemento:
 *                 type: string
 *                 example: "Sala 2"
 *
 *               aceiteMarketing:
 *                 type: boolean
 *                 default: false
 *                 example: true
 *
 *               parceiroIndicadorId:
 *                 type: integer
 *                 nullable: true
 *                 minimum: 1
 *                 example: 1
 *
 *               outroParceiro:
 *                 type: string
 *                 nullable: true
 *                 example: "Indicação de outro parceiro"
 *
 *               comoConheceu:
 *                 type: string
 *                 nullable: true
 *                 example: "Indicação"
 *
 *               observacao:
 *                 type: string
 *                 nullable: true
 *                 example: "Parceiro interessado em coleta recorrente."
 *
 *               tipoParceiro:
 *                 type: string
 *                 enum:
 *                   - INSTITUCIONAL
 *                   - COMUNITARIO
 *                   - SOLIDARIO
 *                 example: COMUNITARIO
 *
 *               tipoPorte:
 *                 type: string
 *                 enum:
 *                   - PEQUENO
 *                   - MEDIO
 *                   - GRANDE
 *                 example: PEQUENO
 *
 *               capacidadeBombona:
 *                 type: number
 *                 format: double
 *                 minimum: 0
 *                 exclusiveMinimum: true
 *                 example: 50
 *
 *               expectativaGeracao:
 *                 type: number
 *                 format: double
 *                 minimum: 0
 *                 example: 25
 *
 *               nivelAtualPct:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 100
 *                 example: 40
 *
 *               aceiteTermos:
 *                 type: boolean
 *                 enum:
 *                   - true
 *                 example: true
 *
 *     responses:
 *       201:
 *         description: Parceiro cadastrado com sucesso
 *
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