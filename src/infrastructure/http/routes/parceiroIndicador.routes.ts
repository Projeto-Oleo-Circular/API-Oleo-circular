import { Router } from 'express';

import { ParceiroIndicadorController } from '../controllers/ParceiroIndicadorController';
import { ListarParceirosIndicadorAtivos } from '../../../domain/use-cases/parceiroIndicador/ListarParceirosIndicadorAtivos';
import { DBScriptParceiroIndicadorRepository } from '../../repositories/DBScriptParceiroIndicadorRepository';

const router = Router();

const parceiroIndicadorRepository = new DBScriptParceiroIndicadorRepository();

const listarParceirosIndicadorAtivos = new ListarParceirosIndicadorAtivos(
  parceiroIndicadorRepository
);

const parceiroIndicadorController = new ParceiroIndicadorController(
  listarParceirosIndicadorAtivos
);

/**
 * @swagger
 * /parceiros-indicadores:
 *   get:
 *     tags:
 *       - Parceiros Indicadores
 *     summary: Lista os parceiros indicadores ativos
 *     description: Retorna todos os parceiros indicadores ativos ordenados por nome.
 *     responses:
 *       200:
 *         description: Lista de parceiros indicadores.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   nome:
 *                     type: string
 *                     example: Associação Exemplo
 *                   tipo:
 *                     type: string
 *                     example: ASSOCIACAO
 *                   cnpj:
 *                     type: string
 *                     example: "12.345.678/0001-90"
 *                   email:
 *                     type: string
 *                     nullable: true
 *                     example: contato@exemplo.org
 *                   telefone:
 *                     type: string
 *                     nullable: true
 *                     example: "(11) 99999-9999"
 *                   site:
 *                     type: string
 *                     nullable: true
 *                     example: https://exemplo.org
 *                   ativo:
 *                     type: boolean
 *                     example: true
 *                   criadoEm:
 *                     type: string
 *                     format: date-time
 */
router.get('/', (req, res) =>
  parceiroIndicadorController.listarAtivos(req, res)
);

export default router;