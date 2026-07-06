import type { SuccessResponse, ErrorResponse } from '../types/index.js';

interface ErrorObject {
  name?: string;
  message?: string;
  errors?: Array<{ message?: string }>;
  parent?: {
    sqlMessage?: string;
  };
}

const errorMapper = (object: ErrorObject): ErrorResponse => {
  let message = '';
  const { name } = object;

  if (object?.errors?.[0]?.message) {
    message = object.errors[0].message;
  } else if (object?.parent?.sqlMessage) {
    message = object.parent.sqlMessage;
  } else if (object?.message) {
    message = object.message;
  }

  // If all others fails
  if (!message) {
    message = 'Something went wrong, please have patient and try again.';
  }

  // error mapper for other purpose
  let statusCode = 500;
  if (name === 'badRequest') {
    statusCode = 400;
  } else if (name === 'unauthorized') {
    statusCode = 401;
    if (!message) {
      message = 'You are not authorized';
    }
  } else if (name === 'paymentRequired') {
    statusCode = 402;
  } else if (name === 'forbidden') {
    statusCode = 403;
  } else if (name === 'notFound') {
    statusCode = 404;
  } else if (name === 'badImplementation') {
    statusCode = 500;
  }

  return {
    statusCode,
    message,
  };
};

export const error = (object: ErrorObject | Error): ErrorResponse => {
  // Handle Error instances
  if (object instanceof Error) {
    return {
      statusCode: 500,
      message: object.message || 'Internal Server Error',
    };
  }

  return errorMapper(object);
};

export const success = <T = unknown>(data: T, message?: string): SuccessResponse<T> => {
  return {
    statusCode: 200,
    data,
    message,
  };
};
