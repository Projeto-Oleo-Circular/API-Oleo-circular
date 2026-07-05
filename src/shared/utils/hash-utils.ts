import bcrypt from 'bcrypt';

export async function hash(senha: string): Promise<string> {
  return bcrypt.hash(senha, 10);
}

export async function compare(senha: string, hashValue: string): Promise<boolean> {
  return bcrypt.compare(senha, hashValue);
}
