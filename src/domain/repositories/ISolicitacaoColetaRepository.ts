import { SolicitacaoColeta } from '../entities/SolicitacaoColeta';

export interface ISolicitacaoColetaRepository {
  create(data: Omit<SolicitacaoColeta, 'id' | 'dataSolicitacao'>): Promise<SolicitacaoColeta>;
  findById(id: number): Promise<SolicitacaoColeta | null>;
  findByPontoColetaId(pontoColetaId: number): Promise<SolicitacaoColeta[]>;
  update(id: number, data: Partial<SolicitacaoColeta>): Promise<SolicitacaoColeta>;
  findAll(): Promise<SolicitacaoColeta[]>;
}