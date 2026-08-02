export interface Admin {
  id: number;
  nome: string;
  email: string;
  senhaHash: string;
  licenca: string;
  nivelAcesso: 'master' | 'gerente';
  criadoEm: Date;
  ultimoAcesso: Date | null;
}
