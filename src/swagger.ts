import swaggerJSDoc from 'swagger-jsdoc';
import path from 'path';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Óleo Circular',
      version: '1.0.0',
      description: 'API para gestão de parceiros e pontos de coleta',
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3000}`,
      },
    ],
  },
  apis: [path.join(__dirname, '**/*.ts')],
};

export const swaggerSpec = swaggerJSDoc(options);
