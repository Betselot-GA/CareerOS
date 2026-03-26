import app from "./app";
import { connectDB } from "./core/config/db";
import { env } from "./core/config/env";

const bootstrap = async () => {
  await connectDB();
  app.listen(env.PORT, () => {
    console.log(`API running on http://localhost:${env.PORT}`);
  });
};

bootstrap().catch((error) => {
  console.error("Failed to start server", error);
  process.exit(1);
});
