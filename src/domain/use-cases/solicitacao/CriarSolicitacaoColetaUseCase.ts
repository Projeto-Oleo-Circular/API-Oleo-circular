import { ISolicitacaoColetaRepository } from '../../../domain/repositories/ISolicitacaoColetaRepository';
import { IPontoColetaRepository } from '../../repositories/IPontoColetaRepository';

import {
  CriarSolicitacaoColetaDTO,
  CriarSolicitacaoColetaDTOSchema
} from '../../../shared/dtos/solicitacaoColeta/CriarSolicitacaoDTO';

import { EmailService } from '../../../infrastructure/services/Email/EmailService';

import {
  novaSolicitacaoColetaTemplate
} from '../../../infrastructure/services/Email/templates/adminTemplateEmail/solicitacaoColeta.template';


export class CriarSolicitacaoColetaUseCase {

  constructor(
    private readonly solicitacaoRepository: ISolicitacaoColetaRepository,
    private readonly pontoColetaRepository: IPontoColetaRepository
  ) {}


  async execute(
    parceiroLogadoId: number,
    data: CriarSolicitacaoColetaDTO
  ) {

    const parsed =
      CriarSolicitacaoColetaDTOSchema.safeParse(data);


    if (!parsed.success) {
      throw new Error(
        parsed.error.issues
          .map(issue => issue.message)
          .join(', ')
      );
    }


    const {
      pontoColetaId,
      volumeInformado,
      observacoes
    } = parsed.data;


    const pontoColeta =
      await this.pontoColetaRepository.findById(
        pontoColetaId
      );


    if (!pontoColeta) {
      throw new Error(
        'Ponto de coleta não encontrado.'
      );
    }


    if (
      Number(pontoColeta.parceiroId) !==
      Number(parceiroLogadoId)
    ) {
      throw new Error(
        'Este ponto de coleta não pertence ao parceiro.'
      );
    }


    const solicitacao =
      await this.solicitacaoRepository.create({

        pontoColetaId,

        volumeInformado,

        observacoes:
          observacoes ?? null,

        status: 'AGUARDANDO'

      });


    void this.notificarAdmin(
      pontoColeta,
      solicitacao
    );


    return {
      solicitacao,
      mensagem:
        'Solicitação criada com sucesso! Aguarde aprovação do administrador.'
    };

  }


  private async notificarAdmin(
    pontoColeta: any,
    solicitacao: any
  ) {

    const html =
      novaSolicitacaoColetaTemplate({

        nomePonto:
          pontoColeta.nomePontoColeta,

        endereco:
          `${pontoColeta.logradouro}, ${pontoColeta.numero}`,

        cidade:
          pontoColeta.cidade,

        estado:
          pontoColeta.estado,

        volume:
          solicitacao.volumeInformado,

        solicitacaoId:
          solicitacao.id
      });


    await EmailService.send({

      to:
        process.env.ADMIN_EMAIL!,

      subject:
        `Nova Solicitação de Coleta #${solicitacao.id}`,

      html

    });

  }

}