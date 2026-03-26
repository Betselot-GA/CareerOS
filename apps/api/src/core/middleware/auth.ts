import { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/AppError";
import { Permission } from "../auth/permissions";
import { verifyAccessToken } from "../auth/jwt";

const extractBearerToken = (authorizationHeader?: string): string | null => {
  if (!authorizationHeader) return null;
  const [scheme, token] = authorizationHeader.split(" ");
  if (scheme !== "Bearer" || !token) return null;
  return token;
};

export const authenticate = (req: Request, _res: Response, next: NextFunction): void => {
  const cookieToken = req.cookies?.accessToken as string | undefined;
  const bearerToken = extractBearerToken(req.header("Authorization"));
  const token = cookieToken ?? bearerToken;

  if (!token) {
    next(new AppError("Unauthorized", 401));
    return;
  }

  try {
    req.user = verifyAccessToken(token);
    next();
  } catch {
    next(new AppError("Invalid or expired token", 401));
  }
};

export const authorize =
  (requiredPermission: Permission) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new AppError("Unauthorized", 401));
      return;
    }

    if (!req.user.permissions.includes(requiredPermission)) {
      next(new AppError("Forbidden", 403));
      return;
    }

    next();
  };
