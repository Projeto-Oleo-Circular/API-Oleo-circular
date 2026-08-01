import { NextFunction, Request, Response } from 'express';
import { TokenExpiredError, JsonWebTokenError } from 'jsonwebtoken';
import { z } from 'zod';
import rateLimit from 'express-rate-limit';
import { verify } from '../../../shared/utils/jwt-utils';

// ======================
// TIPOS
// ======================

export interface AuthenticatedUser {
  id: number;
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

// ======================
// VALIDAÇÃO DO PAYLOAD DO TOKEN
// ======================

const authenticatedUserSchema = z.object({
  id: z.number().int(),
  email: z.string().email(),
  tipo: z.enum(['parceiro', 'admin']),
});

// ======================
// RATE LIMIT PARA LOGIN
// ======================

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 1000,                   // 5 tentativas
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'Muitas tentativas de login. Tente novamente mais tarde.',
  },
});

// ======================
// MIDDLEWARE DE AUTENTICAÇÃO / AUTORIZAÇÃO
// ======================

export class AuthMiddleware {
  static verify(req: Request, res: Response, next: NextFunction): void {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ message: 'Token ausente ou inválido' });
      return;
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      res.status(401).json({ message: 'Token ausente ou inválido' });
      return;
    }

    try {
      const decoded = verify(token);
      const parsed = authenticatedUserSchema.safeParse(decoded);

      if (!parsed.success) {
        res.status(401).json({ message: 'Token inválido' });
        return;
      }

      req.user = parsed.data;
      next();
    } catch (err) {
      if (err instanceof TokenExpiredError) {
        res.status(401).json({ message: 'Token expirado', code: 'TOKEN_EXPIRED' });
        return;
      }

      if (err instanceof JsonWebTokenError) {
        res.status(401).json({ message: 'Token inválido' });
        return;
      }

      res.status(401).json({ message: 'Token inválido' });
    }
  }

  static requireRole(...roles: Array<'parceiro' | 'admin'>) {
    return (req: Request, res: Response, next: NextFunction): void => {
      if (!req.user) {
        res.status(401).json({ message: 'Usuário não autenticado' });
        return;
      }

      if (!roles.includes(req.user.tipo)) {
        res.status(403).json({ message: 'Acesso negado' });
        return;
      }

      next();
    };
  }
}