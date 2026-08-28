import { Admin } from '../entities/Admin';

export interface IAdminRepository {
  findByEmail(email: string): Promise<Admin | null>;
  findById(id: number): Promise<Admin | null>;
  create(adminData: Omit<Admin, 'id' | 'criadoEm' | 'ultimoAcesso' | 'atulizadoEm'>): Promise<Admin>;
    update(id: number, data: Partial<Admin>): Promise<Admin>;
  
}
