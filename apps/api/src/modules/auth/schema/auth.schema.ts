import { z } from "zod";

export const registerSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(8),
    name: z.string().min(2),
    preferences: z
      .object({
        roles: z.array(z.string()).default([]),
        stack: z.array(z.string()).default([]),
        minSalary: z.number().positive().optional(),
        vibe: z.enum(["startup", "midsize", "corporate"]).optional()
      })
      .optional()
  })
});

export type RegisterInput = z.infer<typeof registerSchema>["body"];

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(8)
  })
});

export type LoginInput = z.infer<typeof loginSchema>["body"];
