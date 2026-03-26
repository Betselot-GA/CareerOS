import { AppError } from "../../../core/errors/AppError";
import { Permission } from "../../../core/auth/permissions";
import { JobModel, JobStatus } from "../repository/job.model";
import { CreateJobInput, UpdateJobStatusInput } from "../schema/jobs.schema";

const ACTIVE_STATUSES: JobStatus[] = ["wishlist", "applied", "interview"];

const enforceFreeLimit = async (userId: string, permissions: Permission[], nextStatus: JobStatus) => {
  if (permissions.includes("applications:unlimited")) return;
  if (!ACTIVE_STATUSES.includes(nextStatus)) return;

  const activeCount = await JobModel.countDocuments({
    userId,
    status: { $in: ACTIVE_STATUSES }
  });

  if (activeCount >= 10) {
    throw new AppError("FREE plan supports max 10 active applications", 403);
  }
};

export const createJob = async (userId: string, payload: CreateJobInput, permissions: Permission[]) => {
  const status = payload.status ?? "wishlist";
  await enforceFreeLimit(userId, permissions, status);

  const job = await JobModel.create({
    userId,
    company: payload.company,
    title: payload.title,
    location: payload.location,
    notes: payload.notes,
    status,
    sortKey: Date.now()
  });

  return job;
};

export const listJobs = async (userId: string) => {
  return JobModel.find({ userId }).sort({ sortKey: -1 });
};

export const updateJobStatus = async (
  userId: string,
  jobId: string,
  payload: UpdateJobStatusInput,
  permissions: Permission[]
) => {
  const existingJob = await JobModel.findOne({ _id: jobId, userId });
  if (!existingJob) throw new AppError("Job not found", 404);

  if (!ACTIVE_STATUSES.includes(existingJob.status) && ACTIVE_STATUSES.includes(payload.status)) {
    await enforceFreeLimit(userId, permissions, payload.status);
  }

  existingJob.status = payload.status;
  if (typeof payload.sortKey === "number") {
    existingJob.sortKey = payload.sortKey;
  } else {
    existingJob.sortKey = Date.now();
  }
  await existingJob.save();
  return existingJob;
};

export const updateJob = async (
  userId: string,
  jobId: string,
  payload: { company?: string; title?: string; location?: string; notes?: string }
) => {
  const updated = await JobModel.findOneAndUpdate(
    { _id: jobId, userId },
    { $set: payload },
    { new: true }
  );
  if (!updated) throw new AppError("Job not found", 404);
  return updated;
};

export const deleteJob = async (userId: string, jobId: string) => {
  const deleted = await JobModel.findOneAndDelete({ _id: jobId, userId });
  if (!deleted) throw new AppError("Job not found", 404);
};
