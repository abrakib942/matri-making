import cors from 'cors';
import express, { type Express, type Request, type Response } from 'express';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger.js';
import healthRoutes from './routes/health.js';
import allRoutes from './routes/index.js';
import envVariables from './utils/env.js';
import logger from './utils/logger.js';

try {
  const app: Express = express();

  app.use(cors());

  // Serve static files from attachment directory
  app.use(express.static(envVariables.ATTACHMENT_FOLDER_PATH || 'attachments'));

  const port = envVariables.PORT || 5001;

  // Middlewares
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Health check (public)
  app.use(healthRoutes);

  // Swagger API documentation
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  // API Routes (files routes)
  app.use(allRoutes);

  // Error handling middleware
  app.use((err: Error, _req: Request, res: Response) => {
    logger.error('index.ts: error middleware', err);
    res.status((err as { status?: number }).status || 500).json({
      statusCode: (err as { status?: number }).status || 500,
      message: err.message || 'Internal Server Error',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
  });

  // 404 handler
  app.use((req: Request, res: Response) => {
    res.status(404).json({
      statusCode: 404,
      message: 'Route not found',
    });
  });

  const server = app.listen(port, () => {
    console.log(`🚀 Server is running on port ${port}`);
    console.log(`📁 Attachments directory: ${envVariables.ATTACHMENT_FOLDER_PATH}`);
    console.log(`🌐 Public URL: ${envVariables.PUBLIC_URL}`);
    console.log(`📚 API Documentation: ${envVariables.PUBLIC_URL}/api-docs`);
    console.log(`❤️  Health Check: ${envVariables.PUBLIC_URL}/health`);
  });

  server.on('error', (err: NodeJS.ErrnoException) => {
    if (err.code === 'EADDRINUSE') {
      const message = `Port ${port} is already in use. Please stop the other process or use a different port.`;
      logger.error('index.ts: server listen error', new Error(message));
      console.error(`❌ ${message}`);
    } else {
      logger.error('index.ts: server error', err);
      console.error('❌ Server error:', err);
    }
    process.exit(1);
  });
} catch (error) {
  logger.error('index.ts', error);
  process.exit(1);
}
