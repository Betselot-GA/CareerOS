import { Request, Response } from "express";
import { env } from "../../../core/config/env";
import { AppError } from "../../../core/errors/AppError";
import { getCurrentUser, loginUser, registerUser } from "../service/auth.service";

const setAuthCookie = (res: Response, token: string): void => {
  res.cookie("accessToken", token, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    domain: env.COOKIE_DOMAIN || undefined,
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
};

export const register = async (req: Request, res: Response): Promise<void> => {
  const result = await registerUser(req.body);
  setAuthCookie(res, result.accessToken);
  res.status(201).json({ success: true, data: result });
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const result = await loginUser(req.body);
  setAuthCookie(res, result.accessToken);
  res.status(200).json({ success: true, data: result });
};

export const me = async (req: Request, res: Response): Promise<void> => {
  if (!req.user?.sub) {
    throw new AppError("Unauthorized", 401);
  }
  const user = await getCurrentUser(req.user.sub);
  res.status(200).json({ success: true, data: user });
};

export const logout = async (_req: Request, res: Response): Promise<void> => {
  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    domain: env.COOKIE_DOMAIN || undefined
  });
  res.status(200).json({ success: true, message: "Logged out" });
};
