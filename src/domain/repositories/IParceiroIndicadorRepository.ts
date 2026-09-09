
import { ParceiroIndicador } from '../entities/ParceiroIndicador';

export interface IParceiroIndicadorRepository {
  findAllAtivos(): Promise<ParceiroIndicador[]>;
  create(data: Omit<ParceiroIndicador, 'id' | 'criadoEm'>): Promise<ParceiroIndicador>;
  update(id: number, data: Partial<ParceiroIndicador>): Promise<ParceiroIndicador>;
  delete(id: number): Promise<void>;
  findAll(): Promise<ParceiroIndicador[]>;
  findById(id: number): Promise<ParceiroIndicador | null>;

}