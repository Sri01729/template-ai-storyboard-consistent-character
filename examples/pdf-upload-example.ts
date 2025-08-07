import { mastra } from '../src/mastra/index.js';
import { createPDFUploadRuntimeContext } from '../src/mastra/agents/pdf-upload-agent.js';

/**
 * Example: Generate a storyboard and upload the PDF to cloud storage
 */
async function exampleStoryboardToCloud() {
  console.log('🎬 Starting storyboard generation and cloud upload...\n');

  try {
    // Use the integrated workflow
    const result = await mastra.getWorkflow('storyboardToCloudWorkflow').createRun().start({
      inputData: {
        storyIdea: "A brave knight rescues a princess from a dragon in a magical forest",
        style: "Ghibli-esque",
        title: "The Dragon's Forest",
        numberOfImages: 4,
        desiredFilename: "knight-rescue-storyboard.pdf",
        s3Bucket: process.env.S3_BUCKET || "my-storyboards",
        zapierWebhookUrl: process.env.ZAPIER_WEBHOOK_URL,
      },
    });

    if (result.result.success) {
      console.log('✅ Workflow completed successfully!');
      console.log(`📄 Local PDF: ${result.result.pdfPath}`);
      console.log(`☁️ S3 URL: ${result.result.s3Url}`);
      console.log(`📁 Google Drive: ${result.result.googleDriveUrl}`);
    } else {
      console.error('❌ Workflow failed:', result.result.error);
    }

  } catch (error) {
    console.error('❌ Error running workflow:', error);
  }
}

/**
 * Example: Upload an existing PDF file to cloud storage with MCP integration
 */
async function exampleUploadExistingPdf() {
  console.log('📤 Starting PDF upload to cloud storage with MCP integration...\n');

  try {
    // Create MCP client and runtime context
    const { runtimeContext, mcpClient } = await createPDFUploadRuntimeContext();

    try {
      // Use the PDF upload agent with runtime context
      const pdfUploadAgent = mastra.getAgent('pdfUploadAgent');

      const result = await pdfUploadAgent.generate([
        {
          role: 'user',
          content: 'Upload the PDF file at "generated-exports/storyboard.pdf" to cloud storage with filename "my-storyboard.pdf"',
        },
      ], {
        runtimeContext, // Pass the runtime context with MCP toolsets
      });

      console.log('📤 Upload result:', result.text);
    } finally {
      // Always disconnect the MCP client
      await mcpClient.disconnect();
    }

  } catch (error) {
    console.error('❌ Error uploading PDF:', error);
  }
}

/**
 * Example: Using the PDF upload tool directly with MCP integration
 */
async function exampleDirectToolUsage() {
  console.log('🔧 Using PDF upload tool directly with MCP integration...\n');

  try {
    // Create MCP client and runtime context
    const { runtimeContext, mcpClient } = await createPDFUploadRuntimeContext();

    try {
      // Use the PDF upload tool directly
      const pdfUploadTool = mastra.getTool('pdfUpload');

      const result = await pdfUploadTool.execute({
        context: {
          filePath: "generated-exports/storyboard.pdf",
          desiredFilename: "my-storyboard.pdf",
          s3Bucket: process.env.S3_BUCKET || "my-storyboards",
        },
        runtimeContext,
      });

      if (result.success) {
        console.log('✅ PDF uploaded successfully!');
        console.log(`📄 S3 URL: ${result.s3Url}`);
        console.log(`📁 Google Drive URL: ${result.googleDriveUrl}`);
      } else {
        console.error('❌ Upload failed:', result.error);
      }
    } finally {
      await mcpClient.disconnect();
    }
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

/**
 * Example: Use the convenience function
 */
async function exampleConvenienceFunction() {
  console.log('🚀 Using convenience function for storyboard to cloud...\n');

  try {
    const { generateAndUploadStoryboard } = await import('../src/mastra/index.js');

    const result = await generateAndUploadStoryboard({
      storyIdea: "A magical cat helps a young girl find her lost toy",
      style: "Disney-esque",
      title: "The Magical Cat",
      numberOfImages: 3,
      desiredFilename: "magical-cat-storyboard.pdf",
    });

    if (result.success) {
      console.log('✅ Successfully generated and uploaded storyboard!');
      console.log(`📄 Local PDF: ${result.pdfPath}`);
      console.log(`☁️ S3 URL: ${result.s3Url}`);
      console.log(`📁 Google Drive: ${result.googleDriveUrl}`);
    } else {
      console.error('❌ Failed:', result.error);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run examples
async function runExamples() {
  console.log('=== PDF Upload Examples ===\n');

  // Example 1: Full workflow
  await exampleStoryboardToCloud();
  console.log('\n' + '='.repeat(50) + '\n');

  // Example 2: Upload existing PDF with MCP
  await exampleUploadExistingPdf();
  console.log('\n' + '='.repeat(50) + '\n');

  // Example 3: Direct tool usage with MCP
  await exampleDirectToolUsage();
  console.log('\n' + '='.repeat(50) + '\n');

  // Example 4: Convenience function
  await exampleConvenienceFunction();
}

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runExamples().catch(console.error);
}

export {
  exampleStoryboardToCloud,
  exampleUploadExistingPdf,
  exampleDirectToolUsage,
  exampleConvenienceFunction,
};