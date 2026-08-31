import { PasswordResetToken } from '../entities/PasswordResetToken';

export interface IPasswordResetTokenRepository {
  create(data: Omit<PasswordResetToken, 'id' | 'createdAt'>): Promise<PasswordResetToken>;
  findByToken(token: string): Promise<PasswordResetToken | null>;
  markAsUsed(id: number): Promise<void>;
  deleteByEmail(email: string): Promise<void>; 
}