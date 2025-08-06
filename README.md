# AI Storyboard Generator with Consistent Characters - Mastra Template

A comprehensive AI-powered storyboard generation system built with Mastra that creates visual storyboards with **consistent character appearances** across all scenes. This template demonstrates how to build a multi-agent system that transforms story ideas into complete visual storyboards with character consistency, image generation, and professional exports.

## 🎬 Key Features

### **Core Capabilities**
- **Multi-Agent Architecture**: Specialized agents for script generation, storyboard creation, image generation, and export
- **Character Consistency**: Maintains consistent character appearances across all storyboard scenes
- **AgentNetwork Orchestration**: LLM-based routing and coordination between agents
- **Memory Management**: Persistent memory across conversations with resource-scoped storage
- **Streaming Support**: Real-time progress updates for both networks and individual agents

### **Storyboard Generation**
- **Script Generation**: Creates complete screenplays from story ideas using Google Gemini
- **Visual Storyboarding**: Converts scripts to visual storyboards with scene descriptions
- **Image Generation**: Creates high-quality images for each scene using Google Imagen 3.0
- **Multiple Export Formats**: PDF, JSON, and other formats with professional layouts
- **Style Variety**: Support for 20+ visual styles (Cinematic, Anime, Ghibli-esque, Disney-esque, etc.)

### **Technical Features**
- **Google Gemini Integration**: Uses Gemini 2.5 Flash for creative tasks
- **Google Imagen 3.0**: Advanced image generation with character consistency
- **OpenAI Embeddings**: Semantic search and memory embeddings
- **Local File Storage**: Saves generated images and PDFs locally
- **MCP Integration**: Model Context Protocol for file system operations
- **TypeScript**: Full type safety with Zod schemas

## 🏗️ Architecture Overview

### **Multi-Agent System**
```
Story Idea → Script Generator → Storyboard Agent → Image Generator → Export Agent → PDF
     ↓              ↓                ↓                ↓              ↓
  User Input   Screenplay    Visual Storyboard   Scene Images   Final Export
```

### **Character Consistency Engine**
- **Character Tracking**: Maintains character descriptions across all scenes
- **Visual Consistency**: Ensures characters look the same in every scene
- **Style Preservation**: Maintains consistent art style throughout the storyboard
- **Memory Integration**: Uses persistent memory to track character details

## 📦 Installation

### **Prerequisites**
- Node.js 18 or higher
- Google API key (for Gemini and Imagen)
- OpenAI API key (for embeddings)

### **Quick Start**

1. **Clone the template**:
   ```bash
   npx create-mastra@latest my-storyboard-app --template ai-storyboard-consistent-character
   cd my-storyboard-app
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   ```bash
   cp .env.example .env
   ```

   Add your API keys to `.env`:
   ```env
   # Required for Gemini models and Imagen image generation
   GOOGLE_API_KEY=your_google_api_key_here

   # Required for memory embeddings and semantic search
   OPENAI_API_KEY=your_openai_api_key_here
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```

5. **Access the playground**: Open `http://localhost:4111` in your browser

## 🚀 Usage Examples

### **Basic Storyboard Generation**

#### **Using the Agent Network (Interactive)**
```typescript
import { mastra } from './src/mastra/index.js';

// Get the storyboard network
const network = mastra.getNetwork('AI_Storyboard_Generator_Network');

// Generate a complete storyboard
const result = await network.generate(
  "Create a storyboard about a brave knight rescuing a princess in Ghibli-esque style"
);
```

#### **Using the Workflow (Automatic)**
```typescript
import { mastra } from './src/mastra/index.js';

// Use the automated workflow for guaranteed completion
const result = await mastra.getWorkflow('automatedAgentNetworkWorkflow').createRun().start({
  inputData: {
    storyIdea: "A brave knight rescues a princess from a dragon",
    style: "Ghibli-esque",
    title: "The Dragon's Forest",
    genre: "fantasy",
    tone: "adventurous"
  }
});

console.log(`PDF generated: ${result.result.pdfPath}`);
```

