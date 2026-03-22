import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { STATUS_CODES } from '../utils/constants';

export const validate = (
    schema: ZodSchema,
    source: 'body' | 'params' = 'body'
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const data = source === 'body' ? req.body : req.params;

    const result = schema.safeParse(data);

    if (!result.success) {
        const formattedErrors = result.error.issues.map((err) => ({
            field: err.path.join('.'),
            message: err.message,
        }));
        return res.status(STATUS_CODES.BAD_REQUEST).json({
            success: false,
            message: 'Validation failed',
            errors: formattedErrors,
        });
    }

    // overwrite with parsed data
    if (source === 'body') req.body = result.data;
    else req.params = result.data;

    next();
  };
};