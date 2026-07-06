import envVariables from '../utils/env.js';
import { createLogger, format, transports } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

const { combine, timestamp, colorize, errors, prettyPrint, simple } = format;
const timestampFormat = { format: 'YYYY-MM-DD HH:mm:ss' };

export const debugLogger = createLogger({
  level: 'debug',
  defaultMeta: { service: 'node-express-dynamic-storage' },
  transports: [
    new DailyRotateFile({
      filename: envVariables.LOG_DIR_PATH + '/debug.log',
      level: 'debug',
      format: combine(timestamp(timestampFormat), errors({ stack: true }), prettyPrint()),
    }),
    new transports.Console({
      level: 'debug',
      format: combine(colorize(), timestamp(timestampFormat), errors({ stack: true }), simple()),
    }),
  ],
});

export const infoLogger = createLogger({
  level: 'info',
  defaultMeta: { service: 'node-express-dynamic-storage' },
  transports: [
    new DailyRotateFile({
      filename: envVariables.LOG_DIR_PATH + '/info.log',
      level: 'info',
      format: combine(timestamp(timestampFormat), errors({ stack: true }), prettyPrint()),
    }),
  ],
});

export const errorLogger = createLogger({
  level: 'error',
  defaultMeta: { service: 'node-express-dynamic-storage' },
  transports: [
    new DailyRotateFile({
      filename: envVariables.LOG_DIR_PATH + '/error.log',
      level: 'error',
      format: combine(timestamp(timestampFormat), errors({ stack: true }), prettyPrint()),
    }),
    new transports.Console({
      level: 'error',
      format: combine(colorize(), timestamp(timestampFormat), errors({ stack: true }), simple()),
    }),
  ],
});
