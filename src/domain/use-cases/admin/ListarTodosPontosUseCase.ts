import { IPontoColetaRepository } from '../../repositories/IPontoColetaRepository';
import { IParceiroRepository } from '../../repositories/IParceiroRepository';
import { getCategoriaPontoColetaLabel } from '../../entities/PontoColeta';
import { ListarPontosColetaQueryDTO } from '../../../shared/dtos/pontoColeta/ListarPontosColetaQueryDTO';

export class ListarTodosPontosUseCase {
  constructor(
    private readonly pontoColetaRepository: IPontoColetaRepository,
    private readonly parceiroRepository: IParceiroRepository,
  ) {}

  async execute(filters: ListarPontosColetaQueryDTO = {}) {
    const pontos = await this.pontoColetaRepository.findAll();

    if (!pontos.length) {
      return {
        items: [],
        total: 0,
        page: filters.page ?? 1,
        limit: filters.limit ?? 10,
        totalPages: 0,
      };
    }

    const parceiros = await this.parceiroRepository.findAll();
    const parceirosMap = new Map(parceiros.map((parceiro) => [String(parceiro.id), parceiro]));

    const filtered = pontos
      .map((ponto) => ({
        ...ponto,
        parceiro: parceirosMap.get(String(ponto.parceiroId)) ?? null,
      }))
      .filter((item) => {
        if (filters.categoria && item.categoria !== filters.categoria) {
          return false;
        }

        if (filters.nomePonto) {
          const nomeBusca = filters.nomePonto.toLowerCase();
          const nomePonto = item.nomePontoColeta?.toLowerCase() ?? '';
          if (!nomePonto.includes(nomeBusca)) {
            return false;
          }
        }

        if (filters.statusBombona) {
          const statusBusca = filters.statusBombona.toLowerCase();
          const statusPonto = item.statusBombona?.toLowerCase() ?? '';
          if (!statusPonto.includes(statusBusca)) {
            return false;
          }
        }

        if (filters.parceiro) {
          const nomeBusca = filters.parceiro.toLowerCase();
          const nomeParceiro = item.parceiro?.nomeRazaoSocial?.toLowerCase() ?? '';
          if (!nomeParceiro.includes(nomeBusca)) {
            return false;
          }
        }

        if (filters.statusAprovacao && item.statusAprovacaoPontoColeta !== filters.statusAprovacao) {
          return false;
        }

        return true;
      })
      .sort((a, b) => b.id - a.id)
      .map((item) => {
        const categoriaLabel = getCategoriaPontoColetaLabel(item.categoria);

        return {
          ...item,
          categoria: categoriaLabel ?? item.categoria,
        };
      });

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
