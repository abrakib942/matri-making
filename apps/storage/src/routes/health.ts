import { Router, type Request, type Response } from 'express';

const router: Router = Router();

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     description: Public endpoint to check server status
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Server is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 */
router.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
  });
});

export default router;
