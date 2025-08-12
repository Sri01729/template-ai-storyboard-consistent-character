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

  console.log(`\n🚀 [StandaloneEval] Starting character consistency evaluation`);
  console.log(`🖼️ [StandaloneEval] Image paths provided: ${imagePaths.length}`);
  console.log(`👥 [StandaloneEval] Character descriptions provided: ${characters?.length || 0}`);

  if (imagePaths.length === 0) {
    console.error(`❌ [StandaloneEval] No images provided for evaluation`);
    throw new Error('No images provided for character consistency evaluation');
  }

  // Validate all image paths exist
  console.log(`🔍 [StandaloneEval] Validating image paths...`);
  for (let i = 0; i < imagePaths.length; i++) {
    const imgPath = imagePaths[i];
    if (!fs.existsSync(imgPath)) {
      console.error(`❌ [StandaloneEval] Image file not found: ${imgPath}`);
      throw new Error(`Image file not found: ${imgPath}`);
    }
    const stats = fs.statSync(imgPath);
    console.log(`✅ [StandaloneEval] Image ${i + 1}: ${imgPath} (${(stats.size / 1024).toFixed(2)} KB)`);
  }

  // Convert images to data URIs
  console.log(`\n🔄 [StandaloneEval] Converting images to data URIs...`);
  const imageDataUris = imagePaths.map((imgPath, index) => {
    console.log(`📷 [StandaloneEval] Converting image ${index + 1}: ${imgPath}`);

    const imageBuffer = fs.readFileSync(imgPath);
    console.log(`📖 [StandaloneEval] Read ${imageBuffer.length} bytes from ${imgPath}`);

    const ext = path.extname(imgPath).toLowerCase();
    console.log(`🔍 [StandaloneEval] File extension: ${ext}`);

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
    console.log(`🎨 [StandaloneEval] Detected MIME type: ${mimeType}`);

    const base64 = imageBuffer.toString('base64');
    const dataUri = `data:${mimeType};base64,${base64}`;
    console.log(`✅ [StandaloneEval] Converted to data URI (${dataUri.length} chars)`);

    return dataUri;
  });

  console.log(`✅ [StandaloneEval] Successfully converted ${imageDataUris.length} images to data URIs`);

  // Build character context if provided
  let characterContext = '';
  if (characters && characters.length > 0) {
    console.log(`👥 [StandaloneEval] Building character context...`);
    characterContext = `\n\nExpected characters to look for:\n${characters
      .map((char, idx) => `${idx + 1}. ${char.name}: ${char.description}`)
      .join('\n')}`;
    console.log(`📝 [StandaloneEval] Character context length: ${characterContext.length} chars`);
  }

  // Create message content with all images
  console.log(`\n📤 [StandaloneEval] Building AI request content...`);
  const content = [
    ...imageDataUris.map((dataUri, index) => {
      console.log(`📎 [StandaloneEval] Adding image ${index + 1} to content`);
      return {
        type: 'image' as const,
        image: dataUri,
      };
    }),
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

  console.log(`📊 [StandaloneEval] Content built: ${content.length} items (${content.length - 1} images + 1 text)`);
  const textItem = content[content.length - 1];
  if (textItem.type === 'text') {
    console.log(`📝 [StandaloneEval] Text prompt length: ${textItem.text.length} chars`);
  }

  // Define response schema
  console.log(`🔧 [StandaloneEval] Setting up response schema...`);
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

  console.log(` [StandaloneEval] Sending request to GPT-4o-mini...`);
  const startTime = Date.now();

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

  const endTime = Date.now();
  const duration = endTime - startTime;

  console.log(`✅ [StandaloneEval] AI analysis completed in ${duration}ms`);
  console.log(`📊 [StandaloneEval] Final score: ${result.object.score}`);
  console.log(`📝 [StandaloneEval] Reason: ${result.object.info.reason}`);
  console.log(`👥 [StandaloneEval] Characters analyzed: ${result.object.info.totalCharacters}`);
  console.log(`🖼️ [StandaloneEval] Images analyzed: ${result.object.info.totalImages}`);
  console.log(`⚠️ [StandaloneEval] Issues found: ${result.object.info.consistencyIssues.length}`);

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

  console.log(`\n🚀 [StoryboardEval] Starting storyboard character consistency evaluation`);
  console.log(`📄 [StoryboardEval] Storyboard output length: ${storyboardOutput.length} chars`);
  console.log(`🖼️ [StoryboardEval] Max images to analyze: ${maxImages}`);

  try {
    console.log(`🔍 [StoryboardEval] Parsing storyboard JSON...`);
    const storyboard = JSON.parse(storyboardOutput);
    console.log(`✅ [StoryboardEval] Successfully parsed JSON`);
    console.log(`🔍 [StoryboardEval] JSON keys: ${Object.keys(storyboard).join(', ')}`);

    // Extract image paths from scenes
    const imagePaths: string[] = [];
    if (storyboard.scenes && Array.isArray(storyboard.scenes)) {
      console.log(`🎬 [StoryboardEval] Found ${storyboard.scenes.length} scenes, checking first ${maxImages}`);
      for (const scene of storyboard.scenes.slice(0, maxImages)) {
        console.log(`🔍 [StoryboardEval] Scene keys: ${Object.keys(scene).join(', ')}`);
        if (scene.imageUrl && typeof scene.imageUrl === 'string') {
          imagePaths.push(scene.imageUrl);
          console.log(`✅ [StoryboardEval] Found imageUrl: ${scene.imageUrl}`);
        }
      }
    }

    console.log(`🖼️ [StoryboardEval] Extracted ${imagePaths.length} image paths`);

    if (imagePaths.length === 0) {
      console.error(`❌ [StoryboardEval] No image URLs found in storyboard output`);
      throw new Error('No image URLs found in storyboard output');
    }

    // Extract character descriptions if available
    let characters;
    if (storyboard.characters && Array.isArray(storyboard.characters)) {
      console.log(`👥 [StoryboardEval] Found ${storyboard.characters.length} character descriptions`);
      characters = storyboard.characters.map((char: any, index: number) => {
        const charInfo = {
          name: char.name || `Character ${index + 1}`,
          description: char.description || 'No description available'
        };
        console.log(`👤 [StoryboardEval] Character ${index + 1}: ${charInfo.name} - ${charInfo.description}`);
        return charInfo;
      });
    } else {
      console.log(`👥 [StoryboardEval] No character descriptions found in storyboard`);
    }

    console.log(`🔄 [StoryboardEval] Calling evaluateCharacterConsistency...`);
    const result = await evaluateCharacterConsistency(imagePaths, characters);

    console.log(`✅ [StoryboardEval] Evaluation completed successfully`);
    return result;

  } catch (error) {
    if (error instanceof SyntaxError) {
      console.error(`❌ [StoryboardEval] Invalid JSON in storyboard output:`, error);
      throw new Error('Invalid JSON in storyboard output');
    }
    console.error(`❌ [StoryboardEval] Error during evaluation:`, error);
    throw error;
  }
}
