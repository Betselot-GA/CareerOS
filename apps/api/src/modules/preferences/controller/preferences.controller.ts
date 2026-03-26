import { Request, Response } from "express";
import { AppError } from "../../../core/errors/AppError";
import {
  getPreferences,
  savePreferenceStepOne,
  savePreferenceStepThree,
  savePreferenceStepTwo
} from "../service/preferences.service";

export const getMyPreferences = async (req: Request, res: Response): Promise<void> => {
  if (!req.user?.sub) throw new AppError("Unauthorized", 401);
  const preferences = await getPreferences(req.user.sub);
  res.status(200).json({ success: true, data: preferences });
};

export const updatePreferenceStepOne = async (req: Request, res: Response): Promise<void> => {
  if (!req.user?.sub) throw new AppError("Unauthorized", 401);
  const preferences = await savePreferenceStepOne(req.user.sub, req.body);
  res.status(200).json({ success: true, step: 1, data: preferences });
};

export const updatePreferenceStepTwo = async (req: Request, res: Response): Promise<void> => {
  if (!req.user?.sub) throw new AppError("Unauthorized", 401);
  const preferences = await savePreferenceStepTwo(req.user.sub, req.body);
  res.status(200).json({ success: true, step: 2, data: preferences });
};

export const updatePreferenceStepThree = async (req: Request, res: Response): Promise<void> => {
  if (!req.user?.sub) throw new AppError("Unauthorized", 401);
  const preferences = await savePreferenceStepThree(req.user.sub, req.body);
  res.status(200).json({ success: true, step: 3, data: preferences });
};
