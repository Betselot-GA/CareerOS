import { Request, Response } from "express";
import { AppError } from "../../../core/errors/AppError";
import { createJob, deleteJob, listJobs, updateJob, updateJobStatus } from "../service/jobs.service";

export const createJobHandler = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) throw new AppError("Unauthorized", 401);
  const job = await createJob(req.user.sub, req.body, req.user.permissions);
  res.status(201).json({ success: true, data: job });
};

export const listJobsHandler = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) throw new AppError("Unauthorized", 401);
  const jobs = await listJobs(req.user.sub);
  res.status(200).json({ success: true, data: jobs });
};

export const updateJobStatusHandler = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) throw new AppError("Unauthorized", 401);
  const jobId = String(req.params.jobId);
  const job = await updateJobStatus(req.user.sub, jobId, req.body, req.user.permissions);
  res.status(200).json({ success: true, data: job });
};

export const deleteJobHandler = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) throw new AppError("Unauthorized", 401);
  const jobId = String(req.params.jobId);
  await deleteJob(req.user.sub, jobId);
  res.status(200).json({ success: true, message: "Job deleted" });
};

export const updateJobHandler = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) throw new AppError("Unauthorized", 401);
  const jobId = String(req.params.jobId);
  const job = await updateJob(req.user.sub, jobId, req.body);
  res.status(200).json({ success: true, data: job });
};
