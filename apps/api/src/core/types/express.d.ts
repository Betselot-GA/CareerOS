import { Permission } from "../auth/permissions";
import { UserRole } from "../../modules/auth/repository/user.model";

declare global {
  namespace Express {
    interface Request {
      user?: {
        sub: string;
        role: UserRole;
        permissions: Permission[];
      };
    }
  }
}

export {};
