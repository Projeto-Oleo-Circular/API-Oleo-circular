import bcrypt from 'bcrypt';
import { CriarParceiroDTO } from '../../../shared/dtos/parceiro/CriarParceiroDTO';
import {
  Parceiro
} from '../../entities/Parceiro';
import { PontoColeta } from '../../entities/PontoColeta';
import { IParceiroRepository } from '../../repositories/IParceiroRepository';
import { IPontoColetaRepository } from '../../repositories/IPontoColetaRepository';
import { EmailService } from '../../../infrastructure/services/Email/EmailService';
import { renderParceiroStatusEmail } from '../../../infrastructure/services/Email/templates/parceiroUserTemplateEmail/parceiro.template';
import { Documento } from '../../value-objects/Documento';

export class CriarParceiroUseCase {
  constructor(
    private readonly parceiroRepository: IParceiroRepository,
    private readonly pontoColetaRepository: IPontoColetaRepository
  ) {}

  async execute(data: CriarParceiroDTO) {
    await this.validarUnicidade(data.email, data.documento);

    if (!data.tipoPessoa) {
      throw new Error('Tipo de pessoa é obrigatório');
    }

    const tipoPessoa = data.tipoPessoa;

    this.validarDadosPorTipoPessoa(tipoPessoa, data);

    const senhaHash = await bcrypt.hash(data.senha, 10);

    let parceiroData: any;

    if (tipoPessoa === 'FISICA') {
      parceiroData = {
        tipoPessoa: 'FISICA',
        tipoParceiro: data.tipoParceiro ?? 'SOLIDARIO',
        razaoSocial: data.razaoSocial,
        nome: data.nome ,
        email: data.email,
        senhaHash,
        documento: data.documento,
        telefone: data.telefone ?? null,
        redesSociais: data.redesSociais ?? null,
        aceiteMarketing: data.aceiteMarketing ?? false,
        parceiroIndicadorId: data.parceiroIndicadorId ?? null,
        outroParceiro: data.outroParceiro ?? null, 
        comoConheceu: data.comoConheceu ?? null,   
        observacao: data.observacao ?? null,     
        statusAprovacaoParceiro: 'PENDENTE',
      };
    } else {
      parceiroData = {
        tipoPessoa: 'JURIDICA',
        tipoParceiro: data.tipoParceiro ?? 'INSTITUCIONAL',
        razaoSocial: data.razaoSocial,
        nome: data.nome ?? null,
        email: data.email,
        senhaHash,
        documento: data.documento,
        telefone: data.telefone ?? null,
        redesSociais: data.redesSociais ?? null,
        aceiteMarketing: data.aceiteMarketing ?? false,
        parceiroIndicadorId: data.parceiroIndicadorId ?? null,
        outroParceiro: data.outroParceiro ?? null, 
        comoConheceu: data.comoConheceu ?? null,  
        observacao: data.observacao ?? null,       
        statusAprovacaoParceiro: 'PENDENTE',
        responsavelLegal: data.responsavelLegal,
      };
    }

    const parceiro = await this.parceiroRepository.create(parceiroData);

    const capacidadeBombona =
      data.capacidadeBombona ??
      this.determinarCapacidade(data.tipoPorte ?? 'MEDIO');

    const pontoColetaData: Omit<PontoColeta, 'id' | 'criadoEm'> = {
      parceiroId: parceiro.id,
      categoria: data.categoria ?? 7,
      cep: data.cep,
      logradouro: data.logradouro,
      numero: data.numero,
      bairro: data.bairro,
      cidade: data.cidade ?? 'Não informado',
      estado: data.estado,
      complemento: data.complemento,
      capacidadeBombona,
      expectativaGeracao: data.expectativaGeracao ?? 0,
      nivelAtualPct: data.nivelAtualPct ?? 0,
      statusBombona: 'VAZIA',
      statusAprovacaoPontoColeta: 'PENDENTE',
      nomePontoColeta: `Ponto ${data.razaoSocial}`,
      longitude: String(data.longitude),
      latitude: String(data.latitude),
    };

    await this.pontoColetaRepository.create(pontoColetaData);

    this.enviarEmailConfirmacao(parceiro).catch((err) => {
      console.error('Erro ao enviar e-mail:', err);
    });

    return {
      mensagem:
        'Cadastro realizado com sucesso! Aguarde a aprovação da equipe.',
    };
  }

  private async validarUnicidade(email: string, documento: string) {
    const emailExiste = await this.parceiroRepository.findByEmail(email);

    if (emailExiste) {
      throw new Error('E-mail já cadastrado');
    }

    const documentoExiste =
      await this.parceiroRepository.findByDocumento(documento);

    if (documentoExiste) {
      throw new Error('Documento já cadastrado');
    }
  }

  private validarDadosPorTipoPessoa(
    tipoPessoa: 'FISICA' | 'JURIDICA',
    data: CriarParceiroDTO
  ) {
    let documento;
    try {
      documento = new Documento(data.documento);
    } catch (error) {
      throw new Error('Documento inválido: ' + (error as Error).message);
    }

    if (tipoPessoa === 'FISICA' && documento.getTipo() !== 'CPF') {
      throw new Error('Pessoa Física deve ter um CPF como documento.');
    }
    if (tipoPessoa === 'JURIDICA' && documento.getTipo() !== 'CNPJ') {
      throw new Error('Pessoa Jurídica deve ter um CNPJ como documento.');
    }

   
  }

  private determinarCapacidade(porte: string): number {
    const capacidades: Record<string, number> = {
      PEQUENO: 10,
      MEDIO: 20,
      GRANDE: 30,
    };

    return capacidades[porte] ?? 20;
  }

  private async enviarEmailConfirmacao(parceiro: { razaoSocial: string; email: string , nome: string}) {
    const template = renderParceiroStatusEmail({
      nome: parceiro.razaoSocial || parceiro.nome,
      status: 'PENDENTE',
    });

    await EmailService.send({
      to: parceiro.email,
      subject: template.subject,
      html: template.html,
    });
  }
}