# AI Story Board Generator

A comprehensive AI-powered storyboard generation system built with Mastra, featuring multiple specialized agents for creating, enhancing, and exporting storyboards with advanced evaluation metrics.

## 🚀 Features

### Core Functionality
- **AI-Powered Storyboard Creation**: Generate complete storyboards from text descriptions
- **Multi-Agent Architecture**: Specialized agents for different aspects of storyboard generation
- **Script Generation**: Convert storyboards into detailed scripts with dialogue
- **Image Generation**: Create visual prompts for storyboard scenes
- **Export Capabilities**: Multiple export formats (PDF, JSON, etc.)
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
- **Purpose**: Creates visual prompts for storyboard scenes
- **Capabilities**: Scene visualization, style consistency, technical specifications
- **Evaluation**: Prompt quality, visual consistency, technical specs

### 4. Export Specialist Agent
- **Purpose**: Handles multiple export formats and data organization
- **Capabilities**: PDF, JSON, and custom format exports
- **Evaluation**: Export format compliance, data completeness, quality

### 5. PDF Upload Agent
- **Purpose**: Processes and extracts data from uploaded PDFs with cloud integration
- **Capabilities**: PDF parsing, content extraction, data conversion, Google Drive upload, Slack notifications
- **Evaluation**: Upload validation, content extraction, processing quality
- **Integrations**:
  - **Google Drive**: Direct file uploads to specified folders
  - **Slack**: Real-time notifications via Zapier webhook for upload status and processing results

## 📊 Evaluation System

The project includes a comprehensive evaluation system built on Mastra Evals to ensure high-quality outputs:

### Evaluation Metrics
- **25+ Custom Metrics**: Specialized evaluation criteria for each agent
- **Heuristic-Based**: Efficient rule-based evaluation without additional LLM calls
- **Detailed Logging**: Comprehensive debugging and transparency
- **JSON Extraction**: Handles markdown-wrapped JSON outputs automatically

### Quality Assurance
- **Structure Validation**: Ensures proper JSON format and required fields
- **Content Analysis**: Evaluates quality, completeness, and consistency
- **Performance Tracking**: Monitor agent performance over time
- **CI/CD Integration**: Automated evaluation in development pipelines

### Available Metrics by Agent
- **Storyboard Agent**: 5 metrics (structure, visual quality, content, characters, narrative)
- **Script Agent**: 5 metrics (structure, dialogue, characters, plot, genre)
- **Image Agent**: 5 metrics (prompt quality, consistency, specs, creativity, focus)
- **Export Agent**: 5 metrics (format, completeness, structure, quality, readiness)
- **PDF Agent**: 5 metrics (upload, extraction, structure, processing, conversion)

## 🛠️ Installation

```bash
# Clone the repository
git clone <repository-url>
cd AI-Story-Board-Generator

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your API keys
```

## ⚙️ Configuration

### Environment Variables

```bash
# Required API Keys
OPENAI_API_KEY=your_openai_key
GOOGLE_API_KEY=your_google_key

# Google Drive Integration
GOOGLE_DRIVE_CLIENT_ID=your_google_drive_client_id
GOOGLE_DRIVE_CLIENT_SECRET=your_google_drive_client_secret
GOOGLE_DRIVE_REFRESH_TOKEN=your_google_drive_refresh_token
GOOGLE_DRIVE_FOLDER_ID=your_google_drive_folder_id

# Zapier Webhook for Slack Notifications
ZAPIER_WEBHOOK_URL=your_zapier_webhook_url

# Optional Configuration
MASTRA_LOG_LEVEL=info
```

### AI Model Configuration

The project supports multiple AI providers and models. Configure via the Mastra models command:

```bash
# Set up AI models interactively
npx task-master models --setup

# Or configure specific models
npx task-master models --set-main gpt-4 --set-research gpt-4
```

## 🚀 Usage

### Basic Storyboard Generation

```typescript
import { mastra } from './src/mastra';

// Generate a storyboard
const storyboardAgent = mastra.getAgent('storyboard-creator');
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
import { mastra } from './src/mastra';

// Upload and process PDF with cloud integration
const pdfAgent = mastra.getAgent('pdf-upload-agent');
const response = await pdfAgent.generate([
  {
    role: 'user',
    content: 'Upload and process this PDF storyboard: /path/to/storyboard.pdf'
  }
]);

// The agent will:
// 1. Extract content from the PDF
// 2. Upload the file to Google Drive
// 3. Send a Slack notification via Zapier webhook
// 4. Return the processed data
```

### Running Evaluations

```typescript
import { storyboardSpecificEvals } from './src/mastra/evals/storyboard-evals';

// Evaluate storyboard quality
const result = await storyboardSpecificEvals.storyboardStructure.measure(
  input,
  output
);

console.log(`Structure Score: ${result.score}`);
```

### Testing the Evaluation System

```bash
# Run evaluation tests
npx tsx test-evals-demo.ts

# Test specific agent evaluations
npx tsx examples/eval-example.ts
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
│   ├── evals/           # Evaluation metrics
│   │   ├── storyboard-evals.ts
│   │   ├── script-evals.ts
│   │   ├── image-evals.ts
│   │   ├── export-evals.ts
│   │   ├── pdf-evals.ts
│   │   ├── ci-setup.ts
│   │   └── index.ts
│   ├── tools/           # Custom tools
│   ├── workflows/       # Workflow definitions
│   └── index.ts         # Main exports
├── examples/            # Usage examples
└── tests/              # Test files
```

## 🔧 Development

### Running Tests

```bash
# Run evaluation tests
npm run test:evals

# Run specific agent tests
npm run test:agents

# Run CI/CD evaluation pipeline
npm run test:ci
```

### Adding New Metrics

```typescript
// Create custom evaluation metric
export class CustomMetric {
  async measure(input: string, output: string): Promise<MetricResult> {
    // Your evaluation logic here
    const score = calculateScore(output);

    return {
      score,
      info: {
        reason: 'Explanation of the score'
      }
    };
  }
}
```

### Debugging Evaluations

The evaluation system includes comprehensive logging:

```typescript
// Enable detailed logging
console.log('🔍 [MetricName] Starting evaluation...');
console.log('🔍 [MetricName] Input:', input.substring(0, 100) + '...');
console.log('🔍 [MetricName] Output length:', output.length);
```

## 📈 Quality Metrics

All evaluation metrics return scores between 0.0 and 1.0:

- **0.9-1.0**: Excellent quality, exceeds expectations
- **0.7-0.8**: Good quality, meets most requirements
- **0.4-0.6**: Acceptable quality, minor improvements needed
- **0.0-0.3**: Poor quality, needs significant improvement

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

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run the evaluation suite
6. Submit a pull request

## 📚 Documentation

- [Evaluation System Guide](EVALS.md) - Comprehensive guide to the evaluation system
- [Mastra Documentation](https://docs.mastra.ai) - Official Mastra framework docs
- [API Reference](docs/api.md) - Detailed API documentation

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Issues**: Report bugs and feature requests via GitHub Issues
- **Discussions**: Join community discussions on GitHub Discussions
- **Documentation**: Check the [EVALS.md](EVALS.md) file for evaluation system details