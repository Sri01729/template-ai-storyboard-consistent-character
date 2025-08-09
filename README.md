# AI Story Board Generator Template

A comprehensive AI-powered storyboard generation system built with Mastra, featuring multiple specialized agents for creating, enhancing, and exporting storyboards with **consistent character generation** and advanced evaluation metrics. This template demonstrates advanced Mastra functionality including agent networks, automated workflows, memory management, and comprehensive evaluation systems.

## 🎯 Template Features

### Core Mastra Functionality
- **Multi-Agent Architecture**: 5 specialized agents working together
- **Agent Networks**: Coordinated agent communication and task distribution
- **Automated Workflows**: End-to-end storyboard generation pipelines
- **Memory Management**: Persistent agent memory with LibSQL storage
- **MCP Integration**: Model Context Protocol for external tool integration
 - **Comprehensive Evaluation**: 11 custom metrics implemented (5 storyboard + 5 script + 1 vision-based image consistency)

### Advanced Integrations
- **Google Drive Upload**: Direct file uploads via Zapier webhooks
- **AWS S3 Integration**: Cloud storage for generated PDFs
- **Slack Notifications**: Real-time status updates
- **Multiple AI Providers**: OpenAI and Google Gemini support

## 🚀 Features

### Core Functionality
- **AI-Powered Storyboard Creation**: Generate complete storyboards from text descriptions
- **Multi-Agent Architecture**: Specialized agents for different aspects of storyboard generation
- **Script Generation**: Convert storyboards into detailed scripts with dialogue
- **Image Generation**: Create visual prompts for storyboard scenes
- **Export Capabilities**: PDF format
- **PDF Upload & Processing**: Extract and process storyboard data from PDFs with Google Drive integration

### Technical Features
- **TypeScript**: Full type safety and modern development experience
- **Mastra Framework**: Built on the powerful Mastra AI framework
- **AI SDK Integration**: Support for multiple AI providers (OpenAI, Google Gemini)
- **Modular Architecture**: Clean separation of concerns with dedicated modules
- **Comprehensive Evaluation System**: Quality metrics for all agents
- **Google Drive Integration**: Direct file uploads to Google Drive
- **Slack Notifications**: Real-time notifications via Zapier webhooks

## 🤖 AI Agents

### 1. Storyboard Creator Agent
- **Purpose**: Generates complete storyboards from story descriptions
- **Capabilities**: Scene breakdown, visual descriptions, character development
- **Evaluation**: Structure validation, visual prompt quality, content completeness

### 2. Script Generator Agent
- **Purpose**: Converts storyboards into detailed scripts with dialogue
- **Capabilities**: Dialogue generation, character voice, scene transitions
- **Evaluation**: Script structure, dialogue quality, character development

### 3. Image Generator Agent
- **Purpose**: Creates visual prompts and generates images for storyboard scenes
- **Capabilities**: Scene visualization, style consistency, technical specifications, Google Imagen integration
- **Evaluation**: Character and environment visual consistency analysis using GPT-4o-mini vision capabilities

### 4. Export Specialist Agent
- **Purpose**: Handles export and data organization
- **Capabilities**: PDF export, data formatting, file generation

### 5. PDF Upload Agent
- **Purpose**: Processes and extracts data from uploaded PDFs with cloud integration
- **Capabilities**: PDF parsing, content extraction, data conversion, Google Drive upload, Slack notifications
- **Integrations**:
  - **Google Drive**: Direct file uploads to specified folders
  - **Slack**: Real-time notifications via Zapier webhook for upload status and processing results

## 📊 Evaluation System

The project includes a comprehensive evaluation system built on Mastra Evals to ensure high-quality outputs:

### Evaluation Metrics
- **11 Custom Metrics Implemented**: Specialized evaluation criteria for storyboard, script, and image agents
- **Multi-Modal Evaluation**: Vision-based analysis for image consistency using GPT-4o-mini
- **Heuristic + LLM-Based**: Efficient rule-based evaluation plus advanced vision analysis
- **Detailed Logging**: Comprehensive debugging and transparency
- **JSON Extraction**: Handles markdown-wrapped JSON outputs automatically

