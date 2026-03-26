import mongoose from "mongoose";
import { env } from "./env";

let isConnected = false;

export const connectDB = async (): Promise<void> => {
  if (isConnected) return;
  await mongoose.connect(env.MONGODB_URI);
  isConnected = true;
};
