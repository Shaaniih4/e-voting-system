import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

export function validateBody(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const errorMessages = err.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`);
        return res.status(400).json({
          error: 'Validation failed',
          details: errorMessages,
        });
      }
      return res.status(400).json({ error: 'Malformed request body' });
    }
  };
}
