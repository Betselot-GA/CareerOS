import { Schema, model } from "mongoose";

export type UserRole = "free" | "pro" | "admin";
export type AuthProvider = "local" | "google";

export interface PreferenceStepOne {
  roles: string[];
  stack: string[];
}

export interface PreferenceStepTwo {
  minSalary: number;
  vibe: "startup" | "midsize" | "corporate";
}

export interface PreferenceStepThree {
  targetLocations: string[];
  jobType: "remote" | "hybrid" | "onsite";
}

export interface UserDocument {
  _id: string;
  email: string;
  passwordHash?: string;
  name: string;
  role: UserRole;
  authProvider: AuthProvider;
  providerAccountId?: string;
  preferences: {
    roles: string[];
    stack: string[];
    minSalary?: number;
    vibe?: "startup" | "midsize" | "corporate";
    targetLocations: string[];
    jobType?: "remote" | "hybrid" | "onsite";
  };
  stripeId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PreferenceSchema = new Schema(
  {
    roles: { type: [String], default: [] },
    stack: { type: [String], default: [] },
    minSalary: { type: Number },
    vibe: { type: String, enum: ["startup", "midsize", "corporate"] },
    targetLocations: { type: [String], default: [] },
    jobType: { type: String, enum: ["remote", "hybrid", "onsite"] }
  },
  { _id: false }
);

const UserSchema = new Schema<UserDocument>(
  {
    email: { type: String, unique: true, required: true, index: true },
    passwordHash: { type: String },
    name: { type: String, required: true },
    role: { type: String, enum: ["free", "pro", "admin"], default: "free" },
    authProvider: { type: String, enum: ["local", "google"], default: "local" },
    providerAccountId: { type: String },
    preferences: { type: PreferenceSchema, default: () => ({}) },
    stripeId: { type: String }
  },
  { timestamps: true }
);

export const UserModel = model<UserDocument>("User", UserSchema);
