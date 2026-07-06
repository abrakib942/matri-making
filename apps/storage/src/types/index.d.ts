import { Request } from 'express';

export interface JwtPayload {
  iss: string;
  sub: string;
  email: string;
  [key: string]: unknown;
}

export interface FileUploadRequest extends Request {
  file?: Express.Multer.File;
}

export interface SuccessResponse<T = unknown> {
  statusCode: 200 | 201;
  data: T;
  message?: string;
}

export interface ErrorResponse {
  statusCode: number;
  message: string;
  error?: unknown;
}

export interface FileInfo {
  name: string;
  url: string;
  localUrl?: string;
}

export interface ServiceResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: Error | unknown;
}
