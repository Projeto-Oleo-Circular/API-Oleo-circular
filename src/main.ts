import express from 'express';
import dotenv from 'dotenv';
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

app.use(express.json());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const parceiroRepository = new SupabaseParceiroRepository();
const pontoColetaRepository = new SupabasePontoColetaRepository();

app.use('/parceiros', parceiroRoutes);
app.use('/pontos-coleta', pontoColetaRoutes);
app.use('/admin', adminRoutes);

app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    repositories: {
      parceiro: parceiroRepository.constructor.name,
      pontoColeta: pontoColetaRepository.constructor.name,
    },
  });
});

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (err instanceof Error) {
    res.status(400).json({ message: err.message });
    return;
  }
  res.status(500).json({ message: 'Erro interno do servidor' });
});

app.listen(port, () => {
  console.log(`API listening on port ${port}`);
  console.log(`Swagger docs available at http://localhost:${port}/api-docs`);
});