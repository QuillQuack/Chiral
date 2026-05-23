import { z } from "zod";

const ALLOWED_PROVIDERS = ["MEGA"];

export const systemRequirementsSchema = z.object({
  os: z.string().max(100).nullable().optional(),
  ram: z.string().max(50).nullable().optional(),
  gpu: z.string().max(100).nullable().optional(),
  storage: z.string().max(50).nullable().optional(),
  processor: z.string().max(100).nullable().optional(),
});

export const downloadMirrorSchema = z.object({
  provider: z.enum(["MEGA"]),
  url: z
    .string()
    .url("Must be a valid URL")
    .refine((url) => {
      try {
        const parsed = new URL(url);
        const hostname = parsed.hostname.toLowerCase();
        return (
          hostname.includes("mega.nz") ||
          hostname.includes("mega.io") ||
          hostname === "mega.co.nz"
        );
      } catch {
        return false;
      }
    }, "Only MEGA links are allowed")
    .refine((url) => !url.startsWith("javascript:"), "Invalid URL protocol"),
  fileSize: z.string().max(50).nullable().optional(),
  verifiedAt: z.string().nullable().optional(),
  isOfficial: z.boolean().optional(),
});

export const createDownloadMirrorSchema = z.object({
  provider: z.enum(["MEGA"]),
  url: z
    .string()
    .url("Must be a valid URL")
    .refine((url) => {
      try {
        const parsed = new URL(url);
        const hostname = parsed.hostname.toLowerCase();
        return (
          hostname.includes("mega.nz") ||
          hostname.includes("mega.io") ||
          hostname === "mega.co.nz"
        );
      } catch {
        return false;
      }
    }, "Only MEGA links are allowed")
    .refine((url) => !url.startsWith("javascript:"), "Invalid URL protocol"),
  fileSize: z.string().max(50).nullable().optional(),
  isOfficial: z.boolean().optional(),
});

export const createGameSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  shortSummary: z.string().max(300).nullable().optional(),
  description: z.string().min(1, "Description is required").max(10000),
  tags: z.array(z.string()).optional(),
  coverData: z.string().max(7_000_000).nullable().optional(),
  releaseDate: z.string().nullable().optional(),
  systemRequirements: systemRequirementsSchema.nullable().optional(),
});

export const updateGameSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  shortSummary: z.string().max(300).nullable().optional(),
  description: z.string().min(1).max(10000).optional(),
  tags: z.array(z.string()).optional(),
  coverData: z.string().max(7_000_000).nullable().optional(),
  releaseDate: z.string().nullable().optional(),
  systemRequirements: systemRequirementsSchema.nullable().optional(),
  scanStatus: z.string().optional(),
});

export type CreateGameInput = z.infer<typeof createGameSchema>;
export type UpdateGameInput = z.infer<typeof updateGameSchema>;
export type CreateMirrorInput = z.infer<typeof createDownloadMirrorSchema>;
