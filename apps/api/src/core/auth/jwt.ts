import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { Permission, getPermissionsByRole } from "./permissions";
import { UserRole } from "../../modules/auth/repository/user.model";

export interface AccessTokenPayload {
  sub: string;
  role: UserRole;
  permissions: Permission[];
}

export const signAccessToken = (sub: string, role: UserRole): string => {
  const payload: AccessTokenPayload = {
    sub,
    role,
    permissions: getPermissionsByRole(role)
  };

  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"]
  });
};

export const verifyAccessToken = (token: string): AccessTokenPayload => {
  return jwt.verify(token, env.JWT_SECRET) as AccessTokenPayload;
};
