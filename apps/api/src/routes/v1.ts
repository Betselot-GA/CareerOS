import { Router } from "express";
import authRouter from "../modules/auth/auth.routes";
import preferencesRouter from "../modules/preferences/preferences.routes";
import { authenticate, authorize } from "../core/middleware/auth";
import { permissions } from "../core/auth/permissions";

const v1Router = Router();

v1Router.get("/health", (_req, res) => {
  res.json({ success: true, service: "career-os-api", version: "v1" });
});

v1Router.use("/auth", authRouter);
v1Router.use("/preferences", preferencesRouter);
v1Router.get("/admin/metrics", authenticate, authorize(permissions.admin.dashboard), (_req, res) => {
  res.json({ success: true, data: { users: "pending", tokenCost: "pending" } });
});

export default v1Router;
