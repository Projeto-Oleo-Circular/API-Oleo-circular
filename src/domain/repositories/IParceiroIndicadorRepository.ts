
import { ParceiroIndicador } from '../entities/ParceiroIndicador';

export interface IParceiroIndicadorRepository {
  findAllAtivos(): Promise<ParceiroIndicador[]>;
}