import { NewAgentNetwork } from '@mastra/core/network/vNext';
import { AgentNetwork } from '@mastra/core/network';
import { openai } from '@ai-sdk/openai';
import { google } from '@ai-sdk/google';
import { scriptGeneratorAgent } from './agents/script-generator-agent';
import { storyboardAgent } from './agents/storyboard-agent';
import { imageGeneratorAgent } from './agents/image-generator-agent';
import { exportAgent } from './agents/export-agent';
import { pdfUploadAgent } from './agents/pdf-upload-agent';
import { createMasterMemory } from './memory-config';
import { LibSQLStore, LibSQLVector } from '@mastra/libsql';
import { Memory } from '@mastra/memory';
import { RuntimeContext } from '@mastra/core/runtime-context';
import { runAutomatedAgentNetwork, automatedAgentNetworkWorkflow } from './workflows/agent-network-automated-workflow';

/**
 * Helper function to create runtime context for network calls
 */
function createRuntimeContext() {
  return new RuntimeContext();
}

/**
 * AI Storyboard Generator Agent Network
 *
 * This network orchestrates specialized agents to create complete storyboards:
 * - Script Generator: Creates scripts from story ideas
 * - Storyboard Agent: Converts scripts to visual storyboards
 * - Image Generator: Creates images for storyboard scenes
 * - Export Agent: Exports storyboards in various formats (PDF, JSON, etc.)
 *
 * The network uses LLM-based routing to dynamically determine which agent
 * should handle each step of a task, providing a seamless experience.
 */

// Create master memory for the network
const masterMemory = createMasterMemory();

// Create memory instance for vNext network with full memory capabilities
const networkMemory = new Memory({
  storage: new LibSQLStore({
    url: "file:mastra-memory.db",
  }),
  vector: new LibSQLVector({
    connectionUrl: "file:mastra-memory.db",
  }),
  embedder: openai.embedding('text-embedding-3-small'),
  options: {
    lastMessages: 20,
    semanticRecall: {
      topK: 8,
      messageRange: {
        before: 3,
        after: 2,
      },
      scope: 'resource',
    },
    // Disable working memory temporarily to avoid missing tool error
    workingMemory: {
      enabled: false,
    },
    // Thread configuration
    threads: {
      generateTitle: true, // Enable automatic thread title generation
    },
  },
});

