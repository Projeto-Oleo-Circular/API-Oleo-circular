// domain/entities/PasswordResetToken.ts
export interface PasswordResetToken {
  id: number;
  email: string;
  token: string;
  expiresAt: Date;
  used: boolean;
  createdAt: Date;
}