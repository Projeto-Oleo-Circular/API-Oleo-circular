import { randomBytes } from 'crypto';
import * as bcrypt from 'bcrypt';

import { Admin } from '../../entities/Admin';
import { Parceiro } from '../../entities/Parceiro';
import { ParceiroIndicador } from '../../entities/ParceiroIndicador';
import {
  PontoColeta,
  CategoriaPontoColeta,
} from '../../entities/PontoColeta';

import { IAdminRepository } from '../../repositories/IAdminRepository';
import { IParceiroRepository } from '../../repositories/IParceiroRepository';
import { IParceiroIndicadorRepository } from '../../repositories/IParceiroIndicadorRepository';
import { IPontoColetaRepository } from '../../repositories/IPontoColetaRepository';

/*
 * ============================================================
 * TIPOS AUXILIARES
 * ============================================================
 */

export interface DadosPontoIndicador {
  cep: string;

  logradouro: string;

  numero: string;

  bairro: string;

  cidade: string;

  estado: string;

  complemento?: string | null;

  capacidadeBombona: number;

  expectativaGeracao?: number;

  nivelAtualPct?: number;

  nomePontoColeta: string;

  longitude: string | number;

  latitude: string | number;
}

/*
 * Retorno da criação de um ponto para um indicador.
 *
 * "acesso" só será preenchido quando o Parceiro Local
 * for criado naquele momento.
 */
export interface ResultadoCriacaoPontoIndicador {
  ponto: PontoColeta;

  parceiro: {
    id: number;
    email: string;
  };

  acesso: {
    email: string;
    senhaTemporaria: string;
    primeiroAcesso: true;
  } | null;
}

/*
 * Indicador retornado para o frontend administrativo.
 *
 * Além dos dados normais do indicador, retornamos informações
 * sobre sua representação operacional como Parceiro Local.
 */
export type ParceiroIndicadorComPontos =
  ParceiroIndicador & {
    parceiroLocalId: number | null;

    possuiAcessoParceiro: boolean;

    temPontoColeta: boolean;

    quantidadePontosColeta: number;

    pontosColeta: PontoColeta[];
  };

/*
 * ============================================================
 * ADMIN MANAGE USE CASE
 * ============================================================
 */

export class AdminManageUseCase {
  constructor(
    private readonly adminRepo: IAdminRepository,

    private readonly parceiroRepo: IParceiroRepository,

    private readonly indicadorRepo: IParceiroIndicadorRepository,

    private readonly pontoColetaRepo: IPontoColetaRepository,
  ) {}

  /*
   * ==========================================================
   * UTILITÁRIOS
   * ==========================================================
   */

  private gerarSenhaTemporaria(): string {
    /*
     * Gera aproximadamente 12 caracteres.
     *
     * A senha em texto puro NÃO é salva no banco.
     * Apenas o hash será persistido.
     */
    return randomBytes(9).toString('base64url');
  }

  private normalizarEmail(
    email: string,
  ): string {
    return email
      .trim()
      .toLowerCase();
  }

  private normalizarDocumento(
    documento: string,
  ): string {
    return documento.replace(
      /\D/g,
      '',
    );
  }

  /*
   * ==========================================================
   * ADMIN
   * ==========================================================
   */

  async criarAdmin(dados: {
    nome: string;
    email: string;
    senha: string;
    nivelAcesso: 'admin';
  }): Promise<Admin> {
    if (
      !dados.email ||
      !dados.senha ||
      !dados.nome
    ) {
      throw new Error(
        'Dados incompletos para criar admin',
      );
    }

    if (
      dados.senha.length < 6
    ) {
      throw new Error(
        'A senha deve possuir pelo menos 6 caracteres',
      );
    }

    const email =
      this.normalizarEmail(
        dados.email,
      );

    const existing =
      await this.adminRepo.findByEmail(
        email,
      );

    if (existing) {
      throw new Error(
        'Email já cadastrado',
      );
    }

    const senhaHash =
      await bcrypt.hash(
        dados.senha,
        10,
      );

    const admin =
      await this.adminRepo.create({
        nome:
          dados.nome.trim(),

        email,

        senhaHash,

        nivelAcesso:
          dados.nivelAcesso,
      });

    return admin;
  }

