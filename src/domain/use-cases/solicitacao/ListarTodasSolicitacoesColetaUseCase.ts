import { ISolicitacaoColetaRepository } from '../../repositories/ISolicitacaoColetaRepository';
import { IPontoColetaRepository } from '../../repositories/IPontoColetaRepository';
import { IParceiroRepository } from '../../repositories/IParceiroRepository';
import { ListarSolicitacoesColetaQueryDTO } from '../../../shared/dtos/solicitacaoColeta/ListarSolicitacoesColetaQueryDTO';

export class ListarTodasSolicitacoesColetaUseCase {
  constructor(
    private readonly solicitacaoRepository: ISolicitacaoColetaRepository,
    private readonly pontoColetaRepository: IPontoColetaRepository,
    private readonly parceiroRepository: IParceiroRepository,
  ) {}

  async execute(filters: ListarSolicitacoesColetaQueryDTO) {
    const solicitacoes = await this.solicitacaoRepository.findAll();

    if (!solicitacoes || !solicitacoes.length) {
      return {
        items: [],
        total: 0,
        page: filters.page ?? 1,
        limit: filters.limit ?? 10,
        totalPages: 0,
      };
    }

    const pontos = await this.pontoColetaRepository.findAll();
    const parceiros = await this.parceiroRepository.findAll();

    const pontosMap = new Map(pontos.map((ponto) => [ponto.id, ponto]));
    const parceirosMap = new Map(parceiros.map((parceiro) => [String(parceiro.id), parceiro]));

    const filtered = solicitacoes
      .map((solicitacao) => {
        const ponto = pontosMap.get(solicitacao.pontoColetaId);
        const parceiro = ponto ? parceirosMap.get(String(ponto.parceiroId)) : null;
        return {
          ...solicitacao,
          pontoColeta: ponto,
          parceiro,
        };
      })
      .filter((item) => {
        if (filters.nomePonto && !item.pontoColeta?.nomePontoColeta?.toLowerCase().includes(filters.nomePonto.toLowerCase())) {
          return false;
        }

        if (filters.status && item.status !== filters.status) {
          return false;
        }

        const parceiroBusca = filters.parceiro?.toLowerCase() ?? filters.solicitante?.toLowerCase();
        if (parceiroBusca && !item.parceiro?.nomeRazaoSocial?.toLowerCase().includes(parceiroBusca)) {
          return false;
        }

        if (filters.parceiroIndicadorId && item.parceiro?.parceiroIndicadorId !== filters.parceiroIndicadorId) {
          return false;
        }

        if (filters.capacidadeBombona && item.pontoColeta?.capacidadeBombona !== filters.capacidadeBombona) {
          return false;
        }

        if (filters.dataSolicitacao) {
          const dataFiltro = new Date(filters.dataSolicitacao);
          if (Number.isNaN(dataFiltro.getTime())) {
            return false;
          }
          const dataSolicitacaoItem = new Date(item.dataSolicitacao);
          if (dataSolicitacaoItem.toISOString().slice(0, 10) !== dataFiltro.toISOString().slice(0, 10)) {
            return false;
          }
        }

        if (filters.endereco) {
          const enderecoBusca = filters.endereco.toLowerCase();
          const enderecoPonto = [
            item.pontoColeta?.logradouro,
            item.pontoColeta?.numero,
            item.pontoColeta?.bairro,
            item.pontoColeta?.cidade,
            item.pontoColeta?.estado,
            item.pontoColeta?.complemento,
          ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase();

          if (!enderecoPonto.includes(enderecoBusca)) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => new Date(b.dataSolicitacao).getTime() - new Date(a.dataSolicitacao).getTime());

    const page = Math.max(1, filters.page ?? 1);
    const limit = Math.max(1, filters.limit ?? 10);
    const total = filtered.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const items = filtered.slice(startIndex, startIndex + limit);

    return {
      items,
      total,
      page,
      limit,
      totalPages,
    };
  }
}
