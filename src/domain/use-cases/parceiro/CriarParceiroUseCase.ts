import { IParceiroRepository } from '../../repositories/IParceiroRepository';
import { IPontoColetaRepository } from '../../repositories/IPontoColetaRepository';
import { CriarParceiroDTO, CriarParceiroDTOSchema } from '../../../shared/dtos/parceiro/CriarParceiroDTO';
import { Email } from '../../value-objects/Email';
import { Documento } from '../../value-objects/Documento';
import { hash } from '../../../shared/utils/hash-utils';
import { Parceiro } from '../../entities/Parceiro';
import { PontoColeta } from '../../entities/PontoColeta';

export class CriarParceiroUseCase {
  constructor(
    private readonly parceiroRepository: IParceiroRepository,
    private readonly pontoColetaRepository: IPontoColetaRepository,
  ) {}

  async execute(input: CriarParceiroDTO) {
    const parsed = CriarParceiroDTOSchema.safeParse(input);

    if (!parsed.success) {
      throw new Error(parsed.error.issues.map((issue) => issue.message).join(', '));
    }

    const data = parsed.data;

    try {
      new Email(data.email);
    } catch {
      throw new Error('E-mail inválido');
    }

    try {
      new Documento(data.documento);
    } catch {
      throw new Error('Documento inválido. Informe um CPF ou CNPJ válido');
    }

    const parceiroExistente = await this.parceiroRepository.findByEmail(data.email);
    if (parceiroExistente) {
      throw new Error('Já existe um parceiro cadastrado com este e-mail');
    }

    const documentoExistente = await this.parceiroRepository.findByDocumento(data.documento);
    if (documentoExistente) {
      throw new Error('Já existe um parceiro cadastrado com este documento');
    }

    if (data.tipoPessoa === 'JURIDICA') {
      if (!data.responsavelLegalNome?.trim()) {
        throw new Error('responsavelLegalNome é obrigatório para pessoas jurídicas');
      }

      if (!data.responsavelLegalCpf?.trim()) {
        throw new Error('responsavelLegalCpf é obrigatório para pessoas jurídicas');
      }
    }

    if (data.tipoPessoa === 'FISICA' && data.nomeSocial && data.nomeSocial.trim().length < 3) {
      throw new Error('nomeSocial deve ter pelo menos 3 caracteres quando informado');
    }

    const senhaHash = await hash(data.senha);

    const parceiroParaCriar: Omit<Parceiro, 'id' | 'criadoEm'> = {
      tipoPessoa: data.tipoPessoa,
      nomeRazaoSocial: data.nomeRazaoSocial,
      email: data.email,
      senhaHash,
      documento: data.documento,
      telefone: data.telefone ?? null,
      responsavelLegalNome: data.responsavelLegalNome ?? null,
      porte: data.porte,
      redesSociais: null,
      aceiteMarketing: data.aceiteMarketing,
      canalAquisicaoId: data.canalAquisicaoId?.toString() ?? null,
      expectativaGeracao: data.expectativaGeracao ?? null,
      statusAprovacaoParceiro: 'PENDENTE',
    };

    const parceiro = await this.parceiroRepository.create(parceiroParaCriar);

    const pontoColetaParaCriar: Omit<PontoColeta, 'id'> = {
      parceiroId: parceiro.id,
        nomePontoColeta: data.nomeRazaoSocial,
      cep: data.cep,
      logradouro: data.logradouro,
      numero: data.numero,
      bairro: data.bairro,
      latitude: data.latitude ?? null,
      longitude: data.longitude ?? null,
      capacidadeBombona: data.capacidadeBombona,
      nivelAtualPct: 0,
      statusBombona: 'VAZIA',
      statusAprovacaoPontoColeta: 'PENDENTE',
    };

    const pontoColeta = await this.pontoColetaRepository.create(pontoColetaParaCriar);

    return {
      parceiro: {
        id: parceiro.id,
        nomeRazaoSocial: parceiro.nomeRazaoSocial,
        email: parceiro.email,
        statusAprovacaoParceiro: parceiro.statusAprovacaoParceiro,
      },
      pontoColeta: {
        id: pontoColeta.id,
        cep: pontoColeta.cep,
        bairro: pontoColeta.bairro,
        statusAprovacaoPontoColeta: pontoColeta.statusAprovacaoPontoColeta,
      },
    };
  }
}
