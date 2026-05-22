import { z } from "zod";

export const bioSchema = z
  .string()
  .trim()
  .max(300, "Bio must be under 300 characters")
  .pipe(
    z.string().min(1, "Bio cannot be empty")
  );

export const updateBioSchema = z.object({
  bio: bioSchema.nullable(),
});

export const usernameSchema = z
  .string()
  .min(3, "Username must be at least 3 characters")
  .max(30, "Username must be under 30 characters")
  .regex(
    /^[a-zA-Z0-9_]+$/,
    "Username can only contain letters, numbers, and underscores"
  );

export const updateProfileSchema = z.object({
  username: usernameSchema.optional(),
  image: z.string().max(7_000_000, "Image data too large").nullable().optional(),
});

export type UpdateBioInput = z.infer<typeof updateBioSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