  /*
   * ==========================================================
   * ATUALIZAR ADMIN
   * ==========================================================
   */

  async atualizarAdmin(
    id: number,
    dados: {
      nome?: string;
      email?: string;
    },
  ): Promise<Admin> {
    if (!id) {
      throw new Error(
        'ID do admin é obrigatório',
      );
    }

    const dadosAtualizacao = {
      ...dados,
    };

    if (dados.email) {
      dadosAtualizacao.email =
        this.normalizarEmail(
          dados.email,
        );
    }

    if (dados.nome) {
      dadosAtualizacao.nome =
        dados.nome.trim();
    }

    const updated =
      await this.adminRepo.update(
        id,
        dadosAtualizacao,
      );

    if (!updated) {
      throw new Error(
        'Admin não encontrado',
      );
    }

    return updated;
  }

  /*
   * ==========================================================
   * ALTERAR SENHA ADMIN
   * ==========================================================
   */

  async alterarSenhaAdmin(
    adminId: number,
    senhaAtual: string,
    novaSenha: string,
  ): Promise<void> {
    if (!adminId) {
      throw new Error(
        'ID do admin é obrigatório',
      );
    }

    if (
      !senhaAtual ||
      !novaSenha
    ) {
      throw new Error(
        'Senha atual e nova senha são obrigatórias',
      );
    }

    if (
      novaSenha.length < 6
    ) {
      throw new Error(
        'A nova senha deve possuir pelo menos 6 caracteres',
      );
    }

    const admin =
      await this.adminRepo.findById(
        adminId,
      );

    if (!admin) {
      throw new Error(
        'Admin não encontrado',
      );
    }

    const senhaCorreta =
      await bcrypt.compare(
        senhaAtual,
        admin.senhaHash,
      );

    if (!senhaCorreta) {
      throw new Error(
        'Senha atual incorreta',
      );
    }

    const novaHash =
      await bcrypt.hash(
        novaSenha,
        10,
      );

    await this.adminRepo.update(
      adminId,
      {
        senhaHash:
          novaHash,
      },
    );
  }

  /*
   * ==========================================================
   * PARCEIRO
   * ==========================================================
   */

  async criarParceiro(
    dados: Omit<
      Parceiro,
      'id' | 'criadoEm'
    >,
  ): Promise<Parceiro> {
    if (
      !dados.email ||
      !dados.documento
    ) {
      throw new Error(
        'Email e documento são obrigatórios',
      );
    }

    const email =
      this.normalizarEmail(
        dados.email,
      );

    const documento =
      this.normalizarDocumento(
        dados.documento,
      );

    /*
     * Verifica email.
     */
    const existingEmail =
      await this.parceiroRepo
        .findByEmail(
          email,
        );

    if (existingEmail) {
      throw new Error(
        'Email já cadastrado',
      );
    }

    /*
     * Verifica documento.
     */
    const existingDoc =
      await this.parceiroRepo
        .findByDocumento(
          documento,
        );

    if (existingDoc) {
      throw new Error(
        'Documento já cadastrado',
      );
    }

    /*
     * Se senhaHash chegar como senha em texto puro nesse
     * fluxo administrativo, fazemos hash antes de persistir.
     */
    if (dados.senhaHash) {
      dados.senhaHash =
        await bcrypt.hash(
          dados.senhaHash,
          10,
        );
    }

    dados.email =
      email;

    dados.documento =
      documento;

    return await this.parceiroRepo.create(
      dados,
    );
  }

  /*
   * ==========================================================
   * ATUALIZAR PARCEIRO
   * ==========================================================
   */

