// domain/repositories/IPontoColetaRepository.ts
import { PontoColeta } from '../entities/PontoColeta';

export interface IPontoColetaRepository {
  create(data: Omit<PontoColeta, 'id' | 'criadoEm'>): Promise<PontoColeta>;
  findById(id: string): Promise<PontoColeta | null>;
  findByParceiroId(parceiroId: string): Promise<PontoColeta[]>;
  update(id: string, data: Partial<PontoColeta>): Promise<PontoColeta>;
  updateStatusComObservacao(
    id: string, 
    status: 'APROVADO' | 'REJEITADO' | 'PENDENTE', 
    observacao: string | null
  ): Promise<PontoColeta>;
  findAll(): Promise<PontoColeta[]>;
}