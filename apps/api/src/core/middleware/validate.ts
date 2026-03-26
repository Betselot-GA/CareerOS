import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { AppError } from "../errors/AppError";

export const validate =
  (schema: z.ZodTypeAny) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse({
      body: req.body,
      query: req.query,
      params: req.params
    });

    if (!result.success) {
      next(new AppError(result.error.issues[0]?.message ?? "Validation error", 400));
      return;
    }

    next();
  };
