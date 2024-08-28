import { z } from 'zod';

const createUserSchema = z.object({
  email: z.string(),
  password: z.string(),
});

const forgotPasswordSchema = z.object({
  email: z.string(),
});

const loginSchema = z.object({
  email: z.string(),
  password: z.string(),
});

const resetPasswordSchema = z.object({
  code: z.string(),
  password: z.string(),
});

const validateEmailSchema = z.object({
  userId: z.string(),
  code: z.string(),
});

export {
  createUserSchema,
  forgotPasswordSchema,
  loginSchema,
  resetPasswordSchema,
  validateEmailSchema,
};
