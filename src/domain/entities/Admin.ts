export interface Admin {
  id: string;
  nome: string;
  email: string;
  senhaHash: string;
  licenca: string;
  nivelAcesso: 'master' | 'gerente';
  criadoEm: Date;
  ultimoAcesso: Date | null;
}