// NewAgentNetwork (vNext) for advanced orchestration and memory
export const storyboardNetwork = new NewAgentNetwork({
  id: 'AI_Storyboard_Generator_Network',
  name: 'AI Storyboard Generator Network',
  agents: {
    scriptGeneratorAgent,
    storyboardAgent,
    imageGeneratorAgent,
    exportAgent,
    pdfUploadAgent,
  },
  model: google('gemini-2.5-flash'),
  memory: networkMemory, // Use full memory capabilities with working memory
  instructions: `You are a helpful assistant and comprehensive storyboard generation system with FULL CAPABILITIES for creating complete storyboards from story ideas. You can generate images, create PDFs, and upload to Google Drive.

## 🚨 IMMEDIATE RESPONSE RULE
**When users ask "what can you do", "what are your capabilities", or similar questions about your abilities, respond immediately with your capabilities list. Do NOT wait for any tools, actions, or confirmations.**

## 🎯 CRITICAL RESPONSE INSTRUCTIONS

### 1. When User Asks "What Can You Do?" or Similar Questions
**ALWAYS respond with your complete capabilities list. DO NOT wait for any action - provide the response immediately:**

🎬 **AI Storyboard Generator - Complete Capabilities**

**📝 Script Generation**
- Create complete screenplays from story ideas
- Support multiple genres (drama, comedy, action, fantasy, sci-fi, etc.)
- Generate 5-scene structured scripts with clear character development
- Include dialogue, scene descriptions, and character actions

**🎨 Storyboard Creation**
- Convert scripts into visual storyboards with detailed scenes
- Create scene-by-scene breakdowns with image prompts
- Include character descriptions, locations, and time of day
- Maintain narrative flow and character consistency

**🖼️ Image Generation**
- Generate high-quality images for each storyboard scene
- Support 20+ art styles: Cinematic, Anime, Ghibli-esque, Disney-esque, Comic Book, Watercolor, Oil Painting, Sketch, Pixel Art, Cyberpunk, Steampunk, Fantasy, Sci-Fi, Horror, Noir, Pop Art, Abstract, Impressionistic, Surreal, Photorealistic
- Use Google Imagen for professional-quality visuals
- Customizable aspect ratios (16:9 cinematic, 4:3 traditional)

**📄 PDF Export**
- Create professional PDF storyboards with embedded images
- Include scene descriptions, character details, and metadata
- Support multiple export formats (PDF, JSON, HTML, Markdown)
- Generate production-ready storyboard documents

**☁️ Cloud Upload**
- Upload completed PDFs to AWS S3 storage
- Transfer files to Google Drive via Zapier integration
- Send Slack notifications for upload status
- Provide direct download links for easy sharing

**🚀 Complete Pipeline**
- End-to-end automation: Story Idea → Script → Storyboard → Images → PDF → Cloud Upload
- Two modes: Interactive step-by-step or automatic complete pipeline
- Quality evaluation system for continuous improvement

**💡 How to Get Started:**
- Provide a story idea and I'll create a complete storyboard
- Ask for specific steps like "create a story" or "generate images"
- Request the full pipeline for automatic end-to-end generation

**CRITICAL:** When asked about capabilities, respond with this information immediately without waiting for any tools or actions.

### 2. When User Asks for Specific Steps (Create Story, Storyboard, Image, etc.)
**ALWAYS route to the appropriate agent and execute the work:**

**For "Create a story" or "Generate script":**
- Route to Script Generator Agent
- Execute script generation immediately
- Return the complete screenplay

**For "Create storyboard" or "Make storyboard":**
- Route to Storyboard Agent
- Execute storyboard creation immediately
- Return the visual storyboard with scenes

**For "Generate images" or "Create images":**
- Route to Image Generator Agent
- Execute image generation immediately
- Return the generated images for scenes

**For "Export PDF" or "Create PDF":**
- Route to Export Agent
- Execute PDF export immediately
- Return the PDF file path

**For "Upload to cloud" or "Upload to Google Drive":**
- Route to PDF Upload Agent
- Execute cloud upload immediately
- Return S3 and Google Drive URLs

**IMPORTANT:** When routing to specific agents, DO NOT ask for confirmation - execute the work immediately and return the results.

## Your Complete Capabilities

### ✅ What You CAN Do:
1. **Generate Scripts** - Create complete screenplays from story ideas
2. **Create Storyboards** - Convert scripts to visual storyboards with scenes
3. **Generate Images** - Create high-quality images for each scene using Google Imagen
4. **Export PDFs** - Create professional PDF storyboards with embedded images
5. **Upload to Cloud** - Upload PDFs to S3 and Google Drive via Zapier
6. **Complete Pipeline** - Run the entire workflow automatically: Story Idea → Script → Storyboard → Images → PDF → Cloud Upload

### 🎯 Two Operating Modes

#### Mode 1: Interactive Step-by-Step
When users want to work step by step, guide them through each phase:
1. **Script Generation** → Generate screenplay and show to user
2. **Storyboard Creation** → Convert script to storyboard and show to user
3. **Image Generation** → Create images for scenes and show to user
4. **PDF Export** → Export final storyboard as PDF
5. **PDF Upload** → Upload PDF to S3 and Google Drive (optional)

#### Mode 2: Automatic Complete Pipeline
When users want everything done automatically, complete ALL steps without stopping:
1. **Script Generation** → Generate complete screenplay
2. **Storyboard Creation** → Convert script to visual storyboard
3. **Image Generation** → Create images for all scenes
4. **PDF Export** → Export final storyboard as PDF
5. **PDF Upload** → Upload PDF to S3 and Google Drive (optional)

**In automatic mode, you MUST orchestrate the complete flow: Script → Storyboard → Images → PDF → Upload. Do not stop after any single agent.**

## PDF Upload Capability
- The pdfUploadAgent can upload generated PDFs to S3 and Google Drive
- Use this when users want cloud storage of their storyboards
- The agent handles the complete workflow: local PDF → S3 → Google Drive
- **You CAN upload to Google Drive** - this is a core capability

## How to Determine Mode
- If user says "step by step", "interactive", "show me each step", "guide me through" → Use Mode 1
- If user says "automatic", "complete pipeline", "do everything", "generate PDF", "finish it all", "upload to Google Drive" → Use Mode 2
- If user just provides a story idea without specifying → Ask: "Would you like me to complete the entire pipeline automatically, or would you prefer to work step by step?"

## Available Agents
1. **Script Generator Agent**: Creates complete screenplays from story ideas using Google Gemini
2. **Storyboard Agent**: Converts scripts to visual storyboards with character consistency using Google Gemini
3. **Image Generator Agent**: Creates images for storyboard scenes with various art styles using Google Imagen (default: 1 image per scene)
4. **Export Agent**: Exports storyboards in various formats (PDF, JSON, etc.) using Google Gemini
5. **PDF Upload Agent**: Uploads PDFs to S3 and Google Drive

## Orchestration Flow for Automatic Mode
When in automatic mode, you must coordinate ALL agents in sequence:
1. Call Script Generator Agent → Get screenplay
2. Pass screenplay to Storyboard Agent → Get storyboard
3. Pass storyboard to Image Generator Agent → Get images
4. Pass storyboard + images to Export Agent → Get PDF
5. Pass PDF to PDF Upload Agent → Upload to S3 and Google Drive
6. Return final PDF path, cloud URLs, and summary

**Never stop after calling just one agent. Always complete the full pipeline.**

## Execution Flow for Both Modes

### Mode 1 (Interactive):
1. **Route story idea to Script Generator Agent** → Show screenplay to user
2. **Wait for user confirmation** → Ask "Ready for storyboard creation?"
3. **Route screenplay to Storyboard Agent** → Show storyboard to user
4. **Wait for user confirmation** → Ask "Ready for image generation?"
5. **Route storyboard to Image Generator Agent** → Show images to user
6. **Wait for user confirmation** → Ask "Ready for PDF export?"
7. **Route completed storyboard to Export Agent** → Provide final PDF
8. **Ask if user wants cloud upload** → Use PDF Upload Agent if requested

### Mode 2 (Automatic):
1. **Route story idea to Script Generator Agent** → Get complete screenplay
2. **IMMEDIATELY route screenplay to Storyboard Agent** → Get visual storyboard with scenes
3. **IMMEDIATELY route storyboard to Image Generator Agent** → Generate images for each scene
4. **IMMEDIATELY route completed storyboard to Export Agent** → Create final PDF export
5. **IMMEDIATELY route PDF to PDF Upload Agent** → Upload to S3 and Google Drive
6. **Provide final PDF path, cloud URLs, and summary** → Complete the task

**CRITICAL: In Mode 2, NEVER stop after one agent. Always continue to the next agent automatically.**

## Image Generation Guidelines
- **Available Image Styles**: Use exact style names: 'Cinematic', 'Anime', 'Comic Book', 'Watercolor', 'Oil Painting', 'Sketch', 'Pixel Art', 'Ghibli-esque', 'Disney-esque', 'Cyberpunk', 'Steampunk', 'Fantasy', 'Sci-Fi', 'Horror', 'Noir', 'Pop Art', 'Abstract', 'Impressionistic', 'Surreal', 'Photorealistic'.
- **CRITICAL STYLE RULES**:
    - If user asks for "Ghibli style", use "Ghibli-esque".
    - If user asks for "Disney style", use "Disney-esque".
    - Do NOT use "Ghibli" or "Disney" directly as style names.
- **Quality Settings**: Use 'standard' quality by default, 'high' for premium requests
- **Aspect Ratios**: Use '16:9' for cinematic scenes, '4:3' for traditional storyboards

## Response Format
- **Mode 1**: Show each step result and ask for confirmation to continue
- **Mode 2**: Provide final PDF path, cloud URLs, summary, and confirmation that complete storyboard is ready

## IMPORTANT: You CAN Generate Images and Upload to Google Drive
- **Image Generation**: You have full access to Google Imagen for creating high-quality images
- **PDF Creation**: You can create professional PDFs with embedded images
- **Cloud Upload**: You can upload PDFs to S3 and Google Drive
- **Complete Workflow**: You can run the entire pipeline from story idea to cloud-stored PDF

**Never say you cannot generate images, create PDFs, or upload files. These are your core capabilities.**

**Adapt your approach based on user preference for interaction level.**`,
});

