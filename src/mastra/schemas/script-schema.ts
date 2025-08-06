import { z } from 'zod';

// Character schema
export const CharacterSchema = z.object({
  name: z.string().min(1).describe('Character name'),
  description: z.string().optional().describe('Character description'),
  firstAppearance: z.string().optional().describe('Scene where character first appears'),
  dialogueCount: z.number().min(0).optional().describe('Number of dialogue lines'),
  role: z.enum(['protagonist', 'antagonist', 'supporting', 'extra']).optional().describe('Character role in the story'),
});

// Scene schema
export const SceneSchema = z.object({
  number: z.number().min(1).describe('Scene number'),
  heading: z.string().describe('Scene heading (e.g., "INT. LOCATION - DAY")'),
  location: z.string().describe('Scene location'),
  timeOfDay: z.string().describe('Time of day (DAY, NIGHT, DAWN, DUSK)'),
  characters: z.array(z.string()).describe('Characters present in the scene'),
  action: z.string().describe('Action description'),
  dialogue: z.array(z.object({
    character: z.string(),
    text: z.string(),
    parenthetical: z.string().optional(),
  })).optional().describe('Dialogue in the scene'),
});

// Script structure schema
export const ScriptStructureSchema = z.object({
  totalScenes: z.number().min(1).describe('Total number of scenes'),
  totalCharacters: z.number().min(1).describe('Total number of characters'),
  totalDialogue: z.number().min(0).describe('Total number of dialogue exchanges'),
  estimatedDuration: z.string().describe('Estimated runtime (e.g., "15-20 minutes")'),
  genre: z.string().optional().describe('Script genre'),
  themes: z.array(z.string()).optional().describe('Themes present in the script'),
  targetAudience: z.enum(['family', 'adult', 'teen', 'children']).optional().describe('Target audience'),
});

// Main script schema
export const ScriptSchema = z.object({
  title: z.string().min(1).describe('Script title'),
  author: z.string().optional().describe('Script author'),
  version: z.string().optional().describe('Script version'),
  date: z.string().optional().describe('Creation date'),
  content: z.string().min(1).describe('Full script content in standard format'),
  characters: z.array(CharacterSchema).describe('Characters in the script'),
  scenes: z.array(SceneSchema).describe('Scenes in the script'),
  structure: ScriptStructureSchema.describe('Script structure analysis'),
  metadata: z.object({
    wordCount: z.number().min(0).optional(),
    pageCount: z.number().min(0).optional(),
    language: z.string().default('en').optional(),
    rating: z.string().optional(),
    notes: z.string().optional(),
  }).optional().describe('Additional metadata'),
});

// Script generation input schema
export const ScriptGenerationInputSchema = z.object({
  idea: z.string().min(10).describe('Story idea or concept'),
  genre: z.string().optional().describe('Desired genre'),
  length: z.enum(['short', 'medium', 'long']).default('short').describe('Script length'),
  tone: z.enum(['dramatic', 'comedy', 'thriller', 'romance', 'action', 'mystery', 'sci-fi', 'fantasy']).optional().describe('Desired tone'),
  targetAudience: z.enum(['family', 'adult', 'teen', 'children']).optional().describe('Target audience'),
  characters: z.array(z.object({
    name: z.string(),
    description: z.string(),
    role: z.string().optional(),
  })).optional().describe('Pre-defined characters'),
  settings: z.array(z.string()).optional().describe('Desired settings or locations'),
});

// Script analysis output schema
export const ScriptAnalysisOutputSchema = z.object({
  summary: z.string().describe('Brief summary of the script'),
  characters: z.array(CharacterSchema).describe('Characters found in the script'),
  scenes: z.array(SceneSchema).describe('Scenes found in the script'),
  structure: ScriptStructureSchema.describe('Script structure analysis'),
  quality: z.object({
    score: z.number().min(0).max(10).describe('Overall quality score'),
    strengths: z.array(z.string()).describe('Script strengths'),
    weaknesses: z.array(z.string()).describe('Areas for improvement'),
    suggestions: z.array(z.string()).describe('Improvement suggestions'),
  }).optional().describe('Quality assessment'),
});

// Export types
export type Character = z.infer<typeof CharacterSchema>;
export type Scene = z.infer<typeof SceneSchema>;
export type ScriptStructure = z.infer<typeof ScriptStructureSchema>;
export type Script = z.infer<typeof ScriptSchema>;
export type ScriptGenerationInput = z.infer<typeof ScriptGenerationInputSchema>;
export type ScriptAnalysisOutput = z.infer<typeof ScriptAnalysisOutputSchema>;