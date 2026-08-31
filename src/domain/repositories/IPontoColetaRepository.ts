// domain/repositories/IPontoColetaRepository.ts
import { PontoColeta } from '../entities/PontoColeta';

export interface IPontoColetaRepository {
  create(data: Omit<PontoColeta, 'id' | 'criadoEm'>): Promise<PontoColeta>;
  findById(id: number): Promise<PontoColeta | null>;
  findByParceiroId(parceiroId: number): Promise<PontoColeta[]>;
  update(id:  number, data: Partial<PontoColeta>): Promise<PontoColeta>;
  updateStatusComObservacao(
    id:  number, 
    status: 'APROVADO' | 'REJEITADO' | 'PENDENTE', 
    observacao: string | null
  ): Promise<PontoColeta>;
  findAll(): Promise<PontoColeta[]>;
  delete(id: number): Promise<void>;

}