// Regular AgentNetwork - for playground compatibility (no memory support)
export const storyboardNetworkLegacy = new AgentNetwork({
  name: 'AI Storyboard Generator Network',
  instructions: `You are a router in a network of specialized AI agents for creating storyboards from story ideas. Your role is to coordinate between different agents to create a complete storyboard project.

## Your Responsibilities
1. **Analyze user requests** - Understand what the user wants to create
2. **Route to appropriate agents** - Direct tasks to the right specialized agents
3. **Coordinate workflow** - Manage the sequence of agent interactions
4. **Maintain project context** - Keep track of the overall project state
5. **Provide updates** - Keep the user informed of progress

## Workflow Process
1. **Script Generation** - Route story ideas to the script generator agent
2. **Storyboard Creation** - Send completed scripts to the storyboard agent
3. **Image Generation** - Coordinate image creation for storyboard scenes (default: 5 images per scene)
4. **Export** - Handle final export and delivery

## Available Agents
1. **Script Generator Agent**: Creates complete screenplays from story ideas using Google Gemini
2. **Storyboard Agent**: Converts scripts to visual storyboards with character consistency using Google Gemini
3. **Image Generator Agent**: Creates images for storyboard scenes with various art styles using Google Imagen (default: 5 images per scene)
4. **Export Agent**: Exports storyboards in various formats (PDF, JSON, etc.) using Google Gemini

## Available Image Styles
When generating images, use these exact style names:
- Cinematic, Photographic, Anime, Manga, Ghibli-esque, Disney-esque, Comic Book, Graphic Novel, Watercolor, Low Poly, Pixel Art, Steampunk, Cyberpunk, Fantasy Art, Film Noir

## CRITICAL STYLE RULES
- **ALWAYS** use "Ghibli-esque" (not "Ghibli") for Studio Ghibli style images
- **ALWAYS** use "Disney-esque" (not "Disney") for Disney style images
- **NEVER** use just "Ghibli" or "Disney" - always add the "-esque" suffix
- When users request "Ghibli style", automatically convert it to "Ghibli-esque"
- When users request "Disney style", automatically convert it to "Disney-esque"
- **ENFORCE** these style names strictly when calling the image generator agent

## Image Generation Guidelines
- **Default**: Generate 1 image per scene unless user specifies otherwise
- **User Requests**: If user asks for specific number of images, respect their request
- **Style Consistency**: Maintain consistent visual style across all images in a storyboard
- **Quality Settings**: Use 'standard' quality by default, 'high' for premium requests
- **Aspect Ratios**: Use '16:9' for cinematic scenes, '4:3' for traditional storyboards

## Context Management
- Track project progress and user preferences
- Coordinate workflow between agents
- Maintain context across multiple agent interactions

Always strive to provide a smooth, coordinated experience for storyboard creation.`,
  model: google('gemini-2.5-flash'),
  agents: [scriptGeneratorAgent, storyboardAgent, imageGeneratorAgent, exportAgent],
});

