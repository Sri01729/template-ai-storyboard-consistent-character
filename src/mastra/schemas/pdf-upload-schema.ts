import { z } from "zod";

// Schema for PDF upload input
export const pdfUploadInputSchema = z.object({
  filePath: z.string().min(1, "File path is required"),
  desiredFilename: z.string().optional(),
  s3Bucket: z.string().optional(),
  zapierWebhookUrl: z.string().optional(),
  metadata: z.record(z.string()).optional(),
});

// Schema for PDF upload result
export const pdfUploadResultSchema = z.object({
  success: z.boolean(),
  s3Url: z.string().url().optional(),
  googleDriveUrl: z.string().url().optional(),
  error: z.string().optional(),
  filename: z.string(),
  fileSize: z.number().positive().optional(),
  uploadTimestamp: z.string().datetime().optional(),
  metadata: z.record(z.string()).optional(),
});

// Schema for S3 upload configuration
export const s3ConfigSchema = z.object({
  bucket: z.string().min(1, "S3 bucket name is required"),
  region: z.string().optional(),
  accessKeyId: z.string().optional(),
  secretAccessKey: z.string().optional(),
});

// Schema for Zapier configuration
export const zapierConfigSchema = z.object({
  webhookUrl: z.string().url("Valid Zapier webhook URL is required"),
  apiKey: z.string().optional(),
});

// Schema for complete upload workflow configuration
export const uploadWorkflowConfigSchema = z.object({
  s3: s3ConfigSchema,
  zapier: zapierConfigSchema,
  retryAttempts: z.number().min(1).max(5).default(3),
  timeoutMs: z.number().min(5000).max(300000).default(60000),
});

// Type exports
export type PdfUploadInput = z.infer<typeof pdfUploadInputSchema>;
export type PdfUploadResult = z.infer<typeof pdfUploadResultSchema>;
export type S3Config = z.infer<typeof s3ConfigSchema>;
export type ZapierConfig = z.infer<typeof zapierConfigSchema>;
export type UploadWorkflowConfig = z.infer<typeof uploadWorkflowConfigSchema>;