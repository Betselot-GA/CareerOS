import { Router } from "express";
import { authenticate, authorize } from "../../core/middleware/auth";
import { asyncHandler } from "../../core/middleware/asyncHandler";
import { validate } from "../../core/middleware/validate";
import { permissions } from "../../core/auth/permissions";
import {
  getMyPreferences,
  updatePreferenceStepOne,
  updatePreferenceStepThree,
  updatePreferenceStepTwo
} from "./controller/preferences.controller";
import {
  preferenceStepOneSchema,
  preferenceStepThreeSchema,
  preferenceStepTwoSchema
} from "./schema/preferences.schema";

const preferencesRouter = Router();

preferencesRouter.get(
  "/me",
  authenticate,
  authorize(permissions.preferences.readOwn),
  asyncHandler(getMyPreferences)
);

preferencesRouter.patch(
  "/onboarding/step-1",
  authenticate,
  authorize(permissions.preferences.updateOwn),
  validate(preferenceStepOneSchema),
  asyncHandler(updatePreferenceStepOne)
);

preferencesRouter.patch(
  "/onboarding/step-2",
  authenticate,
  authorize(permissions.preferences.updateOwn),
  validate(preferenceStepTwoSchema),
  asyncHandler(updatePreferenceStepTwo)
);

preferencesRouter.patch(
  "/onboarding/step-3",
  authenticate,
  authorize(permissions.preferences.updateOwn),
  validate(preferenceStepThreeSchema),
  asyncHandler(updatePreferenceStepThree)
);

export default preferencesRouter;