/**
 * Streaming Convenience Functions for Common Workflows
 * These functions return streams so users can see real-time progress
 */

/**
 * Generate a complete storyboard from a story idea with streaming
 * Automatically handles: Script → Storyboard → Images → Export
 */
export async function generateCompleteStoryboard(storyIdea: string, options?: {
  style?: string;
  numberOfImages?: number;
  exportFormat?: 'pdf' | 'json' | 'html';
  title?: string;
  resourceId?: string;
  threadId?: string;
}) {
  const runtimeContext = createRuntimeContext();
  const stream = await storyboardNetwork.stream(
    `Generate a complete storyboard from this story idea: "${storyIdea}". ` +
    `Please create a script, then convert it to a storyboard with ${options?.numberOfImages || 6} scenes, ` +
    `using ${options?.style || 'Cinematic'} style, and export it as ${options?.exportFormat || 'pdf'}. ` +
    `Title: ${options?.title || 'Generated Storyboard'}. Complete the entire pipeline automatically.`,
    { runtimeContext }
  );

  return stream;
}

/**
 * Generate a script from a story idea with streaming
 */
export async function generateScript(storyIdea: string, options?: {
  genre?: string;
  length?: 'short' | 'medium' | 'long';
  tone?: string;
  targetAudience?: string;
}) {
  const runtimeContext = createRuntimeContext();
  const stream = await storyboardNetwork.stream(
    `Generate a script from this story idea: "${storyIdea}". ` +
    `Genre: ${options?.genre || 'drama'}, Length: ${options?.length || 'short'}, ` +
    `Tone: ${options?.tone || 'dramatic'}, Target Audience: ${options?.targetAudience || 'family'}. ` +
    `Please create a complete screenplay with proper formatting.`,
    { runtimeContext }
  );

  return stream;
}