  async atualizarParceiro(
    id: number,
    dados: Partial<Parceiro>,
  ): Promise<Parceiro> {
    if (!id) {
      throw new Error(
        'ID do parceiro é obrigatório',
      );
    }

    /*
     * EMAIL
     */
    if (dados.email) {
      const email =
        this.normalizarEmail(
          dados.email,
        );

      const existing =
        await this.parceiroRepo
          .findByEmail(
            email,
          );

      if (
        existing &&
        existing.id !== id
      ) {
        throw new Error(
          'Email já está em uso',
        );
      }

      dados.email =
        email;
    }

    /*
     * DOCUMENTO
     */
    if (dados.documento) {
      const documento =
        this.normalizarDocumento(
          dados.documento,
        );

      const existing =
        await this.parceiroRepo
          .findByDocumento(
            documento,
          );

      if (
        existing &&
        existing.id !== id
      ) {
        throw new Error(
          'Documento já está em uso',
        );
      }

      dados.documento =
        documento;
    }

    return await this.parceiroRepo.update(
      id,
      dados,
    );
  }

  /*
   * ==========================================================
   * EXCLUIR PARCEIRO
   * ==========================================================
   */

  async excluirParceiro(
    id: number,
  ): Promise<void> {
    if (!id) {
      throw new Error(
        'ID do parceiro é obrigatório',
      );
    }

    await this.parceiroRepo.delete(
      id,
    );
  }

  /*
   * ==========================================================
   * LISTAR PARCEIROS
   * ==========================================================
   */

  async listarParceiros(): Promise<
    Parceiro[]
  > {
    return await this.parceiroRepo
      .findAll();
  }

  /*
   * ==========================================================
   * BUSCAR PARCEIRO POR ID
   * ==========================================================
   */

  async buscarParceiroPorId(
    id: number,
  ): Promise<Parceiro | null> {
    if (!id) {
      throw new Error(
        'ID do parceiro é obrigatório',
      );
    }

    return await this.parceiroRepo
      .findById(
        id,
      );
  }

  /*
   * ==========================================================
   * PARCEIRO INDICADOR
   * ==========================================================
   *
   * IMPORTANTE:
   *
   * ParceiroIndicador é um cadastro administrativo.
   *
   * Ele NÃO precisa ter senha.
   *
   * Se ele precisar utilizar o sistema operacionalmente,
   * criaremos um registro correspondente em "parceiros".
   * ==========================================================
   */

  async criarIndicador(
    dados: Omit<
      ParceiroIndicador,
      'id' | 'criadoEm'
    >,
  ): Promise<ParceiroIndicador> {
    if (
      !dados.nome ||
      !dados.cnpj
    ) {
      throw new Error(
        'Nome e CNPJ são obrigatórios',
      );
    }

    const dadosIndicador = {
      ...dados,

      nome:
        dados.nome.trim(),

      cnpj:
        this.normalizarDocumento(
          dados.cnpj,
        ),

      email:
        dados.email
          ? this.normalizarEmail(
              dados.email,
            )
          : dados.email,
    };

    return await this.indicadorRepo
      .create(
        dadosIndicador,
      );
  }

  /*
   * ==========================================================
   * ATUALIZAR INDICADOR
   * ==========================================================
   */

  async atualizarIndicador(
    id: number,
    dados: Partial<ParceiroIndicador>,
  ): Promise<ParceiroIndicador> {
    if (!id) {
      throw new Error(
        'ID do indicador é obrigatório',
      );
    }

    const indicador =
      await this.indicadorRepo
        .findById(
          id,
        );

    if (!indicador) {
      throw new Error(
        'Parceiro indicador não encontrado',
      );
    }

    const dadosAtualizacao = {
      ...dados,
    };

    if (dados.nome) {
      dadosAtualizacao.nome =
        dados.nome.trim();
    }

    if (dados.cnpj) {
      dadosAtualizacao.cnpj =
        this.normalizarDocumento(
          dados.cnpj,
        );
    }

    if (dados.email) {
      dadosAtualizacao.email =
        this.normalizarEmail(
          dados.email,
        );
    }

    return await this.indicadorRepo
      .update(
        id,
        dadosAtualizacao,
      );
  }

  /*
   * ==========================================================
   * EXCLUIR INDICADOR
   * ==========================================================
   */

  async excluirIndicador(
    id: number,
  ): Promise<void> {
    if (!id) {
      throw new Error(
        'ID do indicador é obrigatório',
      );
    }

    const indicador =
      await this.indicadorRepo
        .findById(
          id,
        );

    if (!indicador) {
      throw new Error(
        'Parceiro indicador não encontrado',
      );
    }

    await this.indicadorRepo.delete(
      id,
    );
  }

