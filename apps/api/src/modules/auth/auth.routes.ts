import { Router } from "express";
import { login, logout, me, register } from "./controller/auth.controller";
import { validate } from "../../core/middleware/validate";
import { loginSchema, registerSchema } from "./schema/auth.schema";
import { authenticate } from "../../core/middleware/auth";
import { asyncHandler } from "../../core/middleware/asyncHandler";

const authRouter = Router();

authRouter.post("/register", validate(registerSchema), asyncHandler(register));
authRouter.post("/login", validate(loginSchema), asyncHandler(login));
authRouter.post("/logout", authenticate, asyncHandler(logout));
authRouter.get("/me", authenticate, asyncHandler(me));

export default authRouter;
