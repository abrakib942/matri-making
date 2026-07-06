import swaggerJsdoc from 'swagger-jsdoc';
import type { Options } from 'swagger-jsdoc';

const swaggerDefinition: Options['definition'] = {
  openapi: '3.0.0',
  info: {
    title: 'File Storage API',
    version: '1.0.0',
    description:
      'A simple file storage system with JWT authentication for upload and delete operations. Files are stored with random hash-based names for security.',
    contact: {
      name: 'API Support',
    },
  },
  servers: [
    {
      url: 'http://localhost:5001',
      description: 'Development server',
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
      Error: {
        type: 'object',
        properties: {
          statusCode: {
            type: 'number',
          },
          message: {
            type: 'string',
          },
        },
      },
      Success: {
        type: 'object',
        properties: {
          statusCode: {
            type: 'number',
          },
          data: {
            type: 'object',
          },
          message: {
            type: 'string',
          },
        },
      },
      File: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
          },
          url: {
            type: 'string',
          },
          localUrl: {
            type: 'string',
          },
        },
      },
    },
  },
  tags: [
    {
      name: 'Health',
      description: 'Health check endpoints',
    },
    {
      name: 'Files',
      description: 'File upload, download, and management operations',
    },
  ],
};

const options: Options = {
  definition: swaggerDefinition,
  apis: ['./src/routes/**/*.ts', './src/index.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
