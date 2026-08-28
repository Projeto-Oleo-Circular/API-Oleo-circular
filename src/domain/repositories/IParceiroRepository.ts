// domain/repositories/IParceiroRepository.ts
import { Parceiro } from '../entities/Parceiro';

export interface IParceiroRepository {
  create(data: Omit<Parceiro, 'id' | 'criadoEm'>): Promise<Parceiro>;
  findByEmail(email: string): Promise<Parceiro | null>;
  findById(id: number): Promise<Parceiro | null>;
  findByDocumento(documento: string): Promise<Parceiro | null>;
  update(id: number, data: Partial<Parceiro>): Promise<Parceiro>;
  updateStatusComObservacao(
    id: number, 
    status: 'APROVADO' | 'REJEITADO' | 'PENDENTE', 
    observacao: string | null
  ): Promise<Parceiro>;
  findByStatus(status: string): Promise<Parceiro[]>;
  findAll(): Promise<Parceiro[]>;
  getParceirosIndicadores(): Promise<any[]>;
  delete(id: number): Promise<void>;

}