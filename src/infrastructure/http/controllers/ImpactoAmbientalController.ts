import { Request, Response } from 'express';

import { GetImpactoGeralUseCase } from '../../../domain/use-cases/impacto-ambiental/GetImpactoGeralUseCase';
import { GetImpactoParceiroUseCase } from '../../../domain/use-cases/impacto-ambiental/GetImpactoParceiroUseCase';
import { GetImpactoPontoUseCase } from '../../../domain/use-cases/impacto-ambiental/GetImpactoPontoUseCase';
import { GetImpactoPontoParceiroUseCase } from '../../../domain/use-cases/impacto-ambiental/GetImpactoPontoParceiroUseCase';

export class ImpactoAmbientalController {

  constructor(
    private readonly getImpactoGeralUseCase: GetImpactoGeralUseCase,
    private readonly getImpactoParceiroUseCase: GetImpactoParceiroUseCase,
    private readonly getImpactoPontoUseCase: GetImpactoPontoUseCase,
    private readonly getImpactoPontoParceiroUseCase: GetImpactoPontoParceiroUseCase
  ) {}

  // =====================================================
  // ADMIN - IMPACTO GERAL DO SISTEMA
  // =====================================================

  async geral(req: Request, res: Response): Promise<Response> {
    try {
      const resultado =
        await this.getImpactoGeralUseCase.execute();

      return res.status(200).json({
        success: true,
        data: resultado,
      });

    } catch (error) {
      console.error(
        'Erro ao buscar impacto ambiental geral:',
        error
      );

      return res.status(500).json({
        success: false,
        message: 'Erro ao buscar impacto ambiental geral',
      });
    }
  }

  // =====================================================
  // ADMIN - IMPACTO DE UM PARCEIRO
  // =====================================================

  async parceiroAdmin(
    req: Request,
    res: Response
  ): Promise<Response> {

    try {
      const parceiroId =
        Number(req.params.parceiroId);

      if (
        !Number.isInteger(parceiroId) ||
        parceiroId <= 0
      ) {
        return res.status(400).json({
          success: false,
          message: 'ID do parceiro inválido',
        });
      }

      const resultado =
        await this.getImpactoParceiroUseCase.execute(
          parceiroId
        );

      return res.status(200).json({
        success: true,
        data: resultado,
      });

    } catch (error) {
      console.error(
        'Erro ao buscar impacto do parceiro:',
        error
      );

      return res.status(404).json({
        success: false,
        message: 'Parceiro não encontrado',
      });
    }
  }

  // =====================================================
  // ADMIN - IMPACTO DE UM PONTO
  // =====================================================

  async pontoAdmin(
    req: Request,
    res: Response
  ): Promise<Response> {

    try {
      const pontoId =
        Number(req.params.pontoId);

      if (
        !Number.isInteger(pontoId) ||
        pontoId <= 0
      ) {
        return res.status(400).json({
          success: false,
          message: 'ID do ponto inválido',
        });
      }

      const resultado =
        await this.getImpactoPontoUseCase.execute(
          pontoId
        );

      return res.status(200).json({
        success: true,
        data: resultado,
      });

    } catch (error) {
      console.error(
        'Erro ao buscar impacto do ponto:',
        error
      );

      return res.status(404).json({
        success: false,
        message: 'Ponto de coleta não encontrado',
      });
    }
  }

  // =====================================================
  // PARCEIRO - MEU IMPACTO GERAL
  // =====================================================

  async meuImpacto(
    req: Request,
    res: Response
  ): Promise<Response> {

    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Usuário não autenticado',
        });
      }

      const parceiroId = req.user.id;

      const resultado =
        await this.getImpactoParceiroUseCase.execute(
          parceiroId
        );

      return res.status(200).json({
        success: true,
        data: resultado,
      });

    } catch (error) {
      console.error(
        'Erro ao buscar impacto do parceiro logado:',
        error
      );

      return res.status(500).json({
        success: false,
        message: 'Erro ao buscar impacto ambiental',
      });
    }
  }

  // =====================================================
  // PARCEIRO - IMPACTO DE UM DOS PRÓPRIOS PONTOS
  // =====================================================

  async meuPonto(
    req: Request,
    res: Response
  ): Promise<Response> {

    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Usuário não autenticado',
        });
      }

      const parceiroId = req.user.id;
      const pontoId = Number(req.params.pontoId);

      if (
        !Number.isInteger(pontoId) ||
        pontoId <= 0
      ) {
        return res.status(400).json({
          success: false,
          message: 'ID do ponto inválido',
        });
      }

      const resultado =
        await this.getImpactoPontoParceiroUseCase.execute(
          parceiroId,
          pontoId
        );

      return res.status(200).json({
        success: true,
        data: resultado,
      });

    } catch (error) {
      console.error(
        'Erro ao buscar impacto do ponto:',
        error
      );

      return res.status(404).json({
        success: false,
        message:
          'Ponto de coleta não encontrado ou não pertence ao parceiro',
      });
    }
  }
}