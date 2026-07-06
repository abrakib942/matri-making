import type { NextFunction, Request, Response } from 'express';
import { validateTokenPayload, verifyToken } from '../utils/jwt.js';
import { error } from '../utils/response.js';

export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      res.status(401).json(
        error({
          name: 'unauthorized',
          message: 'Authorization header is missing',
        }),
      );
      return;
    }

    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;

    if (!token) {
      res.status(401).json(
        error({
          name: 'unauthorized',
          message: 'Token is missing',
        }),
      );
      return;
    }

    const decoded = verifyToken(token);

    if (!decoded) {
      res.status(401).json(
        error({
          name: 'unauthorized',
          message:
            'Invalid or expired token. Ensure JWT_SECRET in storage app matches the API app.',
        }),
      );
      return;
    }

    if (!validateTokenPayload(decoded)) {
      res.status(401).json(
        error({
          name: 'unauthorized',
          message: 'Invalid token payload: email is required',
        }),
      );
      return;
    }

    req.user = decoded;
    next();
  } catch {
    res.status(401).json(
      error({
        name: 'unauthorized',
        message: 'Authentication failed',
      }),
    );
  }
};
