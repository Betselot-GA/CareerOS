import { z } from "zod";

export const preferenceStepOneSchema = z.object({
  body: z.object({
    roles: z.array(z.string()).min(1),
    stack: z.array(z.string()).min(1)
  })
});

export const preferenceStepTwoSchema = z.object({
  body: z.object({
    minSalary: z.number().positive(),
    vibe: z.enum(["startup", "midsize", "corporate"])
  })
});

export const preferenceStepThreeSchema = z.object({
  body: z.object({
    targetLocations: z.array(z.string()).min(1),
    jobType: z.enum(["remote", "hybrid", "onsite"])
  })
});
