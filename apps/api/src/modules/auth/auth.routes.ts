import { Router } from "express";
import { googleLogin, login, logout, me, register } from "./controller/auth.controller";
import { validate } from "../../core/middleware/validate";
import { googleLoginSchema, loginSchema, registerSchema } from "./schema/auth.schema";
import { authenticate } from "../../core/middleware/auth";
import { asyncHandler } from "../../core/middleware/asyncHandler";

const authRouter = Router();

authRouter.post("/register", validate(registerSchema), asyncHandler(register));
authRouter.post("/login", validate(loginSchema), asyncHandler(login));
authRouter.post("/google", validate(googleLoginSchema), asyncHandler(googleLogin));
authRouter.post("/logout", authenticate, asyncHandler(logout));
authRouter.get("/me", authenticate, asyncHandler(me));

export default authRouter;
