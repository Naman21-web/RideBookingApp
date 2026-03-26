import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { STATUS_CODES } from '../utils/constants';
import { AppError } from '../utils/AppError';

export const validate = (
    schema: ZodSchema,
    source: 'body' | 'params' | 'query' = 'body'
) => {
  return (req: Request, res: Response, next: NextFunction) => {

    const data = source === 'body' ? req.body : source === 'query' ? req.query : req.params;

    const result = schema.safeParse(data);

    if (!result.success) {
        const formattedErrors = result.error.issues.map((err) => ({
            field: err.path.join('.'),
            message: err.message,
        }));
        return next(new AppError('Validation failed',STATUS_CODES.BAD_REQUEST,formattedErrors));
    }

    // overwrite with parsed data
    if (source === 'body') req.body = result.data;
    else req.params = result.data;

    next();
  };
};