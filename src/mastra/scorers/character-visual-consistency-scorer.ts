import { Metric, type MetricResult } from '@mastra/core';
import { MastraAgentJudge } from '@mastra/evals/judge';
import { type LanguageModel } from '@mastra/core/llm';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';
import fs from 'fs';
import path from 'path';

const INSTRUCTIONS = `You are an expert visual consistency judge for storyboards. You analyze actual generated images to evaluate whether character depictions remain visually consistent across multiple scenes.`;

// Helper function to convert local PNG files to base64 data URIs
function imageFileToDataUri(imagePath: string): string {
  console.log(`🔄 [ImageConversion] Starting conversion for: ${imagePath}`);

  try {
    // Resolve project root (same logic as PDF export tool)
    let projectRoot = path.resolve(process.cwd());

    // If we're in .mastra/output, go up to the actual project root
    if (projectRoot.includes('.mastra/output')) {
      projectRoot = path.resolve(projectRoot, '../..');
    }

    // Resolve the image path relative to project root
    const resolvedImagePath = path.isAbsolute(imagePath)
      ? imagePath
      : path.resolve(projectRoot, imagePath);

    console.log(`📁 [ImageConversion] Project root: ${projectRoot}`);
    console.log(`📁 [ImageConversion] Resolved image path: ${resolvedImagePath}`);

    // Check if file exists
    if (!fs.existsSync(resolvedImagePath)) {
      throw new Error(`File does not exist: ${resolvedImagePath}`);
    }

    // Get file stats
    const stats = fs.statSync(resolvedImagePath);
    console.log(`📁 [ImageConversion] File size: ${(stats.size / 1024).toFixed(2)} KB`);

    const imageBuffer = fs.readFileSync(resolvedImagePath);
    console.log(`📖 [ImageConversion] Read ${imageBuffer.length} bytes from file`);

    const base64 = imageBuffer.toString('base64');
    const dataUri = `data:image/png;base64,${base64}`;

    console.log(`✅ [ImageConversion] Successfully converted to data URI (${dataUri.length} chars)`);
    return dataUri;
  } catch (error) {
    console.error(`❌ [ImageConversion] Failed to convert ${imagePath} to data URI:`, error);
    throw new Error(`Failed to convert image file to data URI: ${imagePath}`);
  }
}

class CharacterConsistencyJudge extends MastraAgentJudge {
  constructor(model: LanguageModel) {
    super('CharacterConsistencyJudge', INSTRUCTIONS, model);
    console.log(`🤖 [CharacterConsistencyJudge] Initialized with model: ${model.modelId || 'unknown'}`);
  }

