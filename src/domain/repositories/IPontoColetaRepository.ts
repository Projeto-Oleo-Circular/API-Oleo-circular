// domain/repositories/IPontoColetaRepository.ts
import { PontoColeta } from '../entities/PontoColeta';

export interface IPontoColetaRepository {
  create(data: Omit<PontoColeta, 'id' | 'criadoEm'>): Promise<PontoColeta>;
  findById(id: string | number): Promise<PontoColeta | null>;
  findByParceiroId(parceiroId: number): Promise<PontoColeta[]>;
  update(id: string | number, data: Partial<PontoColeta>): Promise<PontoColeta>;
  updateStatusComObservacao(
    id: string | number, 
    status: 'APROVADO' | 'REJEITADO' | 'PENDENTE', 
    observacao: string | null
  ): Promise<PontoColeta>;
  findAll(): Promise<PontoColeta[]>;
}