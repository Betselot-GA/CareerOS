import { AppError } from "../../../core/errors/AppError";
import { UserModel } from "../../auth/repository/user.model";

export const savePreferenceStepOne = async (userId: string, payload: { roles: string[]; stack: string[] }) => {
  const user = await UserModel.findByIdAndUpdate(
    userId,
    {
      $set: {
        "preferences.roles": payload.roles,
        "preferences.stack": payload.stack
      }
    },
    { new: true }
  ).select("-passwordHash");

  if (!user) throw new AppError("User not found", 404);
  return user.preferences;
};

export const savePreferenceStepTwo = async (
  userId: string,
  payload: { minSalary: number; vibe: "startup" | "midsize" | "corporate" }
) => {
  const user = await UserModel.findByIdAndUpdate(
    userId,
    {
      $set: {
        "preferences.minSalary": payload.minSalary,
        "preferences.vibe": payload.vibe
      }
    },
    { new: true }
  ).select("-passwordHash");

  if (!user) throw new AppError("User not found", 404);
  return user.preferences;
};

export const savePreferenceStepThree = async (
  userId: string,
  payload: { targetLocations: string[]; jobType: "remote" | "hybrid" | "onsite" }
) => {
  const user = await UserModel.findByIdAndUpdate(
    userId,
    {
      $set: {
        "preferences.targetLocations": payload.targetLocations,
        "preferences.jobType": payload.jobType
      }
    },
    { new: true }
  ).select("-passwordHash");

  if (!user) throw new AppError("User not found", 404);
  return user.preferences;
};

export const getPreferences = async (userId: string) => {
  const user = await UserModel.findById(userId).select("preferences");
  if (!user) throw new AppError("User not found", 404);
  return user.preferences;
};
