import { ISolicitacaoColetaRepository } from '../../../domain/repositories/ISolicitacaoColetaRepository';
import { IPontoColetaRepository } from '../../repositories/IPontoColetaRepository';
import { IParceiroRepository } from '../../../domain/repositories/IParceiroRepository';

import {
  CriarSolicitacaoColetaDTO,
  CriarSolicitacaoColetaDTOSchema,
} from '../../../shared/dtos/solicitacaoColeta/CriarSolicitacaoDTO';

import { EmailService } from '../../../infrastructure/services/Email/EmailService';

import {
  novaSolicitacaoColetaAdminTemplate,
  confirmacaoSolicitacaoParceiroTemplate,
} from '../../../infrastructure/services/Email/templates/adminTemplateEmail/solicitacaoColeta.template';

export class CriarSolicitacaoColetaUseCase {
  constructor(
    private readonly solicitacaoRepository: ISolicitacaoColetaRepository,
    private readonly pontoColetaRepository: IPontoColetaRepository,
    private readonly parceiroRepository: IParceiroRepository,
  ) {}

  async execute(
    parceiroLogadoId: number,
    data: CriarSolicitacaoColetaDTO
  ) {
    const parsed = CriarSolicitacaoColetaDTOSchema.safeParse(data);

    if (!parsed.success) {
      throw new Error(
        parsed.error.issues.map((issue) => issue.message).join(', ')
      );
    }

    const { pontoColetaId, volumeInformado, observacoes } = parsed.data;

    const pontoColeta = await this.pontoColetaRepository.findById(pontoColetaId);

    if (!pontoColeta) {
      throw new Error('Ponto de coleta não encontrado.');
    }

    if (Number(pontoColeta.parceiroId) !== Number(parceiroLogadoId)) {
      throw new Error('Este ponto de coleta não pertence ao parceiro logado.');
    }

    const solicitacaoAtiva = await this.solicitacaoRepository.findAtivaByPontoColetaId(pontoColetaId);

    if (solicitacaoAtiva) {
      throw new Error(
        'Este ponto de coleta já possui uma solicitação de coleta em andamento. Aguarde a conclusão para solicitar novamente.'
      );
    }

    const parceiro = await this.parceiroRepository.findById(pontoColeta.parceiroId);
    if (!parceiro) {
      throw new Error('Parceiro responsável pelo ponto de coleta não encontrado.');
    }

    const solicitacao = await this.solicitacaoRepository.create({
      pontoColetaId,
      volumeInformado,
      observacoes: observacoes ?? null,
      status: 'AGUARDANDO',
      volumeColetado: null,
      dataAgendamento: null,
      dataConclusao: null,
    });

    const endereco = `${pontoColeta.logradouro}, ${pontoColeta.numero} - ${pontoColeta.bairro}`;
    const nomePonto = pontoColeta.nomePontoColeta ?? 'Ponto de Coleta';
    const adminEmail = process.env.ADMIN_EMAIL;

    if (adminEmail) {
      const templateAdmin = novaSolicitacaoColetaAdminTemplate({
        nomePonto,
        endereco,
        cidade: pontoColeta.cidade,
        estado: pontoColeta.estado ?? '',
        volume: solicitacao.volumeInformado,
        solicitacaoId: solicitacao.id,
      });

      EmailService.send({
        to: adminEmail,
        subject: templateAdmin.subject,
        html: templateAdmin.html,
      }).catch((error) => {
        console.error('Falha ao notificar admin por e-mail:', error);
      });
    }

    if (parceiro.email) {
      const nomeParceiro = parceiro.razaoSocial || parceiro.nome || 'Parceiro';

      const templateParceiro = confirmacaoSolicitacaoParceiroTemplate({
        nomeParceiro,
        nomePonto,
        endereco,
        volume: solicitacao.volumeInformado,
        solicitacaoId: solicitacao.id,
      });

      EmailService.send({
        to: parceiro.email,
        subject: templateParceiro.subject,
        html: templateParceiro.html,
      }).catch((error) => {
        console.error('Falha ao notificar parceiro por e-mail:', error);
      });
    }

    return {
      solicitacao,
      mensagem: 'Solicitação criada com sucesso! Aguarde aprovação do administrador.',
    };
  }
}