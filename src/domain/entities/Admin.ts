export interface Admin {
  id: number;
  nome: string;
  email: string;
  senhaHash: string;
  nivelAcesso: 'admin';
  criadoEm: Date;
  ultimoAcesso: Date | null;
  atulizadoEm: Date;
}
