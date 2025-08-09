import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';
import fs from 'fs';
import path from 'path';

/**
 * Character and Environment Consistency Evaluation Result
 */
export interface CharacterConsistencyResult {
  score: number; // 0-1
  info: {
    reason: string;
    perCharacter: Array<{
      name: string;
      consistent: boolean;
      issues: string[];
      appearsInImages: number[];
    }>;
    environmentConsistency: {
      consistent: boolean;
      score: number; // 0-1
      issues: string[];
      elements: Array<{
        element: string; // e.g., "forest setting", "lighting", "atmosphere"
        consistent: boolean;
        notes: string;
      }>;
    };
    perImageAnalysis: Array<{
      imageIndex: number;
      charactersFound: string[];
      environmentNotes: string;
      visualNotes: string;
    }>;
    totalImages: number;
    totalCharacters: number;
    consistencyIssues: string[];
  };
}

/**
 * Evaluate character visual consistency across multiple images
 * @param imagePaths Array of local file paths to images
 * @param characters Optional character descriptions for better analysis
 * @returns Character consistency evaluation result
 */
export async function evaluateCharacterConsistency(
  imagePaths: string[],
  characters?: Array<{ name: string; description: string }>
): Promise<CharacterConsistencyResult> {

  if (imagePaths.length === 0) {
    throw new Error('No images provided for character consistency evaluation');
  }

  // Convert images to data URIs
  const imageDataUris = imagePaths.map((imgPath) => {
    if (!fs.existsSync(imgPath)) {
      throw new Error(`Image file not found: ${imgPath}`);
    }

    const imageBuffer = fs.readFileSync(imgPath);
    const ext = path.extname(imgPath).toLowerCase();

    let mimeType = 'image/png';
    switch (ext) {
      case '.jpg':
      case '.jpeg':
        mimeType = 'image/jpeg';
        break;
      case '.png':
        mimeType = 'image/png';
        break;
      case '.gif':
        mimeType = 'image/gif';
        break;
      case '.webp':
        mimeType = 'image/webp';
        break;
    }

    const base64 = imageBuffer.toString('base64');
    return `data:${mimeType};base64,${base64}`;
  });

  // Build character context if provided
  let characterContext = '';
  if (characters && characters.length > 0) {
    characterContext = `\n\nExpected characters to look for:\n${characters
      .map((char, idx) => `${idx + 1}. ${char.name}: ${char.description}`)
      .join('\n')}`;
  }

  // Create message content with all images
  const content = [
    ...imageDataUris.map((dataUri) => ({
      type: 'image' as const,
      image: dataUri,
    })),
    {
      type: 'text' as const,
      text: `I'm showing you ${imagePaths.length} images that should contain the same characters and environments.

Analyze these images for VISUAL CONSISTENCY across both CHARACTERS and ENVIRONMENTS:

## CHARACTER CONSISTENCY:
1) Identify all characters that appear across multiple images
2) For each recurring character, evaluate visual consistency:
   - Facial features (eyes, nose, mouth, face shape)
   - Hair (color, style, length)
   - Clothing/attire (colors, style, accessories)
   - Body type and proportions
   - Distinctive marks or features
   - Overall art style consistency

## ENVIRONMENT CONSISTENCY:
1) Analyze the surrounding environment elements:
   - Setting/location type (forest, urban, indoor, etc.)
   - Lighting conditions (time of day, light sources, shadows)
   - Weather/atmosphere (sunny, cloudy, foggy, rain)
   - Background elements (trees, buildings, objects)
   - Color palette and mood
   - Art style consistency
   - Terrain/ground surface consistency

2) Look for environmental drift - where the same scene type appears different across images
3) Minor lighting/weather changes are acceptable if they serve the narrative

## OVERALL GRADING:
- Characters: 60% of total score
- Environment: 40% of total score

Grading rubric (for both characters and environment):
- 1.0: Perfect visual consistency - elements look identical across images
- 0.8-0.9: Minor variations but clearly the same elements
- 0.5-0.7: Noticeable inconsistencies in some features
- 0.1-0.4: Major visual drift - elements look different across images
- 0.0: Complete inconsistency - elements unrecognizable between images${characterContext}`
    }
  ];

  // Define response schema
  const responseSchema = z.object({
    score: z.number().min(0).max(1),
    info: z.object({
      reason: z.string(),
      perCharacter: z.array(z.object({
        name: z.string(),
        consistent: z.boolean(),
        issues: z.array(z.string()).default([]),
        appearsInImages: z.array(z.number()).default([])
      })).default([]),
      environmentConsistency: z.object({
        consistent: z.boolean(),
        score: z.number().min(0).max(1),
        issues: z.array(z.string()).default([]),
        elements: z.array(z.object({
          element: z.string(),
          consistent: z.boolean(),
          notes: z.string()
        })).default([])
      }),
      perImageAnalysis: z.array(z.object({
        imageIndex: z.number(),
        charactersFound: z.array(z.string()).default([]),
        environmentNotes: z.string(),
        visualNotes: z.string()
      })).default([]),
      totalImages: z.number().default(0),
      totalCharacters: z.number().default(0),
      consistencyIssues: z.array(z.string()).default([])
    })
  });

  const result = await generateObject({
    model: openai('gpt-4o-mini'),
    messages: [
      {
        role: 'user',
        content,
      },
    ],
    schema: responseSchema,
  });

  return result.object;
}

/**
 * Quick character consistency check for storyboard images
 * @param storyboardOutput JSON string containing scenes with imageUrl fields
 * @param maxImages Maximum number of images to analyze (default: 5)
 * @returns Character consistency evaluation result
 */
export async function evaluateStoryboardCharacterConsistency(
  storyboardOutput: string,
  maxImages: number = 5
): Promise<CharacterConsistencyResult> {

  try {
    const storyboard = JSON.parse(storyboardOutput);

    // Extract image paths from scenes
    const imagePaths: string[] = [];
    if (storyboard.scenes && Array.isArray(storyboard.scenes)) {
      for (const scene of storyboard.scenes.slice(0, maxImages)) {
        if (scene.imageUrl && typeof scene.imageUrl === 'string') {
          imagePaths.push(scene.imageUrl);
        }
      }
    }

    if (imagePaths.length === 0) {
      throw new Error('No image URLs found in storyboard output');
    }

    // Extract character descriptions if available
    const characters = storyboard.characters && Array.isArray(storyboard.characters)
      ? storyboard.characters.map((char: any) => ({
          name: char.name || 'Unknown Character',
          description: char.description || 'No description available'
        }))
      : undefined;

    return await evaluateCharacterConsistency(imagePaths, characters);

  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error('Invalid JSON in storyboard output');
    }
    throw error;
  }
}
