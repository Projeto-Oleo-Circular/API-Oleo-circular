import { NextFunction, Request, Response } from 'express';
import { verify } from '../../../shared/utils/jwt-utils';

export interface AuthenticatedUser {
  id: string;
  email: string;
  tipo: 'parceiro' | 'admin';
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export class AuthMiddleware {
  static verify(req: Request, res: Response, next: NextFunction): void {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ message: 'Token ausente ou inválido' });
      return;
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = verify(token) as AuthenticatedUser;
      req.user = decoded;
      next();
    } catch {
      res.status(401).json({ message: 'Token inválido' });
    }
  }

  static requireRole(role: 'parceiro' | 'admin') {
    return (req: Request, res: Response, next: NextFunction): void => {
      if (!req.user) {
        res.status(401).json({ message: 'Usuário não autenticado' });
        return;
      }

      if (req.user.tipo !== role) {
        res.status(403).json({ message: 'Acesso negado' });
        return;
      }

      next();
    };
  }
}
