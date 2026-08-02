import bcrypt from 'bcrypt';
import { CriarParceiroDTO } from '../../../shared/dtos/parceiro/CriarParceiroDTO';
import {
  ParceiroFisica,
  ParceiroJuridica,
  Parceiro // Certifique-se de exportar isso nas entidades se necessário
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

    let parceiroData: Omit<ParceiroFisica, 'id' | 'criadoEm'> | Omit<ParceiroJuridica, 'id' | 'criadoEm'>;

    if (tipoPessoa === 'FISICA') {
      parceiroData = {
        tipoPessoa: 'FISICA',
        tipoParceiro: data.tipoParceiro ?? 'SOLIDARIO',
        nomeRazaoSocial: data.nomeRazaoSocial,
        nomeSocial: data.nomeSocial ?? null,
        email: data.email,
        senhaHash,
        documento: data.documento,
        telefone: data.telefone ?? null,
        redesSociais: data.redesSociais ?? null,
        aceiteMarketing: data.aceiteMarketing ?? false,
        parceiroIndicadorId: data.parceiroIndicadorId,
        statusAprovacaoParceiro: 'PENDENTE',
      };
    } else {
      parceiroData = {
        tipoPessoa: 'JURIDICA',
        tipoParceiro: data.tipoParceiro ?? 'INSTITUCIONAL',
        nomeRazaoSocial: data.nomeRazaoSocial,
        nomeSocial: data.nomeSocial ?? null,
        email: data.email,
        senhaHash,
        documento: data.documento,
        telefone: data.telefone ?? null,
        redesSociais: data.redesSociais ?? null,
        aceiteMarketing: data.aceiteMarketing ?? false,
        parceiroIndicadorId: data.parceiroIndicadorId,
        statusAprovacaoParceiro: 'PENDENTE',
        responsavelLegalNome: data.responsavelLegalNome!,
        responsavelLegalCpf: data.responsavelLegalCpf!,
      };
    }

    const parceiro = await this.parceiroRepository.create(parceiroData);

    const capacidadeBombona =
      data.capacidadeBombona ??
      this.determinarCapacidade(data.tipoPorte ?? 'MEDIO');

    const pontoColetaData: Omit<PontoColeta, 'id' | 'criadoEm'> = {
      parceiroId: parceiro.id,
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
      nomePontoColeta: `Ponto ${data.nomeRazaoSocial}`,
      
    };

    const pontoColeta =
      await this.pontoColetaRepository.create(pontoColetaData);

    this.enviarEmailConfirmacao(parceiro).catch((err) => {
      console.error('Erro ao enviar e-mail:', err);
    });

    // const { senhaHash: _, ...parceiroSemSenha } = parceiro;

    return {
    //   ...parceiroSemSenha,
      mensagem:
        'Cadastro realizado com sucesso! Aguarde a aprovação da equipe.',
    //   pontoColeta,
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

    if (data.responsavelLegalCpf) {
      try {
        const cpfResponsavel = new Documento(data.responsavelLegalCpf);
        if (cpfResponsavel.getTipo() !== 'CPF') {
          throw new Error('CPF do responsável legal inválido.');
        }
      } catch (error) {
        throw new Error('CPF do responsável legal inválido: ' + (error as Error).message);
      }
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

 private async enviarEmailConfirmacao(parceiro: { nomeRazaoSocial: string; email: string }) {
    const template = renderParceiroStatusEmail({
      nome: parceiro.nomeRazaoSocial,
      status: 'PENDENTE',
    });

    await EmailService.send({
      to: parceiro.email,
      subject: template.subject,
      html: template.html,
    });
  }}