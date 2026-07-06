import { debugLogger, errorLogger, infoLogger } from '../config/winston.js';
import constants from './constants.js';
import envVariables from './env.js';

interface Logger {
  debug: (tag: string, data?: unknown) => void;
  info: (tag: string, data?: unknown) => void;
  error: (tag: string, error: unknown) => void;
}

const logger: Logger = {
  debug: (tag: string, data?: unknown) => {
    if (envVariables.ENV === constants.DEV) {
      debugLogger.debug(tag, { tag, data });
    }
  },

  info: (tag: string, data?: unknown) => {
    infoLogger.info(tag, { tag, data });
  },

  error: (tag: string, error: unknown) => {
    if (error instanceof Error) {
      errorLogger.error(error.message, { tag, data: { ...error } });
    } else {
      errorLogger.error(tag, { tag, data: error });
    }
  },
};

export default logger;
