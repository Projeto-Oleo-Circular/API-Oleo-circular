import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';

import parceiroRoutes from './infrastructure/http/routes/parceiro.routes';
import pontoColetaRoutes from './infrastructure/http/routes/pontoColeta.routes';
import adminRoutes from './infrastructure/http/routes/admin.routes';
import { swaggerSpec } from './infrastructure/http/docs/swagger';

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 3000);

app.disable('x-powered-by');
app.set('trust proxy', 1); 

const allowedOrigins = (process.env.ALLOWED_ORIGINS ?? '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: {
      policy: 'cross-origin',
    },
  })
);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) {
        return callback(null, true);
      }
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('Origem não permitida pelo CORS.'));
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 200,
  })
);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Muitas requisições, tente novamente mais tarde.' },
});
app.use(limiter);

app.use(express.json({ limit: '1mb' }));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/parceiros', parceiroRoutes);
app.use('/pontos-coleta', pontoColetaRoutes);
app.use('/admin', adminRoutes);

app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
  });
});

app.use(
  (
    err: unknown,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    if (err instanceof Error) {
      if (err.message === 'Origem não permitida pelo CORS.') {
        return res.status(403).json({
          message: err.message,
        });
      }

      return res.status(400).json({
        message: err.message,
      });
    }

    return res.status(500).json({
      message: 'Erro interno do servidor.',
    });
  }
);

const server = app.listen(port, '0.0.0.0', () => {
  console.log(`API listening on port ${port}`);
  console.log(`Swagger: http://localhost:${port}/api-docs`);
  console.log(`Health: http://localhost:${port}/health`);
});

const shutdown = (signal: string) => {
  console.log(`${signal} recebido. Encerrando servidor...`);

  server.close(() => {
    console.log('Servidor encerrado com sucesso.');
    process.exit(0);
  });

  setTimeout(() => {
    console.error('Forçando encerramento após timeout.');
    process.exit(1);
  }, 10000).unref();
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));