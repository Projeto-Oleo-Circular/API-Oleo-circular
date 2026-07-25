// domain/repositories/IParceiroRepository.ts
import { Parceiro } from '../entities/Parceiro';

export interface IParceiroRepository {
  create(data: Omit<Parceiro, 'id' | 'criadoEm'>): Promise<Parceiro>;
  findByEmail(email: string): Promise<Parceiro | null>;
  findById(id: string): Promise<Parceiro | null>;
  findByDocumento(documento: string): Promise<Parceiro | null>;
  update(id: string, data: Partial<Parceiro>): Promise<Parceiro>;
  updateStatusComObservacao(
    id: string, 
    status: 'APROVADO' | 'REJEITADO' | 'PENDENTE', 
    observacao: string | null
  ): Promise<Parceiro>;
  findByStatus(status: string): Promise<Parceiro[]>;
  findAll(): Promise<Parceiro[]>;
  getParceirosIndicadores(): Promise<any[]>;
}