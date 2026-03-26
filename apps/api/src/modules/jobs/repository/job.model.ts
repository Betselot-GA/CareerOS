import { Schema, model } from "mongoose";

export type JobStatus = "wishlist" | "applied" | "interview" | "offer" | "rejected";

export interface JobDocument {
  _id: string;
  userId: string;
  company: string;
  title: string;
  location?: string;
  notes?: string;
  status: JobStatus;
  sortKey: number;
  createdAt: Date;
  updatedAt: Date;
}

const JobSchema = new Schema<JobDocument>(
  {
    userId: { type: String, required: true, index: true },
    company: { type: String, required: true },
    title: { type: String, required: true },
    location: { type: String },
    notes: { type: String },
    status: {
      type: String,
      enum: ["wishlist", "applied", "interview", "offer", "rejected"],
      default: "wishlist"
    },
    sortKey: { type: Number, default: () => Date.now() }
  },
  { timestamps: true }
);

export const JobModel = model<JobDocument>("Job", JobSchema);
