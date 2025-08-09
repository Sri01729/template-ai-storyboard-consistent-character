import { Metric, type MetricResult } from '@mastra/core';
import { MastraAgentJudge } from '@mastra/evals/judge';
import { type LanguageModel } from '@mastra/core/llm';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';
import fs from 'fs';
import path from 'path';

const INSTRUCTIONS = `You are an expert visual consistency judge for storyboards. You analyze actual generated images to evaluate whether character depictions remain visually consistent across multiple scenes.`;

// Helper function to convert local image files to base64 data URIs
function imageFileToDataUri(imagePath: string): string {
  try {
    if (imagePath.startsWith('data:')) {
      return imagePath; // Already a data URI
    }

    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath; // Web URL, return as-is (though this won't work with vision models)
    }

    // Convert local file to base64 data URI
    const imageBuffer = fs.readFileSync(imagePath);
    const ext = path.extname(imagePath).toLowerCase();

    let mimeType = 'image/png'; // default
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
  } catch (error) {
    console.error(`❌ [ImageConversion] Failed to convert ${imagePath} to data URI:`, error);
    throw new Error(`Failed to convert image file to data URI: ${imagePath}`);
  }
}

const generatePromptWithImages = (input: string, output: string, imageUrls: string[]) => {
  const textContent = `
Here is the user input: "${input}"
Here is the storyboard JSON output: "${output}"

I'm showing you ${imageUrls.length} generated images from this storyboard.

Analyze these actual images for character visual consistency:

1) Identify all characters that appear across multiple images
2) For each recurring character, evaluate visual consistency across images:
   - Facial features (eyes, nose, mouth, face shape)
   - Hair (color, style, length)
   - Clothing/attire (colors, style, accessories)
   - Body type and proportions
   - Distinctive marks or features
   - Overall art style consistency

3) Look for identity drift - where the same character appears different across scenes
4) Small pose/angle differences are acceptable, but identity changes are not

Important grading rubric:
- 1.0: Perfect visual consistency - same characters look identical across images
- 0.8-0.9: Minor variations but clearly the same characters
- 0.5-0.7: Noticeable inconsistencies in some character features
- 0.1-0.4: Major visual drift - characters look different across images
- 0.0: Complete inconsistency - characters unrecognizable between images

Return:
{
  "score": number (0 to 1),
  "info": {
    "reason": string,
    "perCharacter": [{"name": string, "consistent": boolean, "issues": [string], "appearsInImages": [number]}],
    "perImageAnalysis": [{"imageIndex": number, "charactersFound": [string], "visualNotes": string}],
    "totalImages": number,
    "totalCharacters": number,
    "consistencyIssues": [string]
  }
}
`;

  // Build content array with images first, then text (following Mastra format)
  const content: Array<{ type: 'text'; text: string } | { type: 'image'; image: string }> = [];

  // Add each image as separate content item
  imageUrls.forEach((url, index) => {
    try {
      const dataUri = imageFileToDataUri(url);
      console.log(`📷 [Image ${index + 1}] Converted to data URI (${dataUri.length} chars)`);
      content.push({
        type: 'image' as const,
        image: dataUri
      });
    } catch (error) {
      console.error(`❌ [Image ${index + 1}] Failed to convert: ${url}`, error);
    }
  });

  // Add text content last
  content.push({ type: 'text' as const, text: textContent });

  return content;
};

class CharacterConsistencyJudge extends MastraAgentJudge {
  constructor(model: LanguageModel) {
    super('CharacterConsistencyJudge', INSTRUCTIONS, model);
  }

    async evaluate(input: string, output: string, imageUrls: string[] = []): Promise<MetricResult> {
    if (imageUrls.length === 0) {
      return {
        score: 0,
        info: {
          reason: 'No images provided for visual analysis',
          perCharacter: [],
          perImageAnalysis: [],
          totalImages: 0,
          totalCharacters: 0,
          consistencyIssues: ['No images available for analysis']
        }
      };
    }

    // For Mastra agents, we need to pass images differently
    // Convert images to the format expected by Mastra
    const imageAttachments = imageUrls.map((url, index) => {
      try {
        const dataUri = imageFileToDataUri(url);
        console.log(`📷 [Image ${index + 1}] Converted to data URI (${dataUri.length} chars)`);
        return {
          name: `image_${index + 1}`,
          contentType: dataUri.startsWith('data:image/jpeg') ? 'image/jpeg' : 'image/png',
          data: dataUri
        };
      } catch (error) {
        console.error(`❌ [Image ${index + 1}] Failed to convert: ${url}`, error);
        return null;
      }
    }).filter(Boolean);

    const textContent = `
Here is the user input: "${input}"
Here is the storyboard JSON output: "${output}"

I'm showing you ${imageUrls.length} generated images from this storyboard.

Analyze these actual images for character and environment visual consistency:

**CHARACTER ANALYSIS (60% weight):**
1) Identify all characters that appear across multiple images
2) For each recurring character, evaluate visual consistency across images:
   - Facial features (eyes, nose, mouth, face shape)
   - Hair (color, style, length)
   - Clothing/attire (colors, style, accessories)
   - Body type and proportions
   - Distinctive marks or features
   - Overall art style consistency

**ENVIRONMENT ANALYSIS (40% weight):**
1) Evaluate environmental consistency across images:
   - Setting/location consistency (forest, buildings, etc.)
   - Lighting conditions and atmosphere
   - Background elements and props
   - Color palette and mood
   - Art style consistency
   - Terrain and landscape features

3) Look for identity drift - where the same character appears different across scenes
4) Small pose/angle differences are acceptable, but identity changes are not

**Weighted Scoring System:**
- Character consistency: 60% of total score
- Environment consistency: 40% of total score
- Final score = (character_score * 0.6) + (environment_score * 0.4)

Important grading rubric:
- 1.0: Perfect visual consistency - characters and environment look identical across images
- 0.8-0.9: Minor variations but clearly the same characters and consistent environment
- 0.5-0.7: Noticeable inconsistencies in some features
- 0.1-0.4: Major visual drift - significant inconsistencies
- 0.0: Complete inconsistency - unrecognizable between images

Return JSON with detailed analysis including both character and environment consistency.
`;

    // Create message with attachments
    const message = {
      role: 'user' as const,
      content: textContent,
      attachments: imageAttachments
    };

    const result = await this.agent.generate([message], {
      output: z.object({
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
            elements: z.array(z.object({
              name: z.string(),
              consistent: z.boolean(),
              notes: z.string()
            })).default([]),
            issues: z.array(z.string()).default([])
          }),
          perImageAnalysis: z.array(z.object({
            imageIndex: z.number(),
            charactersFound: z.array(z.string()).default([]),
            environment: z.string(),
            visualNotes: z.string()
          })).default([]),
          totalImages: z.number().default(0),
          totalCharacters: z.number().default(0),
          consistencyIssues: z.array(z.string()).default([])
        })
      })
    });

    return result.object;
  }
}

