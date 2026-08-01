import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret';

export function generate(payload: { id: number; email: string; tipo: string }): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
}

export function verify(token: string): any {
  return jwt.verify(token, JWT_SECRET);
}