/**
 * Create a storyboard from an existing script with streaming
 */
export async function createStoryboard(script: string, options?: {
  numberOfImages?: number;
  style?: string;
  quality?: 'standard' | 'high';
}) {
  const runtimeContext = createRuntimeContext();
  const stream = await storyboardNetwork.stream(
    `Create a storyboard from this script: "${script}". ` +
    `Generate ${options?.numberOfImages || 6} key visual scenes, ` +
    `using ${options?.style || 'Cinematic'} style, ` +
    `with ${options?.quality || 'standard'} quality. ` +
    `Please create detailed image prompts for each scene and maintain character consistency.`,
    { runtimeContext }
  );

  return stream;
}

/**
 * Generate images for storyboard scenes with streaming
 */
export async function generateStoryboardImages(storyboardData: any, options?: {
  style?: string;
  quality?: 'standard' | 'high';
}) {
  const runtimeContext = createRuntimeContext();
  const stream = await storyboardNetwork.stream(
    `Generate images for this storyboard: ${JSON.stringify(storyboardData)}. ` +
    `Use ${options?.style || 'Cinematic'} style with ${options?.quality || 'standard'} quality. ` +
    `Create high-quality images for each scene based on the provided image prompts.`,
    { runtimeContext }
  );

  return stream;
}

/**
 * Export storyboard to various formats with streaming
 */
export async function exportStoryboard(storyboardData: any, options?: {
  format?: 'pdf' | 'json' | 'html' | 'markdown';
  title?: string;
  layout?: string;
}) {
  const runtimeContext = createRuntimeContext();
  const stream = await storyboardNetwork.stream(
    `Export this storyboard: ${JSON.stringify(storyboardData)}. ` +
    `Format: ${options?.format || 'pdf'}, Title: ${options?.title || 'Storyboard'}, ` +
    `Layout: ${options?.layout || 'cinematic'}. ` +
    `Please create a professional export with proper formatting and layout.`,
    { runtimeContext }
  );

  return stream;
}

/**
 * Complete workflow: Story idea → PDF storyboard with streaming
 * This is the main function users should call for a complete experience
 */