  async evaluate(input: string, output: string, imageUrls: string[] = []): Promise<MetricResult> {
    console.log(`\n🚀 [CharacterConsistencyJudge] Starting evaluation`);
    console.log(`📝 [CharacterConsistencyJudge] Input length: ${input.length} chars`);
    console.log(`📄 [CharacterConsistencyJudge] Output length: ${output.length} chars`);
    console.log(`🖼️ [CharacterConsistencyJudge] Image URLs provided: ${imageUrls.length}`);

    if (imageUrls.length === 0) {
      console.log(`⚠️ [CharacterConsistencyJudge] No images provided, returning zero score`);
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

    console.log(`🔄 [CharacterConsistencyJudge] Processing ${imageUrls.length} images...`);

    // For Mastra agents, we need to pass images differently
    // Convert images to the format expected by Mastra
    const imageAttachments = imageUrls.map((url, index) => {
      console.log(`\n [Image ${index + 1}] Processing: ${url}`);
      try {
        const dataUri = imageFileToDataUri(url);
        console.log(`✅ [Image ${index + 1}] Successfully converted to data URI (${dataUri.length} chars)`);
        return {
          name: `image_${index + 1}`,
          contentType: 'image/png', // Always PNG for this scorer
          data: dataUri
        };
      } catch (error) {
        console.error(`❌ [Image ${index + 1}] Failed to convert: ${url}`, error);
        return null;
      }
    }).filter(Boolean);

    console.log(`✅ [CharacterConsistencyJudge] Successfully processed ${imageAttachments.length}/${imageUrls.length} images`);

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

    console.log(`📤 [CharacterConsistencyJudge] Sending request to AI model...`);
    console.log(`📊 [CharacterConsistencyJudge] Prompt length: ${textContent.length} chars`);
    console.log(`📎 [CharacterConsistencyJudge] Attachments: ${imageAttachments.length}`);

    // Create message with attachments
    const message = {
      role: 'user' as const,
      content: textContent,
      attachments: imageAttachments
    };

    const startTime = Date.now();
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

    const endTime = Date.now();
    const duration = endTime - startTime;

    console.log(`✅ [CharacterConsistencyJudge] AI analysis completed in ${duration}ms`);
    console.log(`📊 [CharacterConsistencyJudge] Final score: ${result.object.score}`);
    console.log(`📝 [CharacterConsistencyJudge] Reason: ${result.object.info.reason}`);
    console.log(`👥 [CharacterConsistencyJudge] Characters analyzed: ${result.object.info.totalCharacters}`);
    console.log(`🖼️ [CharacterConsistencyJudge] Images analyzed: ${result.object.info.totalImages}`);
    console.log(`⚠️ [CharacterConsistencyJudge] Issues found: ${result.object.info.consistencyIssues.length}`);

    return result.object;
  }
}

export class CharacterVisualConsistencyLLMMetric extends Metric {
  judge: CharacterConsistencyJudge;

  constructor(model: LanguageModel) {
    super();
    this.judge = new CharacterConsistencyJudge(model);
    console.log(`📊 [CharacterVisualConsistencyLLMMetric] Metric initialized`);
  }

  async measure(input: string, output: string): Promise<MetricResult> {
    console.log(`\n🎯 [CharacterVisualConsistencyLLMMetric] Starting measurement`);
    console.log(`📝 [CharacterVisualConsistencyLLMMetric] Input: "${input.substring(0, 100)}..."`);
    console.log(`📄 [CharacterVisualConsistencyLLMMetric] Output length: ${output.length} chars`);

    // Extract image URLs from the storyboard JSON output
    const imageUrls = this.extractImageUrls(output);
    console.log(`🖼️ [CharacterVisualConsistencyLLMMetric] Extracted ${imageUrls.length} image URLs`);

    const result = await this.judge.evaluate(input, output, imageUrls);

    console.log(`✅ [CharacterVisualConsistencyLLMMetric] Measurement completed`);
    console.log(`📊 [CharacterVisualConsistencyLLMMetric] Final score: ${result.score}`);

    return result;
  }

