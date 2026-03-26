import { z } from "zod";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

export const registerSchema = z.object({
  body: z
    .object({
      email: z.string().regex(emailRegex, "Invalid email format"),
      password: z
        .string()
        .regex(
          passwordRegex,
          "Password must include uppercase, lowercase, number, and special character"
        ),
      confirmPassword: z.string(),
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
    .refine((data) => data.password === data.confirmPassword, {
      message: "Passwords do not match",
      path: ["confirmPassword"]
    })
});

export type RegisterInput = z.infer<typeof registerSchema>["body"];

export const loginSchema = z.object({
  body: z.object({
    email: z.string().regex(emailRegex, "Invalid email format"),
    password: z
      .string()
      .regex(
        passwordRegex,
        "Password must include uppercase, lowercase, number, and special character"
      )
  })
});

export type LoginInput = z.infer<typeof loginSchema>["body"];

export const googleLoginSchema = z.object({
  body: z.object({
    idToken: z.string().min(20)
  })
});

export type GoogleLoginInput = z.infer<typeof googleLoginSchema>["body"];