### Quality Assurance
- **Structure Validation**: Ensures proper JSON format and required fields
- **Content Analysis**: Evaluates quality, completeness, and consistency
- **Performance Tracking**: Monitor agent performance over time

### Available Metrics by Agent (Current)
- **Storyboard Agent**: 5 metrics (structure, visual quality, content completeness, character consistency, narrative flow)
- **Script Agent**: 5 metrics (structure, dialogue quality, character development, plot coherence, genre alignment)
- **Image Generator Agent**: 1 vision-based metric (character and environment visual consistency with weighted scoring)

## 🛠️ Installation & Setup

### Dependencies
- **@mastra/core**: Core Mastra framework for AI agent development
- **@mastra/evals**: Evaluation system for quality metrics
- **@mastra/libsql**: LibSQL storage for agent memory
- **@mastra/loggers**: Logging system for debugging and monitoring
- **@mastra/memory**: Memory management for agent state
- **@ai-sdk/google**: Google AI integration for Gemini models
- **@ai-sdk/openai**: OpenAI integration for content analysis and generation
- **@aws-sdk/client-s3**: AWS S3 cloud storage for PDF uploads
- **@aws-sdk/s3-request-presigner**: S3 presigned URL generation
- **@google/genai**: Google Generative AI for image generation
- **@google/generative-ai**: Google AI SDK for advanced features
- **@modelcontextprotocol/server-filesystem**: MCP filesystem server integration
- **canvas**: Canvas API for image processing
- **jspdf**: PDF generation library
- **pdfkit**: PDF creation and manipulation
- **zod**: Schema validation and type safety

### Prerequisites
- Node.js 18 or higher
- npm or yarn package manager
- API keys for OpenAI and Google Gemini

### Quick Start
```bash
# Clone the repository
git clone <repository-url>
cd AI-Story-Board-Generator

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your API keys

# Start development server
npm run dev
```

### Template Structure
```
src/mastra/
├── agents/           # 5 specialized AI agents
├── tools/            # 6 custom tools for processing
├── workflows/        # 2 automated workflows
├── schemas/          # Zod schemas for type safety
├── evals/            # evaluation metrics (storyboard + script + image)
├── scorers/          # LLM-based visual consistency scorers
├── index.ts          # Main Mastra configuration
├── agent-network.ts  # Agent coordination system
├── memory-config.ts  # Memory management setup
└── mcp-config.ts     # MCP integration
```

## ⚙️ Configuration

### Environment Variables

   ```bash
# Required API Keys
OPENAI_API_KEY=your_openai_key          # used for embeddings in memory
GOOGLE_API_KEY=your_google_key          # used by Google/Gemini models

# PDF Upload (optional for examples/pdf-upload.ts)
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-east-1
S3_BUCKET=your_s3_bucket_name

# Zapier Webhook for Google Drive/Slack integrations (optional)
ZAPIER_WEBHOOK_URL=your_zapier_webhook_url
```



## 🚀 Usage

### Accessing Subagents in Playground

You can access various subagents in the playground and experiment with them individually:

- **Storyboard Agent**: Creates visual storyboards from scripts
- **Script Generator Agent**: Converts story ideas into detailed screenplays
- **Image Generator Agent**: Generates images for storyboard scenes
- **Export Agent**: Creates PDFs and other export formats
- **PDF Upload Agent**: Handles cloud uploads to S3 and Google Drive

### Agent Network Usage

#### V-Next Stream Agent Network

For coordinated multi-agent workflows, use the v-next stream agent network in the playground chat interface:

**Prompt Structure:**
```
create a storyboard for the story of "a curious boy who lives in a floating village of lanterns and sets out at dawn with his mechanical bird to find the lost light of the village" in steampunk style with warm sunrise tones, steampunk-inspired details, and emotional wonder. compile the final visuals into a PDF and upload it to my drive
```

The network will automatically:
1. Generate a script from the story idea
2. Convert script to storyboard with scenes
3. Generate images for each scene
4. Create PDF with embedded images
5. Upload to S3 and Google Drive

### Available Image Styles

Choose from these styles for your storyboards:

