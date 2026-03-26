import { z } from "zod";

const jobStatusSchema = z.enum(["wishlist", "applied", "interview", "offer", "rejected"]);

export const createJobSchema = z.object({
  body: z.object({
    company: z.string().min(2),
    title: z.string().min(2),
    location: z.string().optional(),
    notes: z.string().optional(),
    status: jobStatusSchema.optional()
  })
});

export const updateJobStatusSchema = z.object({
  body: z.object({
    status: jobStatusSchema,
    sortKey: z.number().optional()
  }),
  params: z.object({
    jobId: z.string().min(1)
  })
});

export const updateJobSchema = z.object({
  body: z.object({
    company: z.string().min(2).optional(),
    title: z.string().min(2).optional(),
    location: z.string().optional(),
    notes: z.string().optional()
  }),
  params: z.object({
    jobId: z.string().min(1)
  })
});

export const deleteJobSchema = z.object({
  params: z.object({
    jobId: z.string().min(1)
  })
});

export type CreateJobInput = z.infer<typeof createJobSchema>["body"];
export type UpdateJobStatusInput = z.infer<typeof updateJobStatusSchema>["body"];