  /*
   * ==========================================================
   * LISTAR INDICADORES
   * ==========================================================
   *
   * Além dos dados do indicador, retorna:
   *
   * parceiroLocalId
   * possuiAcessoParceiro
   * temPontoColeta
   * quantidadePontosColeta
   * pontosColeta
   * ==========================================================
   */

  async listarIndicadoresAtivos(): Promise<
    ParceiroIndicadorComPontos[]
  > {
    const indicadores =
      await this.indicadorRepo
        .findAll();

    const resultado =
      await Promise.all(
        indicadores.map(
          async (
            indicador,
          ): Promise<ParceiroIndicadorComPontos> => {
            /*
             * Descobre se esse indicador também possui
             * representação como Parceiro Local.
             */
            const parceiroLocal =
              await this.parceiroRepo
                .findByIndicadorOrigemId(
                  indicador.id,
                );

            /*
             * Se não houver Parceiro Local,
             * consequentemente não existem pontos operacionais
             * desse indicador na arquitetura nova.
             */
            let pontos:
              PontoColeta[] = [];

            if (parceiroLocal) {
              pontos =
                await this.pontoColetaRepo
                  .findByParceiroId(
                    parceiroLocal.id,
                  );
            }

            return {
              ...indicador,

              parceiroLocalId:
                parceiroLocal?.id ??
                null,

              possuiAcessoParceiro:
                parceiroLocal !== null,

              temPontoColeta:
                pontos.length > 0,

              quantidadePontosColeta:
                pontos.length,

              pontosColeta:
                pontos,
            };
          },
        ),
      );

    /*
     * Como o método se chama listarIndicadoresAtivos,
     * garantimos que somente ativos sejam retornados.
     *
     * Caso seu findAll() já faça isso, o filtro é apenas
     * uma proteção adicional.
     */
    return resultado.filter(
      (indicador) =>
        indicador.ativo !== false,
    );
  }

  /*
   * ==========================================================
   * BUSCAR INDICADOR POR ID
   * ==========================================================
   */

  async buscarIndicadorPorId(
    id: number,
  ): Promise<
    ParceiroIndicadorComPontos | null
  > {
    if (!id) {
      throw new Error(
        'ID do indicador é obrigatório',
      );
    }

    const indicador =
      await this.indicadorRepo
        .findById(
          id,
        );

    if (!indicador) {
      return null;
    }

    /*
     * Procura a conta Parceiro correspondente.
     */
    const parceiroLocal =
      await this.parceiroRepo
        .findByIndicadorOrigemId(
          indicador.id,
        );

    let pontos:
      PontoColeta[] = [];

    if (parceiroLocal) {
      pontos =
        await this.pontoColetaRepo
          .findByParceiroId(
            parceiroLocal.id,
          );
    }

    return {
      ...indicador,

      parceiroLocalId:
        parceiroLocal?.id ??
        null,

      possuiAcessoParceiro:
        parceiroLocal !== null,

      temPontoColeta:
        pontos.length > 0,

      quantidadePontosColeta:
        pontos.length,

      pontosColeta:
        pontos,
    };
  }

  /*
   * ==========================================================
   * CRIAR PONTO DE COLETA DO INDICADOR
   * ==========================================================
   *
   * ESTE É O MÉTODO PRINCIPAL DA NOVA ARQUITETURA.
   *
   * Fluxo:
   *
   * ParceiroIndicador
   *       ↓
   * procura Parceiro.indicadorOrigemId
   *       ↓
   * não existe?
   *       ↓
   * cria Parceiro
   *       ↓
   * gera senha temporária
   *       ↓
   * primeiroAcesso = true
   *       ↓
   * cria PontoColeta com parceiroId
   * ==========================================================
   */

