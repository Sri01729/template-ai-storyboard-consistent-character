import { z } from 'zod';

// Character anchor schema for storyboard
export const CharacterAnchorSchema = z.object({
  name: z.string().min(1).describe('Character name'),
  description: z.string().min(10).describe('Detailed visual description for consistency'),
  firstAppearance: z.string().optional().describe('Scene where character first appears'),
  usage: z.string().optional().describe('How the character is used in the storyboard'),
});

// Storyboard scene schema
export const StoryboardSceneSchema = z.object({
  sceneNumber: z.number().min(1).describe('Scene number in the storyboard'),
  scriptChunk: z.string().describe('Relevant script text for this scene'),
  imagePrompt: z.string().min(10).describe('Detailed image generation prompt'),
  imageUrl: z.string().optional().describe('Generated image URL or base64 data'),
  cameraAngle: z.enum(['wide', 'medium', 'close-up', 'extreme-close-up', 'bird-eye', 'worm-eye']).optional().describe('Camera angle for the scene'),
  composition: z.string().optional().describe('Composition notes'),
  lighting: z.string().optional().describe('Lighting description'),
  mood: z.string().optional().describe('Emotional mood of the scene'),
  characters: z.array(z.string()).optional().describe('Characters present in this scene'),
});

// Storyboard metadata schema
export const StoryboardMetadataSchema = z.object({
  title: z.string().optional().describe('Storyboard title'),
  author: z.string().optional().describe('Storyboard author'),
  creationDate: z.string().describe('Creation date and time'),
  totalScenes: z.number().min(1).describe('Total number of scenes'),
  characterCount: z.number().min(0).describe('Number of characters'),
  style: z.string().describe('Visual style used'),
  quality: z.enum(['standard', 'high']).default('standard').describe('Image quality setting'),
  aspectRatio: z.enum(['1:1', '16:9', '4:3', '3:2']).default('16:9').describe('Image aspect ratio'),
  generationTime: z.number().optional().describe('Total generation time in milliseconds'),
  version: z.string().optional().describe('Storyboard version'),
  notes: z.string().optional().describe('Additional notes'),
});

// Main storyboard data schema
export const StoryboardDataSchema = z.object({
  characters: z.array(CharacterAnchorSchema).describe('Character anchors for consistency'),
  scenes: z.array(StoryboardSceneSchema).describe('Storyboard scenes'),
  metadata: StoryboardMetadataSchema.describe('Storyboard metadata'),
});

// Storyboard generation input schema
export const StoryboardGenerationInputSchema = z.object({
  script: z.string().min(10).describe('Script content to convert to storyboard'),
  numberOfImages: z.number().min(1).max(12).default(6).describe('Number of key visual moments (1-12)'),
  style: z.string().default('Cinematic').describe('Visual style for the storyboard'),
  quality: z.enum(['standard', 'high']).default('standard').describe('Image quality setting'),
  aspectRatio: z.enum(['1:1', '16:9', '4:3', '3:2']).default('16:9').describe('Image aspect ratio'),
  title: z.string().optional().describe('Optional title for the storyboard'),
  focusAreas: z.array(z.string()).optional().describe('Specific areas to focus on in the storyboard'),
  characterEmphasis: z.boolean().default(true).describe('Whether to emphasize character consistency'),
});

// Storyboard analysis schema
export const StoryboardAnalysisSchema = z.object({
  visualFlow: z.object({
    score: z.number().min(0).max(10).describe('Visual flow score'),
    strengths: z.array(z.string()).describe('Visual flow strengths'),
    suggestions: z.array(z.string()).describe('Visual flow improvements'),
  }).describe('Analysis of visual flow between scenes'),
  characterConsistency: z.object({
    score: z.number().min(0).max(10).describe('Character consistency score'),
    issues: z.array(z.string()).describe('Character consistency issues'),
    recommendations: z.array(z.string()).describe('Character consistency recommendations'),
  }).describe('Analysis of character consistency'),
  narrativeCoherence: z.object({
    score: z.number().min(0).max(10).describe('Narrative coherence score'),
    strengths: z.array(z.string()).describe('Narrative coherence strengths'),
    gaps: z.array(z.string()).describe('Narrative gaps or issues'),
  }).describe('Analysis of narrative coherence'),
  technicalQuality: z.object({
    score: z.number().min(0).max(10).describe('Technical quality score'),
    aspects: z.array(z.object({
      aspect: z.string(),
      score: z.number().min(0).max(10),
      notes: z.string(),
    })).describe('Technical quality aspects'),
  }).describe('Analysis of technical quality'),
});

// Storyboard export schema
export const StoryboardExportSchema = z.object({
  format: z.enum(['json', 'pdf', 'html', 'markdown']).describe('Export format'),
  layout: z.enum(['cinematic', 'storybook', 'comic', 'minimal']).default('cinematic').describe('Layout style'),
  includeMetadata: z.boolean().default(true).describe('Whether to include metadata'),
  includeScript: z.boolean().default(true).describe('Whether to include script text'),
  includePrompts: z.boolean().default(false).describe('Whether to include image prompts'),
  pageSize: z.enum(['a4', 'letter', 'a3']).default('a4').describe('Page size for PDF exports'),
  watermark: z.boolean().default(false).describe('Whether to add watermark'),
  customStyling: z.record(z.string(), z.any()).optional().describe('Custom styling options'),
});

// Export types
export type CharacterAnchor = z.infer<typeof CharacterAnchorSchema>;
export type StoryboardScene = z.infer<typeof StoryboardSceneSchema>;
export type StoryboardMetadata = z.infer<typeof StoryboardMetadataSchema>;
export type StoryboardData = z.infer<typeof StoryboardDataSchema>;
export type StoryboardGenerationInput = z.infer<typeof StoryboardGenerationInputSchema>;
export type StoryboardAnalysis = z.infer<typeof StoryboardAnalysisSchema>;
export type StoryboardExport = z.infer<typeof StoryboardExportSchema>;