- **Cinematic**: Professional film still with photorealistic quality
- **Photographic**: High-quality photograph with natural lighting
- **Anime**: Vibrant anime style with cel-shaded characters
- **Manga**: Black and white manga panel with screentones
- **Ghibli-esque**: Whimsical hand-drawn animation style
- **Disney-esque**: Classic Disney animation with expressive characters
- **Comic Book**: American comic book art with bold outlines
- **Graphic Novel**: Mature graphic novel style with atmospheric lighting
- **Watercolor**: Beautiful watercolor painting with soft edges
- **Low Poly**: 3D low poly render with geometric shapes
- **Pixel Art**: 16-bit pixel art with nostalgic retro aesthetic
- **Steampunk**: Victorian steampunk style with brass details
- **Cyberpunk**: Neon-drenched cyberpunk cityscape
- **Fantasy Art**: Epic fantasy art with dramatic lighting
- **Film Noir**: Black and white film noir with high contrast

### Basic Storyboard Generation

```typescript
import { mastra } from './src/mastra';

// Generate a storyboard
const storyboardAgent = mastra.getAgent('storyboardAgent');
const response = await storyboardAgent.generate([
  {
    role: 'user',
    content: 'Create a storyboard for: A young woman discovers a magical book in an old library.'
  }
]);

console.log(response.text);
```

### PDF Upload with Cloud Integration

```typescript
import { generateAndUploadStoryboard } from './src/mastra';

const result = await generateAndUploadStoryboard({
  storyIdea: 'A young woman discovers a magical book in an old library.',
  desiredFilename: 'storyboard.pdf',
  // optionally:
  // s3Bucket: 'your-bucket',
  // zapierWebhookUrl: process.env.ZAPIER_WEBHOOK_URL,
});

console.log(result);
```

### Running Evaluations

```typescript
import { storyboardSpecificEvals } from './src/mastra/evals/storyboard-evals';

// Evaluate storyboard quality
const result = await storyboardSpecificEvals.structure.measure(
  input,
  output
);

console.log(`Structure Score: ${result.score}`);
```

### Testing the Evaluation System

```bash
# Run the direct evals example
npx tsx examples/evals.ts
```

## 📁 Project Structure

```
src/
├── mastra/
│   ├── agents/           # AI agent implementations
│   │   ├── storyboard-agent.ts
│   │   ├── script-generator-agent.ts
│   │   ├── image-generator-agent.ts
│   │   ├── export-agent.ts
│   │   └── pdf-upload-agent.ts
│   ├── agentnetwork/     # Agent coordination system
│   │   └── agent-network.ts
│   ├── evals/           # Evaluation metrics
│   │   ├── storyboard-evals.ts
│   │   ├── script-evals.ts
│   │   ├── image-evals.ts
│   │   ├── character-consistency-eval.ts
│   │   └── index.ts
│   ├── scorers/         # LLM-based visual consistency scorers
│   │   └── character-visual-consistency-scorer.ts
│   ├── tools/           # Custom tools
│   │   ├── character-consistency-tool.ts
│   │   ├── image-generation-tool.ts
│   │   ├── pdf-export-tool.ts
│   │   ├── pdf-upload-tool.ts
│   │   ├── script-analysis-tool.ts
│   │   └── style-manager-tool.ts
│   ├── workflows/       # Workflow definitions
│   │   └── agent-network-automated-workflow.ts
│   ├── schemas/         # Zod schemas for type safety
│   │   ├── export-schema.ts
│   │   ├── pdf-upload-schema.ts
│   │   ├── script-schema.ts
│   │   └── storyboard-schema.ts
│   ├── index.ts         # Main exports
│   ├── mcp-config.ts    # MCP integration
│   └── memory-config.ts # Memory management setup
└── examples/           # Usage examples
    ├── basic-usage.ts
    ├── evals.ts
    ├── pdf-upload.ts
    ├── streaming.ts
    ├── workflow-automated.ts
    ├── test-character-consistency.ts      # Vision-based character consistency test
    └── test-direct-character-consistency.ts  # Direct AI SDK vision test
```

## 🔧 Development

## 📈 Quality Metrics

All evaluation metrics return scores between 0.0 and 1.0:

