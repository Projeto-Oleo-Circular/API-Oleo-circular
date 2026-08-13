import { OpenAPIRegistry, OpenApiGeneratorV3, extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import swaggerJsdoc from 'swagger-jsdoc';
import { z } from 'zod';

import {
  CriarParceiroDTOSchema,
  LoginDTOSchema,
} from '../../../shared/dtos/parceiro';
extendZodWithOpenApi(z);

const registry = new OpenAPIRegistry();

registry.register('CriarParceiroDTO', CriarParceiroDTOSchema);
registry.register('LoginDTO', LoginDTOSchema);

const generator = new OpenApiGeneratorV3(registry.definitions);
const zodComponents = generator.generateComponents();

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API de Coleta de Óleo Circular',
      version: '1.0.0',
      description: 'Sistema de gerenciamento Óleo Circular',
    },
    servers: [
      {
        url: process.env.API_URL || 'http://localhost:3000',
        description:
          process.env.NODE_ENV === 'production'
            ? 'Servidor de Produção'
            : 'Servidor de Desenvolvimento',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        ...zodComponents.components?.schemas,
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/infrastructure/http/routes/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);