#### **Using Helper Functions**
```typescript
import { storyIdeaToPDF, runAutomatedAgentNetwork } from './src/mastra/index.js';

// Method 1: Streaming with agent network
const stream = await storyIdeaToPDF("A loyal dog waits for his owner", {
  style: "Ghibli-esque",
  numberOfImages: 6,
  title: "Hachiko: A Loyal Heart"
});

// Method 2: Direct workflow execution
const result = await runAutomatedAgentNetwork("A brave knight's quest", {
  style: "Cinematic",
  title: "The Knight's Journey"
});
```

### **Advanced Usage**

#### **Individual Agent Usage**
```typescript
import { mastra } from './src/mastra/index.js';

// Generate script only
const scriptAgent = mastra.getAgent('scriptGeneratorAgent');
const { text: script } = await scriptAgent.generate([
  { role: 'user', content: 'Create a script about a space adventure' }
]);

// Create storyboard from script
const storyboardAgent = mastra.getAgent('storyboardAgent');
const { text: storyboard } = await storyboardAgent.generate([
  { role: 'user', content: `Convert this script to a storyboard: ${script}` }
]);

// Generate images for storyboard
const imageAgent = mastra.getAgent('imageGeneratorAgent');
const { text: images } = await imageAgent.generate([
  { role: 'user', content: `Generate images for this storyboard: ${storyboard}` }
]);
```

#### **Streaming for Real-time Updates**
```typescript
import { streamScriptGeneration, streamStoryboardCreation } from './src/mastra/index.js';

// Stream script generation
const scriptStream = await streamScriptGeneration("A magical forest adventure", {
  genre: "fantasy",
  tone: "whimsical"
});

for await (const chunk of scriptStream) {
  console.log(chunk.text);
}

// Stream storyboard creation
const storyboardStream = await streamStoryboardCreation(script, {
  style: "Ghibli-esque",
  numberOfImages: 5
});

for await (const chunk of storyboardStream) {
  console.log(chunk.text);
}
```

## 🎨 Available Art Styles

The template supports 15 visual styles for image generation:

### **Cinematic & Photographic**
- **Cinematic**: Professional film still with photorealistic quality and cinematic lighting
- **Photographic**: High-quality photograph with natural lighting and realistic details
- **Film Noir**: Black and white film noir with high contrast and dramatic shadows

### **Animation & Comic Styles**
- **Anime**: Vibrant anime style with cel-shaded characters and detailed backgrounds
- **Manga**: Black and white manga panel with screentones and dynamic line work
- **Ghibli-esque**: Whimsical hand-drawn animation style with soft color palettes
- **Disney-esque**: Classic Disney animation with expressive characters and vibrant colors
- **Comic Book**: American comic book art with bold outlines and halftone dots
- **Graphic Novel**: Mature graphic novel style with atmospheric lighting and moody colors

### **Artistic & Digital Styles**
- **Watercolor**: Beautiful watercolor painting with soft edges and vibrant washes
- **Low Poly**: 3D low poly render with geometric shapes and simple color palette
- **Pixel Art**: 16-bit pixel art with nostalgic retro video game aesthetic

### **Genre & Thematic Styles**
- **Steampunk**: Victorian steampunk style with brass details and mechanical elements
- **Cyberpunk**: Neon-drenched cyberpunk cityscape with high-tech low-life aesthetic
- **Fantasy Art**: Epic fantasy art with dramatic lighting and magical atmosphere

## 🔧 Configuration

### **Model Configuration**

#### **AI Models Used**
- **Script Generator**: Google Gemini 2.5 Flash
- **Storyboard Agent**: Google Gemini 2.5 Flash
- **Image Generator**: Google Gemini 2.5 Flash + Imagen 3.0 Generate 002
- **Export Agent**: Google Gemini 2.5 Flash
- **AgentNetwork (Routing)**: Google Gemini 2.5 Flash
- **Memory Embeddings**: OpenAI text-embedding-3-small

#### **Why This Configuration?**
- **Gemini for Creative Tasks**: Better performance for creative writing, visual planning, and artistic direction
- **Imagen for Images**: Google's latest image generation model for high-quality visuals
- **OpenAI for Embeddings**: Reliable and cost-effective semantic search capabilities

### **Memory Configuration**

The template uses a sophisticated memory system:

