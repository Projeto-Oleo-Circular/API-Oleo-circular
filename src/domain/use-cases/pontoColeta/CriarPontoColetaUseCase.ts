import { IPontoColetaRepository } from '../../repositories/IPontoColetaRepository';
import { IParceiroRepository } from '../../repositories/IParceiroRepository';
import { CriarPontoColetaDTO, CriarPontoColetaDTOSchema } from '../../../shared/dtos/pontoColeta/CriarPontoColetaDTO';
import { PontoColeta } from '../../entities/PontoColeta';
import { GeocodingService } from '../../../infrastructure/services/GeocodingService';

export class CriarPontoColetaUseCase {
  constructor(
    private readonly pontoColetaRepository: IPontoColetaRepository,
    private readonly parceiroRepository: IParceiroRepository,
    private readonly geocodingService: GeocodingService,
  ) {}

  async execute(input: CriarPontoColetaDTO) {
    const parsed = CriarPontoColetaDTOSchema.safeParse(input);

    if (!parsed.success) {
      throw new Error(parsed.error.issues.map((issue) => issue.message).join(', '));
    }

    const data = parsed.data;
    let latitude: number | null = data.latitude ?? null;
    let longitude: number | null = data.longitude ?? null;

    if (latitude === null || longitude === null) {
      const enderecoCompleto = `${data.logradouro}, ${data.numero}, ${data.bairro}, ${data.cep}`;
      const coordenadas = await this.geocodingService.geocode(enderecoCompleto, data.cidade, data.uf);
      if (coordenadas) {
        latitude = coordenadas.lat;
        longitude = coordenadas.lng;
      } else {
        latitude = null;
        longitude = null;
      }
    }

    const pontoColetaParaCriar: Omit<PontoColeta, 'id'> = {
      parceiroId: data.parceiroId,
      nomePontoColeta: data.nomePontoColeta,
      cep: data.cep,
      logradouro: data.logradouro,
      numero: data.numero,
      bairro: data.bairro,
      latitude,
      longitude,
      capacidadeBombona: data.capacidadeBombona ?? null,
      nivelAtualPct: data.nivelAtualPct ?? null,
      statusBombona: data.statusBombona,
      statusAprovacaoPontoColeta: 'PENDENTE',
    };

    const pontoColetaCriado = await this.pontoColetaRepository.create(pontoColetaParaCriar);

    return pontoColetaCriado;
  }
}