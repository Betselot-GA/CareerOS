import bcrypt from "bcryptjs";
import { OAuth2Client } from "google-auth-library";
import { AppError } from "../../../core/errors/AppError";
import { signAccessToken } from "../../../core/auth/jwt";
import { env } from "../../../core/config/env";
import { UserModel } from "../repository/user.model";
import { GoogleLoginInput, LoginInput, RegisterInput } from "../schema/auth.schema";

const googleClient = new OAuth2Client();

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

export const loginWithGoogle = async (payload: GoogleLoginInput) => {
  if (!env.GOOGLE_CLIENT_ID) {
    throw new AppError("Google auth is not configured", 500);
  }

  const ticket = await googleClient.verifyIdToken({
    idToken: payload.idToken,
    audience: env.GOOGLE_CLIENT_ID
  });
  const tokenPayload = ticket.getPayload();

  if (!tokenPayload?.email || !tokenPayload.sub) {
    throw new AppError("Invalid Google token payload", 401);
  }

  let user = await UserModel.findOne({ email: tokenPayload.email });
  if (!user) {
    user = await UserModel.create({
      email: tokenPayload.email,
      name: tokenPayload.name ?? tokenPayload.email.split("@")[0],
      role: "free",
      authProvider: "google",
      providerAccountId: tokenPayload.sub,
      preferences: {}
    });
  } else if (user.authProvider === "local" && !user.providerAccountId) {
    user.authProvider = "google";
    user.providerAccountId = tokenPayload.sub;
    await user.save();
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