```typescript
// Memory is configured for resource-scoped storage
const memory = new Memory({
  storage: new LibSQLStore({ url: "file:mastra-memory.db" }),
  vector: new LibSQLVector({ connectionUrl: "file:mastra-memory.db" }),
  embedder: openai.embedding('text-embedding-3-small'),
  options: {
    lastMessages: 15,
    semanticRecall: {
      topK: 5,
      scope: 'resource', // Search across all threads for the same user
    },
    workingMemory: {
      enabled: true,
      template: `# User Profile...` // Detailed user profile template
    }
  }
});
```

### **Character Consistency Configuration**

The template maintains character consistency through:

1. **Character Tracking**: Each character gets a unique description stored in memory
2. **Visual Consistency**: Character descriptions are passed to image generation
3. **Style Preservation**: Art style is maintained across all scenes
4. **Memory Integration**: Character details persist across conversations

## 📁 Project Structure

```
src/mastra/
├── agents/
│   ├── script-generator-agent.ts      # Creates screenplays from story ideas
│   ├── storyboard-agent.ts            # Converts scripts to visual storyboards
│   ├── image-generator-agent.ts       # Generates images for storyboard scenes
│   └── export-agent.ts                # Exports storyboards in various formats
├── tools/
│   ├── script-analysis-tool.ts        # Analyzes scripts for structure and pacing
│   ├── character-consistency-tool.ts  # Maintains character consistency
│   ├── image-generation-tool.ts       # Generates images using Imagen 3.0
│   ├── style-manager-tool.ts          # Manages available visual styles
│   └── pdf-export-tool.ts             # Exports to PDF format
├── workflows/
│   └── agent-network-automated-workflow.ts  # Complete pipeline workflow
├── schemas/
│   ├── script-schema.ts               # Zod schema for script validation
│   ├── storyboard-schema.ts           # Zod schema for storyboard validation
│   └── export-schema.ts               # Zod schema for export validation
├── memory-config.ts                   # Memory configuration for all agents
├── agent-network.ts                   # AgentNetwork orchestration
└── index.ts                           # Main Mastra configuration
```

## 🔌 API Reference

### **Core Functions**

#### **`storyIdeaToPDF(storyIdea, options)`**
Generates a complete PDF storyboard from a story idea.

```typescript
const result = await storyIdeaToPDF("A brave knight's quest", {
  style: "Ghibli-esque",
  numberOfImages: 6,
  title: "The Knight's Journey",
  genre: "fantasy",
  tone: "adventurous"
});
```

#### **`runAutomatedAgentNetwork(storyIdea, options)`**
Runs the complete automated workflow.

```typescript
const result = await runAutomatedAgentNetwork("A space adventure", {
  style: "Sci-Fi",
  title: "Cosmic Journey"
});
```

#### **`generateScript(storyIdea, options)`**
Generates a screenplay from a story idea.

```typescript
const result = await generateScript("A magical forest adventure", {
  genre: "fantasy",
  length: "short",
  tone: "whimsical"
});
```

#### **`createStoryboard(script, options)`**
Creates a storyboard from an existing script.

```typescript
const result = await createStoryboard(script, {
  numberOfImages: 5,
  style: "Cinematic",
  quality: "high"
});
```

### **Streaming Functions**

#### **`streamScriptGeneration(storyIdea, options)`**
Streams script generation in real-time.

#### **`streamStoryboardCreation(script, options)`**
Streams storyboard creation in real-time.

#### **`streamImageGeneration(storyboard, options)`**
Streams image generation in real-time.

#### **`streamPDFExport(storyboard, options)`**
Streams PDF export in real-time.

### **Agent Access**

#### **Individual Agents**
```typescript
const scriptAgent = mastra.getAgent('scriptGeneratorAgent');
const storyboardAgent = mastra.getAgent('storyboardAgent');
const imageAgent = mastra.getAgent('imageGeneratorAgent');
const exportAgent = mastra.getAgent('exportAgent');
```

#### **Networks**
```typescript
const network = mastra.getNetwork('AI_Storyboard_Generator_Network');
const vnextNetwork = mastra.vnext_getNetwork('AI_Storyboard_Generator_Network');
```

#### **Workflows**
```typescript
const workflow = mastra.getWorkflow('automatedAgentNetworkWorkflow');
```

## 🛠️ Development

### **Available Scripts**

```bash
# Start development server
npm run dev

# Build the project
npm run build

