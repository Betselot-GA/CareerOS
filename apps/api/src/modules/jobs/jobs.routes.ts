import { Router } from "express";
import { permissions } from "../../core/auth/permissions";
import { authenticate, authorize } from "../../core/middleware/auth";
import { asyncHandler } from "../../core/middleware/asyncHandler";
import { validate } from "../../core/middleware/validate";
import {
  createJobHandler,
  deleteJobHandler,
  listJobsHandler,
  updateJobHandler,
  updateJobStatusHandler
} from "./controller/jobs.controller";
import {
  createJobSchema,
  deleteJobSchema,
  updateJobSchema,
  updateJobStatusSchema
} from "./schema/jobs.schema";

const jobsRouter = Router();

jobsRouter.use(authenticate);

jobsRouter.get("/", authorize(permissions.applications.readOwn), asyncHandler(listJobsHandler));
jobsRouter.post(
  "/",
  authorize(permissions.applications.create),
  validate(createJobSchema),
  asyncHandler(createJobHandler)
);
jobsRouter.patch(
  "/:jobId/status",
  authorize(permissions.applications.manageOwn),
  validate(updateJobStatusSchema),
  asyncHandler(updateJobStatusHandler)
);
jobsRouter.patch(
  "/:jobId",
  authorize(permissions.applications.manageOwn),
  validate(updateJobSchema),
  asyncHandler(updateJobHandler)
);
jobsRouter.delete(
  "/:jobId",
  authorize(permissions.applications.manageOwn),
  validate(deleteJobSchema),
  asyncHandler(deleteJobHandler)
);

export default jobsRouter;
