import bcrypt from "bcryptjs";
import { AppError } from "../../../core/errors/AppError";
import { signAccessToken } from "../../../core/auth/jwt";
import { UserModel } from "../repository/user.model";
import { LoginInput, RegisterInput } from "../schema/auth.schema";

export const registerUser = async (payload: RegisterInput) => {
  const existingUser = await UserModel.findOne({ email: payload.email });
  if (existingUser) {
    throw new AppError("Email already in use", 409);
  }

  const passwordHash = await bcrypt.hash(payload.password, 10);
  const user = await UserModel.create({
    email: payload.email,
    passwordHash,
    name: payload.name,
    role: "free",
    authProvider: "local",
    preferences: payload.preferences ?? {}
  });

  const accessToken = signAccessToken(String(user._id), user.role);

  return {
    user: {
      id: String(user._id),
      email: user.email,
      role: user.role,
      name: user.name,
      authProvider: user.authProvider
    },
    accessToken
  };
};

export const loginUser = async (payload: LoginInput) => {
  const user = await UserModel.findOne({ email: payload.email });
  if (!user || !user.passwordHash) {
    throw new AppError("Invalid credentials", 401);
  }

  const isPasswordValid = await bcrypt.compare(payload.password, user.passwordHash);
  if (!isPasswordValid) {
    throw new AppError("Invalid credentials", 401);
  }

  const accessToken = signAccessToken(String(user._id), user.role);
  return {
    user: {
      id: String(user._id),
      email: user.email,
      role: user.role,
      name: user.name,
      authProvider: user.authProvider
    },
    accessToken
  };
};

export const getCurrentUser = async (userId: string) => {
  const user = await UserModel.findById(userId).select("-passwordHash");
  if (!user) {
    throw new AppError("User not found", 404);
  }
  return user;
};
