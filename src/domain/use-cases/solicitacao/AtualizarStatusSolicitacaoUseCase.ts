import { ISolicitacaoColetaRepository } from '../../../domain/repositories/ISolicitacaoColetaRepository';
import { IPontoColetaRepository } from '../../../domain/repositories/IPontoColetaRepository';
import { IParceiroRepository } from '../../../domain/repositories/IParceiroRepository';
import { AtualizarStatusSolicitacaoDTOSchema, AtualizarStatusSolicitacaoDTO } from '../../../shared/dtos/solicitacaoColeta/AtualizarStatusSolicitacaoDTO';
import { EmailService } from '../../../infrastructure/services/Email/EmailService';
import { renderColetaEmail } from '../../../infrastructure/services/Email/templates/pontoColetaTemplateEmail/coleta.template';

const statusToColetaStatus = (status: string) => {
  switch (status) {
    case 'AGUARDANDO':
      return 'SOLICITADA';
    case 'AGENDADA':
      return 'AGENDADA';
    case 'EM_ROTA':
      return 'EM_ANDAMENTO';
    case 'CONCLUIDA':
      return 'CONCLUIDA';
    default:
      return 'SOLICITADA';
  }
};

export class AtualizarStatusSolicitacaoUseCase {
  constructor(
    private readonly solicitacaoRepository: ISolicitacaoColetaRepository,
    private readonly pontoColetaRepository: IPontoColetaRepository,
    private readonly parceiroRepository: IParceiroRepository,
  ) {}

  async execute(
    solicitacaoId: number,
    input: AtualizarStatusSolicitacaoDTO,
  ) {
    const parsed = AtualizarStatusSolicitacaoDTOSchema.safeParse(input);

    if (!parsed.success) {
      throw new Error(parsed.error.issues.map((issue) => issue.message).join(', '));
    }

    const data = parsed.data;

    const solicitacao = await this.solicitacaoRepository.findById(solicitacaoId);
    if (!solicitacao) {
      throw new Error('Solicitação de coleta não encontrada.');
    }

    const pontoColeta = await this.pontoColetaRepository.findById(
      solicitacao.pontoColetaId,
    );

    if (!pontoColeta) {
      throw new Error('Ponto de coleta vinculado à solicitação não encontrado.');
    }

    const parceiro = await this.parceiroRepository.findById(pontoColeta.parceiroId);
    if (!parceiro) {
      throw new Error('Parceiro responsável pelo ponto de coleta não encontrado.');
    }

    const updatePayload: Partial<typeof solicitacao> = {
      status: data.status,
      observacoes: data.observacoes ?? solicitacao.observacoes,
    };

    if (data.status === 'AGENDADA') {
      updatePayload.dataAgendamento = data.dataAgendamento ?? null;
    }

    if (data.status === 'CONCLUIDA') {
    updatePayload.volumeColetado = data.volumeColetado ?? null;
    updatePayload.dataConclusao = new Date().toISOString();

    await this.pontoColetaRepository.update(pontoColeta.id, {
        nivelAtualPct: 0, 
    });
    }

    const solicitacaoAtualizada = await this.solicitacaoRepository.update(
      solicitacaoId,
      updatePayload,
    );

    const coletaStatus = statusToColetaStatus(data.status);
    const endereco = `${pontoColeta.logradouro}, ${pontoColeta.numero} - ${pontoColeta.bairro}`;

    const emailTemplate = renderColetaEmail({
      nome: parceiro.razaoSocial,
      endereco,
      dataColeta: data.dataAgendamento,
      status: coletaStatus,
      observacao: data.observacoes,
    });

    EmailService.send({
      to: parceiro.email,
      subject: `Atualização de status da coleta #${solicitacaoAtualizada.id}`,
      html: emailTemplate.html,
    }).catch((error) => {
      console.error('Falha ao enviar notificação de status da coleta por e-mail:', error);
    });

    return solicitacaoAtualizada;
  }
}