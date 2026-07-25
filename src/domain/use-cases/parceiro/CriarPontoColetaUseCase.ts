// domain/use-cases/parceiro/CriarParceiroUseCase.ts
import { CriarParceiroDTO } from '../../../shared/dtos/parceiro/CriarParceiroDTO';
import { IParceiroRepository } from '../../repositories/IParceiroRepository';
import { IPontoColetaRepository } from '../../repositories/IPontoColetaRepository';
import { Parceiro } from '../../entities/Parceiro';
import { PontoColeta } from '../../entities/PontoColeta';
import bcrypt from 'bcrypt';

export class CriarParceiroUseCase {
  constructor(
    private readonly parceiroRepository: IParceiroRepository,
    private readonly pontoColetaRepository: IPontoColetaRepository
  ) {}

  async execute(data: CriarParceiroDTO) {
    // 1. Validar se email já existe
    const emailExists = await this.parceiroRepository.findByEmail(data.email);
    if (emailExists) {
      throw new Error('E-mail já cadastrado');
    }

    // 2. Validar se documento já existe
    const documentExists = await this.parceiroRepository.findByDocumento(data.documento);
    if (documentExists) {
      throw new Error('Documento já cadastrado');
    }

    // 3. Determinar tipo de pessoa
    const tipoPessoa: 'FISICA' | 'JURIDICA' = data.tipoPessoa || 
      (data.tipoPerfil === 'SOLIDARIO' ? 'FISICA' : 'JURIDICA');

    // 4. Determinar porte
    const porte = data.porte || this.determinarPorte(data.categoriaPerfil || 'Outros');

    // 5. Hash da senha
    const senhaHash = await bcrypt.hash(data.senha, 10);

    // 6. Criar parceiro
    const parceiroData: Omit<Parceiro, 'id' | 'criadoEm'> = {
      tipoPessoa,
      nomeRazaoSocial: data.nomeRazaoSocial,
      email: data.email,
      senhaHash,
      documento: data.documento,
      telefone: data.telefone || null,
      responsavelLegalNome: data.responsavelLegalNome || null,
      responsavelLegalCpf: data.responsavelLegalCpf || null,
      porte,
      aceiteMarketing: data.aceiteMarketing || false,
      parceiroIndicadorId: data.parceiroIndicadorId || null,
      expectativaGeracao: data.expectativaGeracao || null,
      statusAprovacaoParceiro: 'PENDENTE' as const,
      nomeSocial: null,
      redesSociais: null,
    };

    const parceiro = await this.parceiroRepository.create(parceiroData);

    // 7. Criar ponto de coleta
    const capacidadeBombona = data.capacidadeBombona || this.determinarCapacidade(porte);
    
    const pontoColetaData: Omit<PontoColeta, 'id' | 'criadoEm'> = {
      parceiroId: parceiro.id,
      cep: data.cep,
      logradouro: data.logradouro,
      numero: data.numero,
      bairro: data.bairro,
      cidade: data.cidade || 'Não informado',
      estado: data.estado || null,
      complemento: data.complemento || null,
      latitude: data.latitude || null,
      longitude: data.longitude || null,
      capacidadeBombona,
      nivelAtualPct: 0,
      statusBombona: 'VAZIA' as const,
      statusAprovacaoPontoColeta: 'PENDENTE' as const,
      nomePontoColeta: `Ponto ${data.nomeRazaoSocial}`,
    };

    await this.pontoColetaRepository.create(pontoColetaData);

    // 8. Retornar parceiro sem senha
    const { senhaHash: _, ...parceiroSemSenha } = parceiro;
    return {
      ...parceiroSemSenha,
      mensagem: 'Cadastro realizado com sucesso! Aguarde a aprovação da equipe.',
      pontoColeta: pontoColetaData,
    };
  }

  private determinarPorte(categoria: string): 'PEQUENO' | 'MEDIO' | 'GRANDE' {
    const portes: Record<string, 'PEQUENO' | 'MEDIO' | 'GRANDE'> = {
      'Cozinha Industrial': 'GRANDE',
      'Empresa / Industria': 'GRANDE',
      'Escolas / Universidade': 'MEDIO',
      'Hospital / Unidade de Saúde': 'GRANDE',
      'Hotel / Pousada': 'GRANDE',
      'Restaurante / Bar': 'MEDIO',
      'Condomínio': 'MEDIO',
      'Unidade de Saúde': 'GRANDE',
      'Feira Livre': 'MEDIO',
      'Evento Fechado': 'MEDIO',
      'Pessoa Física': 'PEQUENO',
      'Doador Avulso': 'PEQUENO',
      'Outros': 'PEQUENO',
    };

    return portes[categoria] || 'PEQUENO';
  }

  private determinarCapacidade(porte: 'PEQUENO' | 'MEDIO' | 'GRANDE'): number {
    const capacidades: Record<'PEQUENO' | 'MEDIO' | 'GRANDE', number> = {
      'PEQUENO': 100,
      'MEDIO': 500,
      'GRANDE': 1000,
    };
    return capacidades[porte] || 500;
  }
}