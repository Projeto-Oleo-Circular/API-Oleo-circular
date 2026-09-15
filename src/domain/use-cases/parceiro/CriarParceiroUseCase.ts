import bcrypt from 'bcrypt';
import { CriarParceiroDTO } from '../../../shared/dtos/parceiro/CriarParceiroDTO';
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
    // ============================================================
    // 1. VALIDAÇÕES BÁSICAS
    // ============================================================

    if (!data.tipoPessoa) {
      throw new Error('Tipo de pessoa é obrigatório');
    }

    const tipoPessoa = data.tipoPessoa;

    this.validarDadosPorTipoPessoa(tipoPessoa, data);

    // ============================================================
    // 2. VERIFICA SE JÁ EXISTE POR E-MAIL OU DOCUMENTO
    // ============================================================

    const [parceiroPorEmail, parceiroPorDocumento] = await Promise.all([
      this.parceiroRepository.findByEmail(data.email),
      this.parceiroRepository.findByDocumento(data.documento),
    ]);

    // ============================================================
    // 3. EVITA CONFLITO:
    //    e-mail pertence a uma pessoa e documento a outra
    // ============================================================

    if (
      parceiroPorEmail &&
      parceiroPorDocumento &&
      parceiroPorEmail.id !== parceiroPorDocumento.id
    ) {
      throw new Error(
        'O e-mail e o documento informados pertencem a cadastros diferentes.'
      );
    }

    // ============================================================
    // 4. IDENTIFICA CADASTRO EXISTENTE
    // ============================================================

    const parceiroExistente =
      parceiroPorEmail ?? parceiroPorDocumento ?? null;

    // ============================================================
    // 5. SE EXISTE E NÃO ESTÁ REJEITADO, NÃO PODE RECADASTRAR
    // ============================================================

    if (parceiroExistente) {
      if (parceiroExistente.statusAprovacaoParceiro === 'APROVADO') {
        throw new Error(
          'Já existe um parceiro aprovado com este e-mail ou documento.'
        );
      }

      if (parceiroExistente.statusAprovacaoParceiro === 'PENDENTE') {
        throw new Error(
          'Já existe um cadastro aguardando aprovação com este e-mail ou documento.'
        );
      }

      if (parceiroExistente.statusAprovacaoParceiro !== 'REJEITADO') {
        throw new Error(
          'Já existe um cadastro com este e-mail ou documento.'
        );
      }
    }

    // ============================================================
    // 6. GERA HASH DA NOVA SENHA
    // ============================================================

    const senhaHash = await bcrypt.hash(data.senha, 10);

    // Cadastro feito pelo admin continua sendo aprovado automaticamente.
    const criadoPorAdmin =
      data.comoConheceu === 'Criado pelo Administrador';

    const statusInicial: 'APROVADO' | 'PENDENTE' =
      criadoPorAdmin ? 'APROVADO' : 'PENDENTE';

    // ============================================================
    // 7. MONTA DADOS DO PARCEIRO
    // ============================================================

    let parceiroData: any;

    if (tipoPessoa === 'FISICA') {
      parceiroData = {
        tipoPessoa: 'FISICA',

        tipoParceiro:
          data.tipoParceiro ?? 'SOLIDARIO',

        razaoSocial:
          data.razaoSocial ?? null,

        nome: data.nome,

        email: data.email,

        senhaHash,

        documento: data.documento,

        telefone:
          data.telefone ?? null,

        redesSociais:
          data.redesSociais ?? null,

        aceiteMarketing:
          data.aceiteMarketing ?? false,

        parceiroIndicadorId:
          data.parceiroIndicadorId ?? null,

        outroParceiro:
          data.outroParceiro ?? null,

        comoConheceu:
          data.comoConheceu ?? null,

        observacao:
          data.observacao ?? null,

        statusAprovacaoParceiro:
          statusInicial,

        // Importante caso esteja reaproveitando
        // um cadastro que antes era PJ.
        responsavelLegal: null,
      };
    } else {
      parceiroData = {
        tipoPessoa: 'JURIDICA',

        tipoParceiro:
          data.tipoParceiro ?? 'INSTITUCIONAL',

        razaoSocial:
          data.razaoSocial,

        nome:
          data.nome ?? null,

        email:
          data.email,

        senhaHash,

        documento:
          data.documento,

        telefone:
          data.telefone ?? null,

        redesSociais:
          data.redesSociais ?? null,

        aceiteMarketing:
          data.aceiteMarketing ?? false,

        parceiroIndicadorId:
          data.parceiroIndicadorId ?? null,

        outroParceiro:
          data.outroParceiro ?? null,

        comoConheceu:
          data.comoConheceu ?? null,

        observacao:
          data.observacao ?? null,

        statusAprovacaoParceiro:
          statusInicial,

        responsavelLegal:
          data.responsavelLegal,
      };
    }

    // ============================================================
    // 8. CRIA NOVO OU ATUALIZA O REJEITADO
    // ============================================================

    let parceiro;
    let recadastro = false;

    if (
      parceiroExistente &&
      parceiroExistente.statusAprovacaoParceiro === 'REJEITADO'
    ) {
      recadastro = true;

      parceiro = await this.parceiroRepository.update(
        parceiroExistente.id,
        parceiroData
      );
    } else {
      parceiro = await this.parceiroRepository.create(
        parceiroData
      );
    }

    // ============================================================
    // 9. CAPACIDADE DA BOMBONA
    // ============================================================

    const capacidadeBombona =
      data.capacidadeBombona ??
      this.determinarCapacidade(
        data.tipoPorte ?? 'MEDIO'
      );

    // ============================================================
    // 10. DADOS DO PONTO DE COLETA
    // ============================================================

    const pontoColetaData: Omit<
      PontoColeta,
      'id' | 'criadoEm'
    > = {
      parceiroId: parceiro.id,

      categoria:
        data.categoria ?? 7,

      cep:
        data.cep,

      logradouro:
        data.logradouro,

      numero:
        data.numero,

      bairro:
        data.bairro,

      cidade:
        data.cidade ?? 'Não informado',

      estado:
        data.estado,

      complemento:
        data.complemento,

      capacidadeBombona,

      expectativaGeracao:
        data.expectativaGeracao ?? 0,

      nivelAtualPct:
        data.nivelAtualPct ?? 0,

      statusBombona:
        'VAZIA',

      statusAprovacaoPontoColeta:
        statusInicial,

      nomePontoColeta:
        `Ponto ${data.nome}`,

      longitude:
        String(data.longitude),

      latitude:
        String(data.latitude),
    };

    // ============================================================
    // 11. PONTO DE COLETA
    //
    // Se for recadastro:
    // atualiza o ponto existente.
    //
    // Se não houver ponto:
    // cria normalmente.
    // ============================================================

    if (recadastro) {
      const pontosExistentes =
        await this.pontoColetaRepository.findByParceiroId(
          parceiro.id
        );

      if (pontosExistentes.length > 0) {
        const pontoExistente = pontosExistentes[0];

        await this.pontoColetaRepository.update(
          pontoExistente.id,
          pontoColetaData
        );
      } else {
        await this.pontoColetaRepository.create(
          pontoColetaData
        );
      }
    } else {
      await this.pontoColetaRepository.create(
        pontoColetaData
      );
    }

    // ============================================================
    // 12. ENVIA E-MAIL
    // ============================================================

    if (statusInicial === 'PENDENTE') {
      this.enviarEmailConfirmacao(parceiro).catch(
        (err) => {
          console.error(
            'Erro ao enviar e-mail de confirmação:',
            err
          );
        }
      );
    }

    // ============================================================
    // 13. RETORNO
    // ============================================================

    if (recadastro) {
      return {
        mensagem:
          'Cadastro reenviado com sucesso! As informações foram atualizadas e serão analisadas novamente pela equipe.',
      };
    }

    return {
      mensagem: criadoPorAdmin
        ? 'Parceiro cadastrado e aprovado com sucesso!'
        : 'Cadastro realizado com sucesso! Aguarde a aprovação da equipe.',
    };
  }

  // ==============================================================
  // VALIDAÇÃO DE DOCUMENTO
  // ==============================================================

  private validarDadosPorTipoPessoa(
    tipoPessoa: 'FISICA' | 'JURIDICA',
    data: CriarParceiroDTO
  ) {
    let documento: Documento;

    try {
      documento = new Documento(data.documento);
    } catch (error) {
      throw new Error(
        'Documento inválido: ' +
          (error as Error).message
      );
    }

    if (
      tipoPessoa === 'FISICA' &&
      documento.getTipo() !== 'CPF'
    ) {
      throw new Error(
        'Pessoa Física deve ter um CPF como documento.'
      );
    }

    if (
      tipoPessoa === 'JURIDICA' &&
      documento.getTipo() !== 'CNPJ'
    ) {
      throw new Error(
        'Pessoa Jurídica deve ter um CNPJ como documento.'
      );
    }
  }

  // ==============================================================
  // CAPACIDADE PADRÃO
  // ==============================================================

  private determinarCapacidade(
    porte: string
  ): number {
    const capacidades: Record<string, number> = {
      PEQUENO: 10,
      MEDIO: 20,
      GRANDE: 30,
    };

    return capacidades[porte] ?? 20;
  }

  // ==============================================================
  // E-MAIL
  // ==============================================================

  private async enviarEmailConfirmacao(
    parceiro: {
      razaoSocial: string | null;
      email: string;
      nome: string | null;
    }
  ) {
    const template =
      renderParceiroStatusEmail({
        nome:
          parceiro.razaoSocial ||
          parceiro.nome ||
          'Parceiro',

        status: 'PENDENTE',
      });

    await EmailService.send({
      to: parceiro.email,
      subject: template.subject,
      html: template.html,
    });
  }
}