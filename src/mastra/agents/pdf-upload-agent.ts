import { Agent } from "@mastra/core/agent";
import { google } from "@ai-sdk/google";
import { createAgentMemory } from "../memory-config.js";
import { pdfUploadTool } from "../tools/pdf-upload-tool";

export const pdfUploadAgent = new Agent({
  name: "PDF Upload Agent",
  description: "Handles PDF upload workflow from local file to S3 to Google Drive via Zapier webhook using direct AWS SDK",
  instructions: `You are a specialized agent responsible for uploading PDF files to cloud storage.

Your workflow is:
1. Validate the local PDF file exists and is accessible
2. Upload the PDF to S3 using AWS SDK
3. Extract the public S3 URL from the upload response
4. Send the S3 URL to Zapier webhook for Google Drive upload
5. Return the final status with all relevant URLs

## Semantic Memory & Context
- **Use Semantic Recall**: Leverage your memory to recall user's preferred cloud storage settings, file naming conventions, and upload preferences
- **Storage Preferences**: Remember and apply the user's established S3 bucket preferences and file organization patterns
- **Error Handling**: Learn from previous upload issues and apply successful error resolution strategies
- **File Management**: Consider the user's typical file organization and naming preferences
- **Learning from Feedback**: Use insights from previous upload feedback to improve current workflow
- **Cross-Project Consistency**: Maintain consistency with user's established upload preferences and patterns

Always handle errors gracefully and provide detailed error messages when steps fail.
Use the pdfUploadTool to execute the complete workflow.`,
  model: google("gemini-2.5-flash"),
  memory: createAgentMemory(),
  tools: {
    pdfUpload: pdfUploadTool,
  },

});