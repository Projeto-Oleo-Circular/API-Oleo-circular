import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors'; // Importe o CORS
import swaggerUi from 'swagger-ui-express';
import { SupabaseParceiroRepository } from './infrastructure/repositories/SupabaseParceiroRepository';
import { SupabasePontoColetaRepository } from './infrastructure/repositories/SupabasePontoColetaRepository';
import parceiroRoutes from './infrastructure/http/routes/parceiro.routes';
import pontoColetaRoutes from './infrastructure/http/routes/pontoColeta.routes';
import adminRoutes from './infrastructure/http/routes/admin.routes';
import { swaggerSpec } from './swagger';

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 3000);

// ======================
// CONFIGURAÇÃO DO CORS
// ======================

// Opção 1: CORS básico (permite todas as origens - apenas desenvolvimento!)
app.use(cors());

// Opção 2: CORS configurado (recomendado para desenvolvimento e produção)
// Descomente esta parte e comente a opção 1 para usar configurações específicas
/*
const allowedOrigins = [
  'http://localhost:5173',
  'http://192.168.1.13:5173',
  'http://127.0.0.1:5173',
  // Adicione outras URLs do frontend aqui
];

app.use(cors({
  origin: function (origin, callback) {
    // Permite requisições sem origin (como mobile apps ou curl)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
}));
*/

// ======================
// MIDDLEWARES
// ======================

app.use(express.json());

// ======================
// SWAGGER
// ======================

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ======================
// REPOSITÓRIOS
// ======================

const parceiroRepository = new SupabaseParceiroRepository();
const pontoColetaRepository = new SupabasePontoColetaRepository();

// ======================
// ROTAS
// ======================

app.use('/parceiros', parceiroRoutes);
app.use('/pontos-coleta', pontoColetaRoutes);
app.use('/admin', adminRoutes);

// ======================
// HEALTH CHECK
// ======================

app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    repositories: {
      parceiro: parceiroRepository.constructor.name,
      pontoColeta: pontoColetaRepository.constructor.name,
    },
  });
});

// ======================
// TRATAMENTO DE ERROS
// ======================

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (err instanceof Error) {
    res.status(400).json({ message: err.message });
    return;
  }
  res.status(500).json({ message: 'Erro interno do servidor' });
});

// ======================
// INICIALIZAÇÃO
// ======================

app.listen(port, '0.0.0.0', () => { // Adicione '0.0.0.0' para aceitar conexões de outros dispositivos
  console.log(`API listening on port ${port}`);
  console.log(`Swagger docs available at http://localhost:${port}/api-docs`);
  console.log(`API available at http://localhost:${port}`);
  console.log(`Accessible from network at http://192.168.1.13:${port}`); // Opcional
});