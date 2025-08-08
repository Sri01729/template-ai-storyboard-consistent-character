
import { Mastra } from '@mastra/core/mastra';
import { PinoLogger } from '@mastra/loggers';
import { LibSQLStore } from '@mastra/libsql';
import { scriptGeneratorAgent } from './agents/script-generator-agent';
import { storyboardAgent } from './agents/storyboard-agent';
import { imageGeneratorAgent } from './agents/image-generator-agent';
import { exportAgent } from './agents/export-agent';
import { pdfUploadAgent } from './agents/pdf-upload-agent';
import { storyboardNetwork, storyboardNetworkLegacy } from './agent-network';
import { automatedAgentNetworkWorkflow } from './workflows/agent-network-automated-workflow';
import { storyboardToCloudWorkflow } from './workflows/pdf-upload-workflow';
import { createSharedMemory } from './memory-config';

// Create shared storage for all memory instances
const sharedStorage = new LibSQLStore({
  url: "file:mastra-memory.db", // Back to original
});

export const mastra = new Mastra({
  agents: {
    scriptGeneratorAgent,
    storyboardAgent,
    imageGeneratorAgent,
    exportAgent,
    pdfUploadAgent,
  },
  networks: {
    storyboardNetworkLegacy,
  },
  vnext_networks: {
    storyboardNetwork,
  },
  workflows: {
    automatedAgentNetworkWorkflow,
    storyboardToCloudWorkflow,
  },
  storage: sharedStorage, // Enable shared storage for memory
  logger: new PinoLogger({
    name: 'Mastra',
    level: 'info',
  }),
});

// Export convenience functions from agent-network
export {
  generateCompleteStoryboard,
  generateScript,
  createStoryboard,
  generateStoryboardImages,
  exportStoryboard,
  storyIdeaToPDF,
  scriptToPDF,
  generateCompleteStoryboardSync,
  storyIdeaToPDFSync,
  scriptToPDFSync,
  streamScriptGeneration,
  streamStoryboardCreation,
  streamImageGeneration,
  streamPDFExport,
  automatedStoryIdeaToPDF,
} from './agent-network';

// Export schemas for type safety
export * from './schemas/script-schema';
export * from './schemas/storyboard-schema';
export * from './schemas/export-schema';
export * from './schemas/pdf-upload-schema';

// Export memory configuration
export * from './memory-config';

// Export the automated workflow function for direct use
export { runAutomatedAgentNetwork } from './workflows/agent-network-automated-workflow';

// Export PDF upload workflow functions
export { generateAndUploadStoryboard } from './workflows/pdf-upload-workflow';

// Export evals (only for creative content agents)
export * from './evals';
export * from './evals/storyboard-evals';
export * from './evals/script-evals';
export * from './evals/image-evals';
export * from './evals/test-evals';
