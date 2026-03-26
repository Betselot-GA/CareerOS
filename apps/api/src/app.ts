import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import v1Router from "./routes/v1";
import { errorHandler } from "./core/middleware/errorHandler";
import { env } from "./core/config/env";

const app = express();

app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use(
  "/api",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300
  })
);

app.use("/api/v1", v1Router);
app.use(errorHandler);

export default app;