  async criarPontoColetaIndicador(
    indicadorId: number,
    dados: DadosPontoIndicador,
  ): Promise<
    ResultadoCriacaoPontoIndicador
  > {
    /*
     * ========================================================
     * 1. VALIDAR ID
     * ========================================================
     */

    if (!indicadorId) {
      throw new Error(
        'ID do parceiro indicador é obrigatório',
      );
    }

    /*
     * ========================================================
     * 2. BUSCAR INDICADOR
     * ========================================================
     */

    const indicador =
      await this.indicadorRepo
        .findById(
          indicadorId,
        );

    if (!indicador) {
      throw new Error(
        'Parceiro indicador não encontrado',
      );
    }

    /*
     * ========================================================
     * 3. INDICADOR PRECISA ESTAR ATIVO
     * ========================================================
     */

    if (!indicador.ativo) {
      throw new Error(
        'Parceiro indicador está inativo',
      );
    }

    /*
     * ========================================================
     * 4. EMAIL
     * ========================================================
     */

    if (
      !indicador.email ||
      !indicador.email.trim()
    ) {
      throw new Error(
        'O Parceiro Indicador precisa possuir e-mail para se tornar um Parceiro Local',
      );
    }

    const email =
      this.normalizarEmail(
        indicador.email,
      );

    /*
     * ========================================================
     * 5. DOCUMENTO
     * ========================================================
     */

    if (
      !indicador.cnpj ||
      !indicador.cnpj.trim()
    ) {
      throw new Error(
        'O Parceiro Indicador precisa possuir CNPJ para se tornar um Parceiro Local',
      );
    }

    const documento =
      this.normalizarDocumento(
        indicador.cnpj,
      );

    /*
     * ========================================================
     * 6. PROCURA PARCEIRO LOCAL
     * ========================================================
     */

    let parceiroLocal =
      await this.parceiroRepo
        .findByIndicadorOrigemId(
          indicador.id,
        );

    /*
     * A senha só será retornada quando criarmos
     * uma conta nova.
     */
    let senhaTemporaria:
      string | null = null;

    /*
     * ========================================================
     * 7. CRIA PARCEIRO LOCAL SE NECESSÁRIO
     * ========================================================
     */

    if (!parceiroLocal) {
      /*
       * ------------------------------------------------------
       * EMAIL DUPLICADO
       * ------------------------------------------------------
       */

      const parceiroEmail =
        await this.parceiroRepo
          .findByEmail(
            email,
          );

      if (parceiroEmail) {
        throw new Error(
          'Já existe um Parceiro utilizando o e-mail deste Parceiro Indicador',
        );
      }

      /*
       * ------------------------------------------------------
       * DOCUMENTO DUPLICADO
       * ------------------------------------------------------
       */

      const parceiroDocumento =
        await this.parceiroRepo
          .findByDocumento(
            documento,
          );

      if (parceiroDocumento) {
        throw new Error(
          'Já existe um Parceiro utilizando o CNPJ deste Parceiro Indicador',
        );
      }

      /*
       * ------------------------------------------------------
       * SENHA TEMPORÁRIA
       * ------------------------------------------------------
       */

      senhaTemporaria =
        this.gerarSenhaTemporaria();

      const senhaHash =
        await bcrypt.hash(
          senhaTemporaria,
          10,
        );

      /*
       * ------------------------------------------------------
       * CRIA PARCEIRO
       * ------------------------------------------------------
       *
       * IMPORTANTE:
       *
       * parceiroIndicadorId
       * =
       * QUEM INDICOU ESTE PARCEIRO?
       *
       *
       * indicadorOrigemId
       * =
       * ESTE PARCEIRO TAMBÉM É QUAL INDICADOR?
       */

      const novoParceiro = {
        tipoPessoa:
          'JURIDICA',

        /*
         * Um indicador que possui ponto passa a operar
         * como parceiro institucional.
         */
        tipoParceiro:
          'INSTITUCIONAL',

        razaoSocial:
          indicador.nome,

        nome:
          indicador.nome,

        email,

        senhaHash,

        documento,

        telefone:
          indicador.telefone ??
          null,

        /*
         * Seu backend atualmente utiliza o nome
         * "nomeResposavel".
         */
        responsavelLegal:
          indicador.nomeResposavel ??
          null,

        redesSociais:
          [],

        aceiteMarketing:
          false,

        /*
         * NÃO coloque indicador.id aqui.
         *
         * Este campo continua significando:
         * "quem indicou esse parceiro?"
         */
        parceiroIndicadorId:
          null,

        /*
         * Este é o novo relacionamento.
         *
         * Significa:
         *
         * "esse parceiro local também representa
         * esse parceiro indicador".
         */
        indicadorOrigemId:
          indicador.id,

        /*
         * Obriga a troca da senha posteriormente.
         */
        primeiroAcesso:
          true,

        comoConheceu:
          'Criado pelo Administrador a partir de Parceiro Indicador',

        observacao:
          'Parceiro Local criado automaticamente a partir de um Parceiro Indicador.',

        /*
         * Como foi cadastrado pelo administrador,
         * não precisa passar pela aprovação.
         */
        statusAprovacaoParceiro:
          'APROVADO',

        expectativaGeracao:
          dados.expectativaGeracao ??
          null,

        tipoPorte:
          null,

        /*
         * IMPORTANTE:
         *
         * Seu DBScriptParceiroRepository possui uma regra:
         *
         * data.criadoPorAdmin === true
         *
         * faz parceiro_indicador_id receber
         * "Admin/Cataunidos".
         *
         * NÃO queremos isso aqui.
         *
         * Se colocássemos true, destruiríamos a semântica
         * de parceiroIndicadorId.
         *
         * Portanto não enviamos criadoPorAdmin.
         */
      };

      parceiroLocal =
        await this.parceiroRepo
          .create(
            novoParceiro as unknown as Omit<
              Parceiro,
              'id' | 'criadoEm'
            >,
          );
    }

    /*
     * ========================================================
     * 8. VALIDAR DADOS DO PONTO
     * ========================================================
     */

    if (!dados) {
      throw new Error(
        'Dados do ponto de coleta são obrigatórios',
      );
    }

    if (
      !dados.nomePontoColeta ||
      !dados.nomePontoColeta.trim()
    ) {
      throw new Error(
        'Nome do ponto de coleta é obrigatório',
      );
    }

    if (
      !dados.cep ||
      !dados.logradouro ||
      !dados.numero ||
      !dados.bairro ||
      !dados.cidade ||
      !dados.estado
    ) {
      throw new Error(
        'Endereço completo do ponto de coleta é obrigatório',
      );
    }

    /*
     * ========================================================
     * 9. COORDENADAS
     * ========================================================
     */

    const latitude =
      Number(
        dados.latitude,
      );

    const longitude =
      Number(
        dados.longitude,
      );

    if (
      Number.isNaN(latitude) ||
      Number.isNaN(longitude)
    ) {
      throw new Error(
        'Latitude e longitude inválidas',
      );
    }

    if (
      latitude < -90 ||
      latitude > 90
    ) {
      throw new Error(
        'Latitude deve estar entre -90 e 90',
      );
    }

    if (
      longitude < -180 ||
      longitude > 180
    ) {
      throw new Error(
        'Longitude deve estar entre -180 e 180',
      );
    }

    /*
     * ========================================================
     * 10. CAPACIDADE
     * ========================================================
     */

    const capacidadeBombona =
      Number(
        dados.capacidadeBombona,
      );

    if (
      Number.isNaN(
        capacidadeBombona,
      ) ||
      capacidadeBombona <= 0
    ) {
      throw new Error(
        'Capacidade da bombona deve ser maior que zero',
      );
    }

    /*
     * ========================================================
     * 11. EXPECTATIVA
     * ========================================================
     */

    const expectativaGeracao =
      Number(
        dados.expectativaGeracao ??
        0,
      );

    if (
      Number.isNaN(
        expectativaGeracao,
      ) ||
      expectativaGeracao < 0
    ) {
      throw new Error(
        'Expectativa de geração inválida',
      );
    }

    /*
     * ========================================================
     * 12. NÍVEL ATUAL
     * ========================================================
     */

    const nivelAtualPct =
      Number(
        dados.nivelAtualPct ??
        0,
      );

    if (
      Number.isNaN(
        nivelAtualPct,
      ) ||
      nivelAtualPct < 0 ||
      nivelAtualPct > 100
    ) {
      throw new Error(
        'Nível atual deve estar entre 0 e 100',
      );
    }

    /*
     * ========================================================
     * 13. VERIFICA SE JÁ EXISTE PONTO
     * ========================================================
     */

    const pontosExistentes =
      await this.pontoColetaRepo
        .findByParceiroId(
          parceiroLocal.id,
        );

    /*
     * Neste momento estamos considerando:
     *
     * 1 Parceiro Indicador
     *      =
     * 1 Parceiro Local
     *      =
     * 1 Ponto de Coleta
     *
     * Se futuramente quiser permitir vários pontos,
     * basta remover esta validação.
     */

    if (
      pontosExistentes.length > 0
    ) {
      throw new Error(
        'Este Parceiro Indicador já possui um ponto de coleta',
      );
    }

    /*
     * ========================================================
     * 14. CRIA O PONTO
     * ========================================================
     */

    const pontoData = {
      /*
       * NOVA ARQUITETURA:
       *
       * todo ponto pertence a um Parceiro.
       */
      parceiroId:
        parceiroLocal.id,

      /*
       * Campo legado.
       *
       * Não usamos mais para relacionar operacionalmente
       * o indicador ao ponto.
       */
      parceiroIndicadorId:
        null,

      /*
       * Mantemos a categoria especial do indicador
       * caso você ainda utilize categoria 9 no frontend.
       */
      categoria:
  9 as CategoriaPontoColeta,

      cep:
        dados.cep.replace(
          /\D/g,
          '',
        ),

      logradouro:
        dados.logradouro.trim(),

      numero:
        dados.numero.trim(),

      bairro:
        dados.bairro.trim(),

      cidade:
        dados.cidade.trim(),

      estado:
        dados.estado.trim(),

      complemento:
        dados.complemento
          ? dados.complemento.trim()
          : undefined,

      capacidadeBombona,

      expectativaGeracao,

      nivelAtualPct,

      statusBombona:
        'VAZIA',

      /*
       * Criado pelo admin:
       * ponto já entra aprovado.
       */
      statusAprovacaoPontoColeta:
        'APROVADO',

      nomePontoColeta:
        dados.nomePontoColeta.trim(),

      longitude:
        String(longitude),

      latitude:
        String(latitude),
    };

    const ponto =
      await this.pontoColetaRepo
        .create(
          pontoData as Omit<
            PontoColeta,
            'id' | 'criadoEm'
          >,
        );

    /*
     * ========================================================
     * 15. RETORNO
     * ========================================================
     */

    return {
      ponto,

      parceiro: {
        id:
          parceiroLocal.id,

        email:
          parceiroLocal.email,
      },

      /*
       * Só devolve senha se acabamos de criar
       * o Parceiro Local.
       */
      acesso:
        senhaTemporaria
          ? {
              email:
                parceiroLocal.email,

              senhaTemporaria,

              primeiroAcesso:
                true,
            }
          : null,
    };
  }

  /*
   * ==========================================================
   * LISTAR PONTOS DO INDICADOR
   * ==========================================================
   */

  async listarPontosDoIndicador(
    indicadorId: number,
  ): Promise<PontoColeta[]> {
    if (!indicadorId) {
      throw new Error(
        'ID do parceiro indicador é obrigatório',
      );
    }

    /*
     * Primeiro garante que o indicador existe.
     */
    const indicador =
      await this.indicadorRepo
        .findById(
          indicadorId,
        );

    if (!indicador) {
      throw new Error(
        'Parceiro indicador não encontrado',
      );
    }

    /*
     * Descobre o Parceiro Local que representa
     * esse indicador.
     */
    const parceiroLocal =
      await this.parceiroRepo
        .findByIndicadorOrigemId(
          indicadorId,
        );

    /*
     * Indicador pode existir sem ser ponto.
     *
     * Portanto isso NÃO é erro.
     */
    if (!parceiroLocal) {
      return [];
    }

    /*
     * Os pontos pertencem ao Parceiro Local.
     */
    return await this.pontoColetaRepo
      .findByParceiroId(
        parceiroLocal.id,
      );
  }
}