import { PontoColeta } from '../entities/PontoColeta';

export interface IPontoColetaRepository {
  create(data: Omit<PontoColeta, 'id'>): Promise<PontoColeta>;
  findById(id: string): Promise<PontoColeta | null>;
  findByParceiroId(parceiroId: string): Promise<PontoColeta[]>;
  update(id: string, data: Partial<PontoColeta>): Promise<PontoColeta>;
}
