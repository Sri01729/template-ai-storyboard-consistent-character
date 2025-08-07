import { createWorkflow, createStep } from "@mastra/core/workflows";
import { RuntimeContext } from "@mastra/core/runtime-context";
import { z } from "zod";
import { pdfUploadResultSchema } from "../schemas/pdf-upload-schema.js";
import { pdfUploadTool } from "../tools/pdf-upload-tool.js";

// Step 1: Generate storyboard and PDF
const generateStoryboardStep = createStep({
  id: "generate-storyboard",
  description: "Generate a complete storyboard from a story idea and export to PDF",
  inputSchema: z.object({
    storyIdea: z.string().describe("The story idea to convert into a storyboard"),
    style: z.string().optional().describe("Visual style for the storyboard"),
    title: z.string().optional().describe("Title for the storyboard"),
    numberOfImages: z.number().optional().describe("Number of images to generate"),
    desiredFilename: z.string().optional().describe("Desired filename for the uploaded PDF"),
    s3Bucket: z.string().optional().describe("S3 bucket name"),
    zapierWebhookUrl: z.string().optional().describe("Zapier webhook URL"),
  }),
  outputSchema: z.object({
    pdfPath: z.string().describe("Path to the generated PDF file"),
    storyboardData: z.any().describe("Complete storyboard data"),
    success: z.boolean().describe("Whether storyboard generation was successful"),
  }),
  execute: async ({ inputData, mastra }) => {
    try {
      // Use the existing automated workflow to generate the storyboard
      const workflow = mastra.getWorkflow("automatedAgentNetworkWorkflow");
      const run = await workflow.createRunAsync();
      const result = await run.start({
        inputData: {
          storyIdea: inputData.storyIdea,
          style: inputData.style || "Ghibli-esque",
          title: inputData.title || "Generated Storyboard",
          genre: "general",
          tone: "neutral",
        },
      });

      if (result.status === 'success') {
        return {
          pdfPath: result.result.pdfPath,
          storyboardData: result.result,
          success: true,
        };
      } else {
        throw new Error(`Workflow failed with status: ${result.status}`);
      }
    } catch (error) {
      console.error("Storyboard generation failed:", error);
      return {
        pdfPath: "",
        storyboardData: null,
        success: false,
      };
    }
  },
});

// Step 2: Upload PDF to cloud storage
const uploadPdfStep = createStep({
  id: "upload-pdf",
  description: "Upload the generated PDF to S3 and then to Google Drive via Zapier",
  inputSchema: z.object({
    pdfPath: z.string().describe("Path to the PDF file to upload"),
    storyboardData: z.any().describe("Complete storyboard data"),
    success: z.boolean().describe("Whether storyboard generation was successful"),
    desiredFilename: z.string().optional().describe("Desired filename for the uploaded file"),
    s3Bucket: z.string().optional().describe("S3 bucket name"),
    zapierWebhookUrl: z.string().optional().describe("Zapier webhook URL"),
  }),
  outputSchema: pdfUploadResultSchema,
  execute: async ({ inputData, mastra }) => {
    try {
      // Check if storyboard generation was successful
      if (!inputData.success) {
        return {
          success: false,
          error: "Storyboard generation failed, cannot upload PDF",
          filename: inputData.desiredFilename || "storyboard.pdf",
        };
      }

      // Use the PDF upload tool directly
      const result = await pdfUploadTool.execute({
        context: {
          filePath: inputData.pdfPath,
          desiredFilename: inputData.desiredFilename,
          s3Bucket: inputData.s3Bucket,
        },
        runtimeContext: new RuntimeContext(),
      });

      return result;
    } catch (error) {
      console.error("PDF upload failed:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown upload error",
        filename: inputData.desiredFilename || "storyboard.pdf",
      };
    }
  },
});

// Complete workflow: Storyboard to Cloud
export const storyboardToCloudWorkflow = createWorkflow({
  id: "storyboard-to-cloud",
  description: "Generate a storyboard from an idea and upload the PDF to cloud storage",
  inputSchema: z.object({
    storyIdea: z.string().describe("The story idea to convert into a storyboard"),
    style: z.string().optional().describe("Visual style for the storyboard"),
    title: z.string().optional().describe("Title for the storyboard"),
    numberOfImages: z.number().optional().describe("Number of images to generate"),
    desiredFilename: z.string().optional().describe("Desired filename for the uploaded PDF"),
    s3Bucket: z.string().optional().describe("S3 bucket name"),
    zapierWebhookUrl: z.string().optional().describe("Zapier webhook URL"),
  }),
  outputSchema: z.object({
    success: z.boolean().describe("Whether the entire workflow was successful"),
    storyboardData: z.any().optional().describe("Complete storyboard data"),
    pdfPath: z.string().optional().describe("Local path to the generated PDF"),
    s3Url: z.string().optional().describe("S3 URL of the uploaded PDF"),
    googleDriveUrl: z.string().optional().describe("Google Drive URL of the uploaded PDF"),
    error: z.string().optional().describe("Error message if workflow failed"),
  }),
  steps: [generateStoryboardStep, uploadPdfStep],
})
  .then(generateStoryboardStep)
  .then(uploadPdfStep)
  .commit();

// Convenience function for direct usage
export const generateAndUploadStoryboard = async (input: {
  storyIdea: string;
  style?: string;
  title?: string;
  numberOfImages?: number;
  desiredFilename?: string;
  s3Bucket?: string;
  zapierWebhookUrl?: string;
}) => {
  const workflow = storyboardToCloudWorkflow;
  const run = await workflow.createRunAsync();
  const result = await run.start({ inputData: input });

  if (result.status === 'success') {
    return result.result;
  } else {
    throw new Error(`Workflow failed with status: ${result.status}`);
  }
};