# Start production server
npm run start
```

### **Adding New Art Styles**

To add a new art style, update the `style-manager-tool.ts`:

```typescript
export const AVAILABLE_STYLES = [
  // ... existing styles
  'Your-New-Style', // Add your new style here
];
```

### **Customizing Character Consistency**

Modify the `character-consistency-tool.ts` to adjust how character consistency is maintained:

```typescript
export const characterConsistencyTool = new Tool({
  name: 'character-consistency',
  description: 'Maintains character consistency across storyboard scenes',
  inputSchema: z.object({
    // Customize the input schema
  }),
  // ... rest of the tool configuration
});
```

### **Extending the Workflow**

Add new steps to the automated workflow in `agent-network-automated-workflow.ts`:

```typescript
const newStep = createStep({
  id: 'new-step',
  description: 'Your new step description',
  inputSchema: z.object({
    // Define input schema
  }),
  outputSchema: z.object({
    // Define output schema
  }),
  execute: async ({ inputData, mastra }) => {
    // Your step logic
  },
});

// Add to workflow
export const automatedAgentNetworkWorkflow = createWorkflow({
  // ... existing configuration
  steps: [generateScriptStep, convertToStoryboardStep, generateImagesStep, exportToPdfStep, newStep],
})
  .then(generateScriptStep)
  .then(convertToStoryboardStep)
  .then(generateImagesStep)
  .then(exportToPdfStep)
  .then(newStep) // Add your new step
  .commit();
```

## 🐛 Troubleshooting

### **Common Issues**

#### **"Tool updateWorkingMemory not found" Error**
This error occurs when the memory system is not properly configured.

**Solution:**
1. Ensure your `.env` file has the correct API keys
2. Check that the memory database file exists
3. Restart the development server

#### **Images Not Generating**
If images are not being generated:

**Solution:**
1. Verify your `GOOGLE_API_KEY` is valid
2. Check that you have access to Google Imagen 3.0
3. Ensure the `generated-images/` directory exists and is writable

#### **PDF Export Fails**
If PDF export is not working:

**Solution:**
1. Check that the `generated-exports/` directory exists
2. Verify all required dependencies are installed
3. Ensure the storyboard data is properly formatted

#### **Character Consistency Issues**
If characters don't look consistent across scenes:

**Solution:**
1. Ensure character descriptions are detailed and specific
2. Use the same art style for all scenes
3. Check that the character consistency tool is properly configured

### **Performance Optimization**

#### **Reduce API Costs**
- Use `quality: 'standard'` instead of `'high'` for image generation
- Limit the number of images per storyboard
- Use streaming for real-time feedback

#### **Improve Generation Speed**
- Use fewer scenes for faster generation
- Choose simpler art styles
- Use the workflow approach for guaranteed completion

### **Memory Management**

#### **Database Issues**
If you encounter database issues:

```bash
# Remove the memory database to start fresh
rm mastra-memory.db

# Restart the development server
npm run dev
```

#### **Memory Configuration**
To customize memory behavior, modify `memory-config.ts`:

```typescript
export const createAgentMemory = () => {
  return new Memory({
    // Adjust these settings based on your needs
    options: {
      lastMessages: 10, // Reduce for lower memory usage
      semanticRecall: {
        topK: 3, // Reduce for faster searches
      },
    },
  });
};
```

## 📄 License

This template is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### **Development Setup**
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

If you encounter any issues or have questions:

1. **Check the troubleshooting section** above
2. **Review the Mastra documentation** at [docs.mastra.ai](https://docs.mastra.ai)
3. **Open an issue** on the GitHub repository
4. **Join the Mastra community** for discussions and help

## 🎯 Roadmap

### **Planned Features**
- [ ] Support for video storyboard generation
- [ ] Advanced character animation capabilities
- [ ] Integration with popular storyboard software
- [ ] Multi-language support
- [ ] Advanced scene composition tools
- [ ] Real-time collaboration features

### **Performance Improvements**
- [ ] Caching for frequently used styles
- [ ] Batch processing for multiple storyboards
- [ ] Optimized memory usage
- [ ] Faster image generation

---

**Built with ❤️ using Mastra**

This template demonstrates the power of Mastra's multi-agent architecture for creating sophisticated AI applications with character consistency and professional storyboard generation capabilities.