- **0.9-1.0**: Excellent quality, exceeds expectations
- **0.7-0.8**: Good quality, meets most requirements
- **0.4-0.6**: Acceptable quality, minor improvements needed
- **0.0-0.3**: Poor quality, needs significant improvement

## 🔧 Development & Testing

### Available Scripts
```bash
npm run dev      # Start development server
npm run build    # Build the project
```

### Performance Optimization
- **Memory Management**: Uses LibSQL for persistent agent memory
- **Agent Networks**: Efficient task distribution across agents
- **Streaming**: Real-time output streaming for better UX
- **Caching**: Intelligent caching of generated content

### Security Best Practices
- **API Key Management**: Secure environment variable handling
- **Input Validation**: Comprehensive Zod schema validation
- **Error Handling**: Graceful error handling and logging
- **Access Control**: Proper authentication for external services

## 🚨 Troubleshooting

### Common Issues

**1. API Key Errors**
```bash
# Check environment variables
echo $OPENAI_API_KEY
echo $GOOGLE_API_KEY

# Verify .env file exists
ls -la .env
```

**2. Memory Database Issues**
```bash
# Reset memory database
rm mastra-memory.db
npm run dev
```

**3. Evaluation Failures**
```bash
# Debug specific metric
npx tsx examples/evals.ts
```

**4. PDF Upload Issues**
```bash
# Verify AWS credentials
aws sts get-caller-identity

# Check Zapier webhook
curl -X POST $ZAPIER_WEBHOOK_URL
```

### Performance Tips
- Use `streaming` functions for real-time feedback
- Enable memory for consistent character development
- Use agent networks for complex multi-step processes
- Monitor evaluation scores for quality improvement

## 📚 API Reference

### Core Functions

#### Storyboard Generation
```typescript
// Generate complete storyboard from story idea
const result = await generateCompleteStoryboard(
  "A young detective solves a mystery in a small town",
  { style: "Cinematic" }
);

// Generate storyboard with streaming
const stream = await streamStoryboardCreation(
  "A sci-fi adventure in space",
  { style: "Sci-Fi" }
);
```

#### Script Generation
```typescript
// Generate script from story idea
const script = await generateScript(
  "A romantic comedy about two chefs",
  { genre: "romance", tone: "lighthearted" }
);

// Stream script generation
const stream = await streamScriptGeneration(
  "A thriller about a hacker",
  { genre: "thriller", tone: "dark" }
);
```

#### Image Generation
```typescript
// Generate images for storyboard
const images = await generateStoryboardImages(
  storyboardData,
  { style: "Anime", quality: "high" }
);

// Stream image generation
const stream = await streamImageGeneration(
  storyboardData,
  { style: "Photorealistic" }
);
```

#### Export Functions
```typescript
// Export to PDF
const pdf = await exportStoryboard(
  storyboardData,
  { format: "pdf", layout: "cinematic" }
);

// Export with streaming
const stream = await streamPDFExport(
  storyboardData,
  { format: "pdf", includeMetadata: true }
);
```

#### PDF Upload & Processing
```typescript
// Upload and process PDF
const result = await generateAndUploadStoryboard(
  storyboardData,
  {
    desiredFilename: "my-storyboard.pdf",
    s3Bucket: "my-bucket",
    zapierWebhookUrl: "https://hooks.zapier.com/..."
  }
);

// Automated workflow
const result = await runAutomatedAgentNetwork(
  "A fantasy adventure story",
  {
    style: "Fantasy",
    title: "The Dragon's Quest",
    genre: "fantasy",
    tone: "epic"
  }
);
```

### Agent Configuration

Each agent can be configured with custom settings:

```typescript
import { storyboardAgent } from './src/mastra/agents/storyboard-agent';

// Custom agent configuration
const customAgent = new Agent({
  name: 'custom-storyboard',
  model: google('gemini-2.0-flash'),
  memory: createAgentMemory(),
  tools: { customTool },
  evals: { customEval }
});
```

### Memory Management

```typescript
import { createAgentMemory } from './src/mastra/memory-config';

// Create memory instance
const memory = createAgentMemory();

// Use with agent
const agent = new Agent({
  memory,
  // ... other config
});
```