  private extractImageUrls(output: string): string[] {
    console.log(`🔍 [ImageExtraction] Starting image URL extraction`);
    console.log(`📄 [ImageExtraction] Raw output length: ${output.length} chars`);

    try {
      // Clean the output by removing markdown code fences
      let cleanedOutput = output.trim();

      // Remove ```json and ``` markers
      if (cleanedOutput.startsWith('```json')) {
        cleanedOutput = cleanedOutput.replace(/^```json\s*/, '').replace(/\s*```$/, '');
        console.log(`🧹 [ImageExtraction] Removed JSON code fences`);
      } else if (cleanedOutput.startsWith('```')) {
        cleanedOutput = cleanedOutput.replace(/^```\s*/, '').replace(/\s*```$/, '');
        console.log(`🧹 [ImageExtraction] Removed generic code fences`);
      }

      console.log(`🔍 [ImageExtraction] Cleaned output (first 200 chars): ${cleanedOutput.substring(0, 200)}...`);

      // Try to parse the cleaned output as JSON
      const parsed = JSON.parse(cleanedOutput);
      console.log(`✅ [ImageExtraction] Successfully parsed JSON`);
      console.log(`🔍 [ImageExtraction] JSON keys: ${Object.keys(parsed).join(', ')}`);

      const imageUrls: string[] = [];

      // Look for image URLs in scenes (primary method for storyboard output)
      if (parsed.scenes && Array.isArray(parsed.scenes)) {
        console.log(`🎬 [ImageExtraction] Found ${parsed.scenes.length} scenes, checking first 5`);
        for (const scene of parsed.scenes.slice(0, 5)) {
          console.log(`🔍 [ImageExtraction] Scene keys: ${Object.keys(scene).join(', ')}`);

          // Check for imagePath field (used by imageGeneratorAgent)
          if (scene.imagePath && typeof scene.imagePath === 'string') {
            imageUrls.push(scene.imagePath);
            console.log(`✅ [ImageExtraction] Found imagePath: ${scene.imagePath}`);
          }
          // Also check for other possible image URL field names
          if (scene.imageUrl && typeof scene.imageUrl === 'string') {
            imageUrls.push(scene.imageUrl);
            console.log(`✅ [ImageExtraction] Found imageUrl: ${scene.imageUrl}`);
          }
          if (scene.generated_image_url && typeof scene.generated_image_url === 'string') {
            imageUrls.push(scene.generated_image_url);
            console.log(`✅ [ImageExtraction] Found generated_image_url: ${scene.generated_image_url}`);
          }
          if (scene.generatedImageUrl && typeof scene.generatedImageUrl === 'string') {
            imageUrls.push(scene.generatedImageUrl);
            console.log(`✅ [ImageExtraction] Found generatedImageUrl: ${scene.generatedImageUrl}`);
          }
        }
      }

      // Check for image generation tool output format
      if (parsed.images && Array.isArray(parsed.images)) {
        console.log(`️ [ImageExtraction] Found ${parsed.images.length} images array, checking first 5`);
        for (const imageObj of parsed.images.slice(0, 5)) {
          if (typeof imageObj === 'string') {
            imageUrls.push(imageObj);
            console.log(`✅ [ImageExtraction] Found string image: ${imageObj}`);
          } else if (imageObj && typeof imageObj === 'object' && imageObj.imageUrl) {
            imageUrls.push(imageObj.imageUrl);
            console.log(`✅ [ImageExtraction] Found object image: ${imageObj.imageUrl}`);
          }
        }
      }

      // Check for direct base64 data URLs
      if (parsed.generatedImages && Array.isArray(parsed.generatedImages)) {
        console.log(`️ [ImageExtraction] Found ${parsed.generatedImages.length} generatedImages, checking first 5`);
        for (const imageData of parsed.generatedImages.slice(0, 5)) {
          if (typeof imageData === 'string' && imageData.startsWith('data:image/')) {
            imageUrls.push(imageData);
            console.log(`✅ [ImageExtraction] Found base64 image (${imageData.length} chars)`);
          }
        }
      }

      console.log(`️ [ImageExtraction] Extracted ${imageUrls.length} image URLs for analysis`);
      if (imageUrls.length > 0) {
        console.log(`🔍 [ImageExtraction] Image URL types: ${imageUrls.map(url =>
          url.startsWith('data:') ? 'base64' :
          url.startsWith('http') ? 'web URL' : 'local path'
        ).join(', ')}`);
      }
      return imageUrls;
    } catch (error) {
      console.error('🚫 [ImageExtraction] Failed to parse output JSON:', error);

      // Fallback: try to extract URLs/base64 data using regex
      console.log(`🔄 [ImageExtraction] Attempting regex fallback extraction`);
      const urlRegex = /(https?:\/\/[^\s]+\.(?:jpg|jpeg|png|gif|webp)|data:image\/[^;]+;base64,[A-Za-z0-9+/=]+)/gi;
      const matches = output.match(urlRegex) || [];
      const uniqueUrls = [...new Set(matches)].slice(0, 5);

      console.log(`🔍 [ImageExtraction] Fallback regex found ${uniqueUrls.length} image URLs/data`);
      return uniqueUrls;
    }
  }
}

// Export a default instance using gpt-4o-mini (vision-capable model)
export const characterVisualConsistencyLLMScorer = new CharacterVisualConsistencyLLMMetric(openai('gpt-4o-mini'));


