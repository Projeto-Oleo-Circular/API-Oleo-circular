import { ParceiroIndicador } from '../entities/ParceiroIndicador';

export interface IParceiroIndicadorRepository {
  findById(
    id: number
  ): Promise<ParceiroIndicador | null>;

  findAllAtivos(): Promise<ParceiroIndicador[]>;

  findAll(): Promise<ParceiroIndicador[]>;

  create(
    data: Omit<
      ParceiroIndicador,
      'id' | 'criadoEm'
    >
  ): Promise<ParceiroIndicador>;

  update(
    id: number,
    data: Partial<ParceiroIndicador>
  ): Promise<ParceiroIndicador>;

  delete(
    id: number
  ): Promise<void>;

  findByEmail(
  email: string
): Promise<ParceiroIndicador | null>;
}