### Evaluation System

```typescript
import { storyboardSpecificEvals } from './src/mastra/evals/storyboard-evals';

// Run evaluation
const result = await storyboardSpecificEvals.structure.measure(
  input,
  output
);

// Get detailed metrics
console.log('Score:', result.score);
console.log('Details:', result.info);
```

## 🤝 Contributing

This template follows Mastra's official template guidelines:

- **Project Structure**: All Mastra code in `src/mastra/`
- **TypeScript**: Strict typing with Zod schemas
- **ES Modules**: Modern JavaScript with `"type": "module"`
- **Node.js 18+**: Latest LTS support
- **Framework-free**: Pure Mastra functionality

### Template Compliance
- ✅ **Project Structure**: Proper organization in `src/mastra/`
- ✅ **TypeScript Config**: ES2022, strict mode, bundler resolution
- ✅ **Package.json**: Template naming, ES modules, Node.js 18+
- ✅ **Environment Config**: Comprehensive `.env.example`
- ✅ **Agent Development**: AI SDK integration, memory management
- ✅ **Tool Development**: Zod validation, error handling
- ✅ **Workflow Development**: `createStep`/`createWorkflow` usage
- ✅ **Schema Safety**: Comprehensive Zod schemas with TypeScript exports

## 📄 License

MIT License - see LICENSE file for details.

## ▶️ Running the Examples

This template ships with runnable example scripts under `examples/` that demonstrate non‑streaming, streaming, automated workflow, direct eval usage, and PDF upload.

### Prerequisites (all examples)
- Node.js 18+
- Install deps: `npm install`
- Required env for core features:
  - `OPENAI_API_KEY` (used for embeddings in memory)
  - `GOOGLE_API_KEY` (used by Google/Gemini models)

Set them temporarily per shell:
```bash
export OPENAI_API_KEY="your_openai_key"
export GOOGLE_API_KEY="your_google_key"
```

Or inline for a single run:
```bash
OPENAI_API_KEY="..." GOOGLE_API_KEY="..." npx tsx examples/basic-usage.ts
```

### 1) Non‑Streaming End‑to‑End: `examples/basic-usage.ts`
Runs three non‑streaming helpers:
- `generateCompleteStoryboardSync` (idea → script → storyboard → export)
- `storyIdeaToPDFSync` (idea → PDF storyboard)
- `scriptToPDFSync` (script → PDF storyboard)

Run:
```bash
npx tsx examples/basic-usage.ts
```

Expect truncated JSON previews printed to stdout.

### 2) Streaming Pipelines: `examples/streaming.ts`
Demonstrates streaming for each step with progress logs:
- `generateScript`
- `createStoryboard`
- `generateStoryboardImages`
- `exportStoryboard`

Run:
```bash
npx tsx examples/streaming.ts
```

Each stage prints chunk previews to the console.

### 3) Automated Workflow: `examples/workflow-automated.ts`
Runs `automatedStoryIdeaToPDF` to execute the full pipeline automatically.

Run:
```bash
npx tsx examples/workflow-automated.ts
```

Prints the resulting object (truncated) including summary and PDF path when available.

### 4) Direct Evals Usage: `examples/evals.ts`
Shows how to call implemented metrics directly:
- Storyboard: `structure`, `visualPromptQuality`
- Script: `structure`, `genreAlignment`

Run:
```bash
npx tsx examples/evals.ts
```

Outputs metric scores (0.0–1.0) to stdout.

### 6) Character Consistency Testing: `examples/test-character-consistency.ts`
Tests the vision-based character and environment consistency evaluation system using actual generated images from the `generated-images/` folder:

```bash
npx tsx examples/test-character-consistency.ts
```

This example demonstrates:
- **Multi-modal evaluation** using GPT-4o-mini vision capabilities
- **Character consistency analysis** across 5 forest scene images
- **Environment consistency scoring** with detailed breakdown
- **Weighted scoring system** (60% characters, 40% environment)
- **Comprehensive reporting** with per-character and per-image analysis