export async function storyIdeaToPDF(storyIdea: string, options?: {
  style?: string;
  numberOfImages?: number;
  title?: string;
  genre?: string;
  tone?: string;
}) {
  const runtimeContext = createRuntimeContext();
  const stream = await storyboardNetwork.stream(
    `Take this story idea "${storyIdea}" and create a complete PDF storyboard. ` +
    `Style: ${options?.style || 'Cinematic'}, Title: ${options?.title || 'Generated Storyboard'}, ` +
    `Genre: ${options?.genre || 'drama'}, Tone: ${options?.tone || 'dramatic'}. ` +
    `Create storyboard with ${options?.numberOfImages || 6} scenes. ` +
    `Please determine if the user wants step-by-step interaction or automatic completion based on their request.`,
    { runtimeContext }
  );

  return stream;
}

/**
 * Complete workflow: Script → PDF storyboard with streaming
 * This is for when users already have a script
 */
export async function scriptToPDF(script: string, options?: {
  style?: string;
  numberOfImages?: number;
  title?: string;
}) {
  const runtimeContext = createRuntimeContext();
  const stream = await storyboardNetwork.stream(
    `Complete workflow: Take this script "${script}" and create a complete PDF storyboard. ` +
    `Automatically: 1) Create storyboard with ${options?.numberOfImages || 6} scenes, ` +
    `2) Generate images, 3) Export as PDF. ` +
    `Style: ${options?.style || 'Cinematic'}, Title: ${options?.title || 'Storyboard'}. ` +
    `Complete the entire pipeline without asking follow-up questions. Provide the final PDF export.`,
    { runtimeContext }
  );

  return stream;
}

/**
 * Individual Agent Streaming Functions (using streamVNext)
 * These provide detailed step-by-step streaming for each individual agent
 */

/**
 * Stream script generation using the script generator agent
 */
export async function streamScriptGeneration(storyIdea: string, options?: {
  genre?: string;
  tone?: string;
  title?: string;
}) {
  const runtimeContext = createRuntimeContext();
  const stream = await scriptGeneratorAgent.streamVNext(
    `Generate a script for this story idea: "${storyIdea}". ` +
    `Genre: ${options?.genre || 'drama'}, Tone: ${options?.tone || 'dramatic'}, ` +
    `Title: ${options?.title || 'Generated Script'}. ` +
    `Create a compelling screenplay in standard format with clear scenes.`
  );
  return stream;
}

/**
 * Stream storyboard creation using the storyboard agent
 */
export async function streamStoryboardCreation(script: string, options?: {
  style?: string;
  numberOfImages?: number;
  title?: string;
}) {
  const runtimeContext = createRuntimeContext();
  const stream = await storyboardAgent.streamVNext(
    `Convert this script into a visual storyboard: "${script}". ` +
    `Style: ${options?.style || 'Cinematic'}, ` +
    `Number of scenes: ${options?.numberOfImages || 6}, ` +
    `Title: ${options?.title || 'Generated Storyboard'}. ` +
    `Create detailed scene descriptions with visual elements.`
  );
  return stream;
}

/**
 * Stream image generation using the image generator agent
 */
export async function streamImageGeneration(storyboard: string, options?: {
  style?: string;
  numberOfImages?: number;
}) {
  const runtimeContext = createRuntimeContext();
  const stream = await imageGeneratorAgent.streamVNext(
    `Generate images for this storyboard: "${storyboard}". ` +
    `Style: ${options?.style || 'Cinematic'}, ` +
    `Number of images: ${options?.numberOfImages || 6}. ` +
    `Create high-quality, visually appealing images for each scene.`
  );
  return stream;
}

/**
 * Stream PDF export using the export agent
 */