export class CharacterVisualConsistencyLLMMetric extends Metric {
  judge: CharacterConsistencyJudge;

  constructor(model: LanguageModel) {
    super();
    this.judge = new CharacterConsistencyJudge(model);
  }

  async measure(input: string, output: string): Promise<MetricResult> {
    // Extract image URLs from the storyboard JSON output
    const imageUrls = this.extractImageUrls(output);
    return this.judge.evaluate(input, output, imageUrls);
  }

  private extractImageUrls(output: string): string[] {
    try {
      // Clean the output by removing markdown code fences
      let cleanedOutput = output.trim();

      // Remove ```json and ``` markers
      if (cleanedOutput.startsWith('```json')) {
        cleanedOutput = cleanedOutput.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleanedOutput.startsWith('```')) {
        cleanedOutput = cleanedOutput.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }

      console.log(`🔍 [CharacterConsistency] Cleaned output for parsing (first 200 chars): ${cleanedOutput.substring(0, 200)}...`);

      // Try to parse the cleaned output as JSON
      const parsed = JSON.parse(cleanedOutput);
      const imageUrls: string[] = [];

      // Look for image URLs in scenes (primary method for storyboard output)
      if (parsed.scenes && Array.isArray(parsed.scenes)) {
        for (const scene of parsed.scenes.slice(0, 5)) { // Only first 5 scenes
          // Check for imagePath field (used by imageGeneratorAgent)
          if (scene.imagePath && typeof scene.imagePath === 'string') {
            imageUrls.push(scene.imagePath);
          }
          // Also check for other possible image URL field names
          if (scene.imageUrl && typeof scene.imageUrl === 'string') {
            imageUrls.push(scene.imageUrl);
          }
          if (scene.generated_image_url && typeof scene.generated_image_url === 'string') {
            imageUrls.push(scene.generated_image_url);
          }
          if (scene.generatedImageUrl && typeof scene.generatedImageUrl === 'string') {
            imageUrls.push(scene.generatedImageUrl);
          }
        }
      }

      // Check for image generation tool output format
      if (parsed.images && Array.isArray(parsed.images)) {
        for (const imageObj of parsed.images.slice(0, 5)) {
          if (typeof imageObj === 'string') {
            imageUrls.push(imageObj);
          } else if (imageObj && typeof imageObj === 'object' && imageObj.imageUrl) {
            imageUrls.push(imageObj.imageUrl);
          }
        }
      }

      // Check for direct base64 data URLs
      if (parsed.generatedImages && Array.isArray(parsed.generatedImages)) {
        for (const imageData of parsed.generatedImages.slice(0, 5)) {
          if (typeof imageData === 'string' && imageData.startsWith('data:image/')) {
            imageUrls.push(imageData);
          }
        }
      }

      console.log(`🖼️ [CharacterConsistency] Extracted ${imageUrls.length} image URLs for analysis`);
      if (imageUrls.length > 0) {
        console.log(`🔍 [CharacterConsistency] Image URL types: ${imageUrls.map(url =>
          url.startsWith('data:') ? 'base64' :
          url.startsWith('http') ? 'web URL' : 'local path'
        ).join(', ')}`);
      }
      return imageUrls;
    } catch (error) {
      console.error('🚫 [CharacterConsistency] Failed to parse output JSON:', error);

      // Fallback: try to extract URLs/base64 data using regex
      const urlRegex = /(https?:\/\/[^\s]+\.(?:jpg|jpeg|png|gif|webp)|data:image\/[^;]+;base64,[A-Za-z0-9+/=]+)/gi;
      const matches = output.match(urlRegex) || [];
      const uniqueUrls = [...new Set(matches)].slice(0, 5);

      console.log(`🔍 [CharacterConsistency] Fallback regex found ${uniqueUrls.length} image URLs/data`);
      return uniqueUrls;
    }
  }
}

// Export a default instance using gpt-4o-mini (vision-capable model)
export const characterVisualConsistencyLLMScorer = new CharacterVisualConsistencyLLMMetric(openai('gpt-4o-mini'));