The test uses real storyboard images located in `generated-images/scene_1_A_lush__ancient_fore_*.png` to validate the visual consistency evaluation system.

### 5) PDF Upload Workflow: `examples/pdf-upload.ts`
Generates a storyboard then uploads the PDF via the provided workflow helper.

Additional env required:
```bash
export AWS_ACCESS_KEY_ID="..."
export AWS_SECRET_ACCESS_KEY="..."
export AWS_REGION="us-east-1"         # or your region
export S3_BUCKET="your-bucket-name"   # your S3 bucket name
# Optional (Zapier webhook → Google Drive, Slack, etc.)
export ZAPIER_WEBHOOK_URL="https://hooks.zapier.com/..."
```

Run:
```bash
npx tsx examples/pdf-upload.ts
```

The script prints the upload result (S3 URL and/or downstream integration status).

### Run All Examples Sequentially
```bash
for f in basic-usage streaming workflow-automated evals test-character-consistency pdf-upload; do \
  npx tsx examples/$f.ts; \
done
```

## 🖼️ Generated Images & Test Data

The `generated-images/` folder contains sample storyboard images used for testing the visual consistency evaluation system:

- **`scene_1_A_lush__ancient_fore_*.png`**: 5 forest scene images featuring a young explorer and crow companion
- **Used by**: Character consistency evaluation tests and examples
- **Purpose**: Demonstrates multi-modal evaluation capabilities using real generated content
- **Format**: PNG images generated by Google Imagen through the Image Generator Agent
- **Evaluation**: These images achieve ~85-90% consistency scores in character and environment analysis

## 🔗 Integrations

### Google Drive Integration
- **Direct Upload**: PDF files are automatically uploaded to specified Google Drive folders
- **Folder Organization**: Files are organized by date and project
- **Access Control**: Secure authentication using OAuth 2.0
- **File Management**: Automatic file naming and metadata tagging

### Slack Notifications via Zapier
- **Real-time Updates**: Instant notifications for upload status and processing results
- **Rich Notifications**: Include file links, processing status, and error details
- **Customizable**: Configure notification channels and message formats
- **Error Handling**: Notifications for failed uploads or processing errors

### Zapier Automation Flow: Upload PDF from S3 to Google Drive + Slack Notification

This Zap handles the following automation:

- Accepts a PDF file URL (typically from S3) via webhook.
- Uploads that file to Google Drive.
- Sends a Slack DM with the Google Drive link.

#### 🔗 Zap Structure (3-Step Flow)

✅ Step 1: Webhooks by Zapier — Catch Hook
- Trigger: Catch Hook
- Use Case: Receive incoming POST request from your Mastra Agent or S3 MCP server.
- Expected Payload:

```json
{
  "fileUrl": "https://your-s3-bucket.amazonaws.com/storybook.pdf",
  "filename": "storybook.pdf"
}
```

✅ Step 2: Google Drive — Upload File
- Action: Upload File
- Drive: Your connected Google Drive account
- Folder: Destination folder of your choice
- File: Use the fileUrl from Step 1
- File Name: Use filename from Step 1
- Convert to Google Docs: No (keep original PDF format)

Note: This step returns a file ID (e.g., `1ABC123xyz456`) which you will use to build a public link.

✅ Step 3: Slack — Send Direct Message
- Action: Send Direct Message
- To: Your Slack user ID or another teammate
- Message Body:

```
🚀 PDF uploaded successfully!
📄 File: *{{filename}}*
🔗 <https://drive.google.com/file/d/{{id}}/view?usp=sharing|Click here to check it out>
```

Replace `{{filename}}` and `{{id}}` with the dynamic fields from Step 1 and Step 2.

✅ Result:

Your app or agent can now generate PDFs → upload via S3 URL → send to Zapier webhook → Zap uploads to Google Drive → Slack DM sent with public PDF link.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run the evaluation suite
6. Submit a pull request

## 📄 License

This template is part of the Mastra framework and follows the same licensing terms.

## 🆘 Support

- **Issues**: Report bugs and feature requests via GitHub Issues
- **Discussions**: Join community discussions on GitHub Discussions
- **Documentation**: Check the [EVALS.md](EVALS.md) file for evaluation system details