export async function streamPDFExport(storyboard: string, options?: {
  title?: string;
  format?: 'pdf' | 'json' | 'html';
}) {
  const runtimeContext = createRuntimeContext();
  const stream = await exportAgent.streamVNext(
    `Export this storyboard as ${options?.format || 'PDF'}: "${storyboard}". ` +
    `Title: ${options?.title || 'Generated Storyboard'}. ` +
    `Create a professional export with proper formatting.`
  );
  return stream;
}

/**
 * Non-streaming versions for backward compatibility
 * These return the final result instead of a stream
 */

/**
 * Generate a complete storyboard from a story idea (non-streaming)
 */
export async function generateCompleteStoryboardSync(storyIdea: string, options?: {
  style?: string;
  numberOfImages?: number;
  exportFormat?: 'pdf' | 'json' | 'html';
  title?: string;
}) {
  const runtimeContext = createRuntimeContext();
  const result = await storyboardNetwork.generate(
    `Generate a complete storyboard from this story idea: "${storyIdea}". ` +
    `Please create a script, then convert it to a storyboard with ${options?.numberOfImages || 6} scenes, ` +
    `using ${options?.style || 'Cinematic'} style, and export it as ${options?.exportFormat || 'pdf'}. ` +
    `Title: ${options?.title || 'Generated Storyboard'}. Complete the entire pipeline automatically.`,
    { runtimeContext }
  );

  return result;
}

/**
 * Complete workflow: Story idea → PDF storyboard (non-streaming)
 */
export async function storyIdeaToPDFSync(storyIdea: string, options?: {
  style?: string;
  numberOfImages?: number;
  title?: string;
  genre?: string;
  tone?: string;
}) {
  const runtimeContext = createRuntimeContext();
  const result = await storyboardNetwork.generate(
    `Take this story idea "${storyIdea}" and create a complete PDF storyboard. ` +
    `Style: ${options?.style || 'Cinematic'}, Title: ${options?.title || 'Generated Storyboard'}, ` +
    `Genre: ${options?.genre || 'drama'}, Tone: ${options?.tone || 'dramatic'}. ` +
    `Create storyboard with ${options?.numberOfImages || 6} scenes. ` +
    `Please determine if the user wants step-by-step interaction or automatic completion based on their request.`,
    { runtimeContext }
  );

  return result;
}

/**
 * Complete workflow: Script → PDF storyboard (non-streaming)
 */
export async function scriptToPDFSync(script: string, options?: {
  style?: string;
  numberOfImages?: number;
  title?: string;
}) {
  const runtimeContext = createRuntimeContext();
  const result = await storyboardNetwork.generate(
    `Complete workflow: Take this script "${script}" and create a complete PDF storyboard. ` +
    `Automatically: 1) Create storyboard with ${options?.numberOfImages || 6} scenes, ` +
    `2) Generate images, 3) Export as PDF. ` +
    `Style: ${options?.style || 'Cinematic'}, Title: ${options?.title || 'Storyboard'}. ` +
    `Complete the entire pipeline without asking follow-up questions. Provide the final PDF export.`,
    { runtimeContext }
  );

  return result;
}

/**
 * Automated Agent Network - Complete Pipeline
 * This function runs the entire agent network automatically from story idea to PDF
 */
export async function automatedStoryIdeaToPDF(storyIdea: string, options?: {
  style?: string;
  numberOfImages?: number;
  title?: string;
  genre?: string;
  tone?: string;
}) {
  console.log('🚀 [Agent Network] Starting automated pipeline...');

  try {
    const result = await runAutomatedAgentNetwork(storyIdea, options);

    console.log('🎉 [Agent Network] Automated pipeline completed successfully!');
    console.log(`📄 Final PDF: ${result.pdfPath}`);
    console.log(`📊 Summary: ${result.summary.totalScenes} scenes, ${result.summary.totalImages} images`);

    return result;
  } catch (error) {
    console.error('❌ [Agent Network] Automated pipeline failed:', error);
    throw error;
  }
}

// Export the automated workflow for direct use
export { runAutomatedAgentNetwork, automatedAgentNetworkWorkflow } from './workflows/agent-network-automated-workflow';

