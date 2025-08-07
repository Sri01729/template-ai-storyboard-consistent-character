import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { readFileSync, existsSync } from "fs";
import path from "path";
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Schema for the upload result
const uploadResultSchema = z.object({
  success: z.boolean(),
  s3Url: z.string().optional(),
  googleDriveUrl: z.string().optional(),
  error: z.string().optional(),
  filename: z.string(),
  fileSize: z.number().optional(),
  uploadTimestamp: z.string().optional(),
  metadata: z.record(z.string()).optional(),
});

export const pdfUploadTool = createTool({
  id: "pdf-upload-workflow",
  description: "Uploads a local PDF file to S3 and then transfers it to Google Drive via Zapier webhook using direct AWS SDK.",
  inputSchema: z.object({
    filePath: z.string().describe("Path to the local PDF file to upload"),
    desiredFilename: z.string().optional().describe("Desired filename for the uploaded file"),
    s3Bucket: z.string().optional().describe("S3 bucket name (defaults to environment variable)"),
  }),
  outputSchema: uploadResultSchema,
  execute: async ({ context } ) => {
    const { filePath, desiredFilename, s3Bucket } = context;

    try {
      // Step 1: Validate local PDF file
      // Use the same path resolution as other tools - go up from src/mastra/tools to project root
      // process.cwd() might be .mastra/output, so we need to go up to the actual project root
      let projectRoot = path.resolve(process.cwd());

      // If we're in .mastra/output, go up to the actual project root
      if (projectRoot.includes('.mastra/output')) {
        projectRoot = path.resolve(projectRoot, '../..');
      }

      console.log(`🔍 [PDF Upload Tool] Resolved project root: ${projectRoot}`);
      let fullPath;

      console.log(`🔍 [PDF Upload Tool] Input filePath: ${filePath}`);
      console.log(`🔍 [PDF Upload Tool] Project root: ${projectRoot}`);

      // Handle different path formats like we do for images
      if (filePath.startsWith('.mastra/')) {
        // Handle legacy .mastra paths
        fullPath = path.resolve(projectRoot, filePath);
        console.log(`🔍 [PDF Upload Tool] Resolved .mastra path: ${fullPath}`);
      } else if (filePath.startsWith('generated-exports/')) {
        // Handle generated-exports paths - this is what the PDF export tool returns
        fullPath = path.resolve(projectRoot, filePath);
        console.log(`🔍 [PDF Upload Tool] Resolved generated-exports path: ${fullPath}`);
      } else {
        // Handle relative paths by assuming they're in generated-exports
        fullPath = path.resolve(projectRoot, 'generated-exports', filePath);
        console.log(`🔍 [PDF Upload Tool] Resolved relative path to generated-exports: ${fullPath}`);
      }

      console.log(`🔍 [PDF Upload Tool] Checking if PDF exists: ${fullPath}`);
      const pdfExists = existsSync(fullPath);
      console.log(`🔍 [PDF Upload Tool] PDF exists: ${pdfExists}`);

      if (!pdfExists) {
        return {
          success: false,
          error: `PDF file not found at path: ${fullPath}`,
          filename: desiredFilename || "unknown",
        };
      }

      const fileBuffer = readFileSync(fullPath);
      const fileSize = fileBuffer.length;

      // Handle filename properly to avoid duplicate extensions
      let filename;
      if (desiredFilename) {
        // If desiredFilename already has .pdf extension, use it as is
        if (desiredFilename.toLowerCase().endsWith('.pdf')) {
          filename = desiredFilename;
        } else {
          // If no .pdf extension, add it
          filename = desiredFilename + '.pdf';
        }
      } else {
        // Use original filename from path
        filename = filePath.split('/').pop() || 'uploaded-file.pdf';
      }

      console.log(`📁 Validated PDF file: ${filename} (${fileSize} bytes)`);

      // Step 2: Create S3 client
      const bucketName = s3Bucket || process.env.S3_BUCKET;
      if (!bucketName) {
        return {
          success: false,
          error: "S3_BUCKET environment variable is required",
          filename,
          fileSize,
        };
      }

      const s3Client = new S3Client({
        region: process.env.AWS_REGION || "us-east-1",
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
        },
      });

      console.log(`☁️ S3 client created for bucket: ${bucketName}`);

      // Step 3: Upload to S3 using AWS SDK
      console.log("☁️ Uploading to S3...");

      const uploadCommand = new PutObjectCommand({
        Bucket: bucketName,
        Key: filename,
        Body: fileBuffer,
        ContentType: 'application/pdf',
        Metadata: {
          'source': 'ai-storyboard-generator',
          'upload-timestamp': new Date().toISOString(),
        },
      });

      const uploadResult = await s3Client.send(uploadCommand);
      console.log(`✅ S3 upload successful for key: ${filename}`);
      console.log(`📊 ETag: ${uploadResult.ETag}`);

      // Step 4: Generate presigned URL for the uploaded file
      console.log("🔗 Generating presigned URL...");

      const getCommand = new GetObjectCommand({
        Bucket: bucketName,
        Key: filename,
      });

      const s3Url = await getSignedUrl(s3Client, getCommand, { expiresIn: 3600 });
      console.log(`✅ Presigned URL generated: ${s3Url}`);

      // Step 5: Send to Zapier webhook for Google Drive upload
      console.log("📤 Sending to Zapier webhook for Google Drive upload...");

      const zapierWebhookUrl = process.env.ZAPIER_WEBHOOK_URL;
      if (!zapierWebhookUrl) {
        console.log("⚠️ ZAPIER_WEBHOOK_URL not set, skipping Zapier integration");
        return {
          success: true,
          s3Url,
          filename,
          fileSize,
          uploadTimestamp: new Date().toISOString(),
          metadata: {
            zapierStatus: "skipped",
            reason: "ZAPIER_WEBHOOK_URL not configured",
            zapierAttempt: "none",
          } as Record<string, string>,
        };
      }

      // Clean filename for Zapier - remove any file extension and trailing dots
      const zapierFilename = filename.replace(/\.[^/.]+$/, '').replace(/\.+$/, '');

      const zapierPayload = {
        fileUrl: s3Url,
        filename: zapierFilename, // Send filename without .pdf extension
        uploadTimestamp: new Date().toISOString(),
        fileSize: fileSize,
        source: "ai-storyboard-generator",
        bucket: bucketName,
      };

      console.log(`📤 Sending payload to Zapier:`, JSON.stringify(zapierPayload, null, 2));

      const zapierResponse = await fetch(zapierWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'AI-Storyboard-Generator/1.0'
        },
        body: JSON.stringify(zapierPayload),
      });

      if (!zapierResponse.ok) {
        const errorText = await zapierResponse.text();
        throw new Error(`Zapier webhook failed with status ${zapierResponse.status}: ${errorText}`);
      }

      const zapierResult = await zapierResponse.json();
      console.log(`✅ Zapier webhook response:`, zapierResult);

      // Extract Google Drive URL from Zapier response (adjust based on your Zapier setup)
      const googleDriveUrl = zapierResult.googleDriveUrl || zapierResult.driveUrl || zapierResult.url;

      if (googleDriveUrl) {
        console.log(`✅ Google Drive upload successful: ${googleDriveUrl}`);
      } else {
        console.log(`⚠️ No Google Drive URL in Zapier response, but webhook was successful`);
      }

      return {
        success: true,
        s3Url,
        googleDriveUrl,
        filename,
        fileSize,
        uploadTimestamp: zapierPayload.uploadTimestamp,
        metadata: {
          zapierStatus: String(zapierResult.status || "unknown"),
          zapierAttempt: String(zapierResult.attempt || "unknown"),
        } as Record<string, string>,
      };

    } catch (error) {
      console.error("❌ PDF upload workflow failed:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
        filename: desiredFilename || "unknown",
      };
    }
  },
});