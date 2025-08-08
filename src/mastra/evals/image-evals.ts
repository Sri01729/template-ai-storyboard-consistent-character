import { z } from 'zod';

// Define the metric result interface
interface MetricResult {
  score: number;
  info: Record<string, any>;
}

// Helper function to extract JSON from markdown code blocks
function extractJSON(output: string): string {
  console.log('🔍 [JSON Extraction] Original output starts with:', output.substring(0, 100));

  // Remove markdown code block markers
  let cleaned = output;

  // Remove ```json and ``` markers
  cleaned = cleaned.replace(/```json\s*/gi, '');
  cleaned = cleaned.replace(/```\s*$/gi, '');

  // Remove any leading/trailing whitespace
  cleaned = cleaned.trim();

  console.log('🔍 [JSON Extraction] Cleaned output starts with:', cleaned.substring(0, 100));

  return cleaned;
}

// Custom eval for image prompt quality
export class ImagePromptQualityMetric {
  async measure(input: string, output: string): Promise<MetricResult> {
    console.log('🔍 [ImagePromptQualityMetric] Starting evaluation...');
    console.log('🔍 [ImagePromptQualityMetric] Input:', input.substring(0, 100) + '...');
    console.log('🔍 [ImagePromptQualityMetric] Output length:', output.length);

    try {
      // Extract JSON from markdown if needed
      const jsonOutput = extractJSON(output);

      // Parse the output to check if it's valid JSON
      console.log('🔍 [ImagePromptQualityMetric] Attempting to parse JSON...');
      const parsed = JSON.parse(jsonOutput);
      console.log('🔍 [ImagePromptQualityMetric] JSON parsed successfully');
      console.log('🔍 [ImagePromptQualityMetric] Parsed keys:', Object.keys(parsed));

      if (!parsed.images || !Array.isArray(parsed.images) || parsed.images.length === 0) {
        console.log('❌ [ImagePromptQualityMetric] No images array found in output');
        console.log('❌ [ImagePromptQualityMetric] Has images:', !!parsed.images);
        console.log('❌ [ImagePromptQualityMetric] images type:', typeof parsed.images);
        console.log('❌ [ImagePromptQualityMetric] images length:', parsed.images?.length);

        return {
          score: 0,
          info: {
            reason: 'No images array found in output',
            hasImages: !!parsed.images,
            imagesType: typeof parsed.images,
            imagesLength: parsed.images?.length,
            parsedKeys: Object.keys(parsed)
          }
        };
      }

      const firstImage = parsed.images[0];
      if (!firstImage.prompt || typeof firstImage.prompt !== 'string') {
        console.log('❌ [ImagePromptQualityMetric] No prompt found in first image');
        console.log('❌ [ImagePromptQualityMetric] Has prompt:', !!firstImage.prompt);
        console.log('❌ [ImagePromptQualityMetric] prompt type:', typeof firstImage.prompt);

        return {
          score: 0,
          info: {
            reason: 'No prompt found in first image',
            hasPrompt: !!firstImage.prompt,
            promptType: typeof firstImage.prompt,
            firstImageKeys: Object.keys(firstImage)
          }
        };
      }

      const prompt = firstImage.prompt;
      console.log('🔍 [ImagePromptQualityMetric] Image prompt:', prompt.substring(0, 100) + '...');

      const words = prompt.split(' ').length;
      console.log('🔍 [ImagePromptQualityMetric] Word count:', words);

      // Quality heuristics for image prompts
      const hasStyle = /style|artistic|cinematic|anime|comic|watercolor|oil|sketch|pixel|ghibli|disney|cyberpunk|steampunk|fantasy|sci-fi|horror|noir|pop|abstract|impressionistic|surreal|photorealistic/i.test(prompt);
      const hasLighting = /light|lighting|bright|dark|shadow|sunlight|moonlight|candlelight|neon|ambient/i.test(prompt);
      const hasCamera = /camera|angle|shot|close-up|wide|medium|long|extreme|bird's eye|worm's eye|dutch angle/i.test(prompt);
      const hasComposition = /composition|framing|rule of thirds|symmetry|asymmetry|foreground|background|depth|perspective/i.test(prompt);
      const hasColor = /color|hue|saturation|warm|cool|vibrant|muted|monochrome|palette/i.test(prompt);
      const hasMood = /mood|atmosphere|feeling|emotion|dramatic|peaceful|tense|mysterious|romantic/i.test(prompt);

      console.log('🔍 [ImagePromptQualityMetric] Quality checks:', {
        hasStyle, hasLighting, hasCamera, hasComposition, hasColor, hasMood
      });

      let score = 0;
      if (words >= 30) score += 0.2; // Good length
      if (hasStyle) score += 0.2;
      if (hasLighting) score += 0.15;
      if (hasCamera) score += 0.15;
      if (hasComposition) score += 0.1;
      if (hasColor) score += 0.1;
      if (hasMood) score += 0.1;

      const finalScore = Math.min(score, 1);
      console.log('🔍 [ImagePromptQualityMetric] Final score:', finalScore);

      return {
        score: finalScore,
        info: {
          reason: `Image prompt quality: ${(finalScore * 100).toFixed(1)}%`,
          wordCount: words,
          hasStyle,
          hasLighting,
          hasCamera,
          hasComposition,
          hasColor,
          hasMood,
          totalImages: parsed.images.length
        }
      };
    } catch (error) {
      console.log('❌ [ImagePromptQualityMetric] Error parsing JSON:', error);
      return {
        score: 0,
        info: {
          reason: 'Error evaluating image prompt quality',
          error: error instanceof Error ? error.message : 'Unknown error',
          outputPreview: output.substring(0, 200) + '...'
        }
      };
    }
  }
}

// Custom eval for visual consistency
export class VisualConsistencyMetric {
  async measure(input: string, output: string): Promise<MetricResult> {
    console.log('🔍 [VisualConsistencyMetric] Starting evaluation...');
    console.log('🔍 [VisualConsistencyMetric] Input:', input.substring(0, 100) + '...');

    try {
      const jsonOutput = extractJSON(output);
      const parsed = JSON.parse(jsonOutput);
      console.log('🔍 [VisualConsistencyMetric] JSON parsed successfully');

      if (!parsed.images || !Array.isArray(parsed.images) || parsed.images.length === 0) {
        console.log('❌ [VisualConsistencyMetric] No images array found in output');
        return { score: 0, info: { reason: 'No images array found in output' } };
      }

      const firstImage = parsed.images[0];
      if (!firstImage.prompt || typeof firstImage.prompt !== 'string') {
        console.log('❌ [VisualConsistencyMetric] No prompt found in first image');
        return { score: 0, info: { reason: 'No prompt found in first image' } };
      }

      const prompt = firstImage.prompt.toLowerCase();
      const inputLower = input.toLowerCase();

      console.log('🔍 [VisualConsistencyMetric] Prompt length:', prompt.length);
      console.log('🔍 [VisualConsistencyMetric] Input length:', inputLower.length);

      // Check for consistency between input and output
      const inputWords = inputLower.split(' ').filter((word: string) => word.length > 3);
      const promptWords = prompt.split(' ').filter((word: string) => word.length > 3);

      console.log('🔍 [VisualConsistencyMetric] Input words (>3 chars):', inputWords.length);
      console.log('🔍 [VisualConsistencyMetric] Prompt words (>3 chars):', promptWords.length);

      let matchingWords = 0;
      for (const word of inputWords) {
        if (promptWords.includes(word)) {
          matchingWords++;
          console.log(`✅ [VisualConsistencyMetric] Found matching word: "${word}"`);
        }
      }

      const consistencyScore = inputWords.length > 0 ? matchingWords / inputWords.length : 0;
      console.log('🔍 [VisualConsistencyMetric] Consistency score:', consistencyScore, `(${matchingWords}/${inputWords.length} words match)`);

      // Check for visual elements consistency
      const hasVisualElements = /character|scene|setting|object|prop|environment|background/i.test(prompt);
      const hasInputElements = /character|scene|setting|object|prop|environment|background/i.test(inputLower);

      console.log('🔍 [VisualConsistencyMetric] Visual elements check:', {
        hasVisualElements, hasInputElements
      });

      const visualConsistency = (hasVisualElements && hasInputElements) ? 1 : 0.5;

      const finalScore = (consistencyScore + visualConsistency) / 2;
      console.log('🔍 [VisualConsistencyMetric] Final score:', finalScore);

      return {
        score: finalScore,
        info: {
          reason: `Visual consistency: ${(finalScore * 100).toFixed(1)}%`,
          matchingWords,
          totalInputWords: inputWords.length,
          consistencyScore,
          visualConsistency,
          hasVisualElements,
          hasInputElements,
          totalImages: parsed.images.length
        }
      };
    } catch (error) {
      console.log('❌ [VisualConsistencyMetric] Error:', error);
      return {
        score: 0,
        info: {
          reason: 'Error evaluating visual consistency',
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }
}

// Custom eval for technical specifications
export class TechnicalSpecsMetric {
  async measure(input: string, output: string): Promise<MetricResult> {
    console.log('🔍 [TechnicalSpecsMetric] Starting evaluation...');

    try {
      const jsonOutput = extractJSON(output);
      const parsed = JSON.parse(jsonOutput);
      console.log('🔍 [TechnicalSpecsMetric] JSON parsed successfully');

      if (!parsed.images || !Array.isArray(parsed.images) || parsed.images.length === 0) {
        console.log('❌ [TechnicalSpecsMetric] No images array found in output');
        return { score: 0, info: { reason: 'No images array found in output' } };
      }

      const firstImage = parsed.images[0];
      if (!firstImage.prompt || typeof firstImage.prompt !== 'string') {
        console.log('❌ [TechnicalSpecsMetric] No prompt found in first image');
        return { score: 0, info: { reason: 'No prompt found in first image' } };
      }

      const prompt = firstImage.prompt;
      console.log('🔍 [TechnicalSpecsMetric] Image prompt:', prompt.substring(0, 100) + '...');

      let score = 0;
      let totalChecks = 0;

      // Check for technical specifications in prompt
      const hasResolution = /4k|8k|high resolution|hd|ultra hd|megapixel/i.test(prompt);
      if (hasResolution) score += 0.3;
      totalChecks++;
      console.log('🔍 [TechnicalSpecsMetric] Has resolution:', hasResolution);

      const hasQuality = /high quality|professional|detailed|sharp|crisp|clear/i.test(prompt);
      if (hasQuality) score += 0.3;
      totalChecks++;
      console.log('🔍 [TechnicalSpecsMetric] Has quality specs:', hasQuality);

      const hasFormat = /digital art|illustration|photograph|painting|drawing|render/i.test(prompt);
      if (hasFormat) score += 0.2;
      totalChecks++;
      console.log('🔍 [TechnicalSpecsMetric] Has format:', hasFormat);

      const hasAspectRatio = /square|portrait|landscape|widescreen|16:9|4:3|1:1/i.test(prompt);
      if (hasAspectRatio) score += 0.2;
      totalChecks++;
      console.log('🔍 [TechnicalSpecsMetric] Has aspect ratio:', hasAspectRatio);

      // Check metadata if available
      if (firstImage.metadata) {
        const metadata = firstImage.metadata;
        console.log('🔍 [TechnicalSpecsMetric] Metadata found:', metadata);

        if (metadata.quality) score += 0.1;
        if (metadata.aspectRatio) score += 0.1;
        if (metadata.model) score += 0.1;
        totalChecks += 3;
      }

      const finalScore = totalChecks > 0 ? score / totalChecks : 0;
      console.log('🔍 [TechnicalSpecsMetric] Final score:', finalScore);

      return {
        score: finalScore,
        info: {
          reason: `Technical specifications: ${(finalScore * 100).toFixed(1)}%`,
          hasResolution,
          hasQuality,
          hasFormat,
          hasAspectRatio,
          hasMetadata: !!firstImage.metadata,
          totalChecks,
          totalImages: parsed.images.length
        }
      };
    } catch (error) {
      console.log('❌ [TechnicalSpecsMetric] Error:', error);
      return {
        score: 0,
        info: {
          reason: 'Error evaluating technical specifications',
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }
}

// Custom eval for creative elements
export class CreativeElementsMetric {
  async measure(input: string, output: string): Promise<MetricResult> {
    console.log('🔍 [CreativeElementsMetric] Starting evaluation...');

    try {
      const jsonOutput = extractJSON(output);
      const parsed = JSON.parse(jsonOutput);
      console.log('🔍 [CreativeElementsMetric] JSON parsed successfully');

      if (!parsed.images || !Array.isArray(parsed.images) || parsed.images.length === 0) {
        console.log('❌ [CreativeElementsMetric] No images array found in output');
        return { score: 0, info: { reason: 'No images array found in output' } };
      }

      const firstImage = parsed.images[0];
      if (!firstImage.prompt || typeof firstImage.prompt !== 'string') {
        console.log('❌ [CreativeElementsMetric] No prompt found in first image');
        return { score: 0, info: { reason: 'No prompt found in first image' } };
      }

      const prompt = firstImage.prompt;
      console.log('🔍 [CreativeElementsMetric] Image prompt:', prompt.substring(0, 100) + '...');

      let score = 0;
      let totalChecks = 0;

      // Check for creative elements
      const hasImagination = /imaginative|creative|unique|original|innovative|artistic/i.test(prompt);
      if (hasImagination) score += 0.25;
      totalChecks++;
      console.log('🔍 [CreativeElementsMetric] Has imagination:', hasImagination);

      const hasEmotion = /emotional|expressive|dramatic|powerful|moving|impactful/i.test(prompt);
      if (hasEmotion) score += 0.25;
      totalChecks++;
      console.log('🔍 [CreativeElementsMetric] Has emotion:', hasEmotion);

      const hasStorytelling = /narrative|story|scene|moment|action|interaction/i.test(prompt);
      if (hasStorytelling) score += 0.25;
      totalChecks++;
      console.log('🔍 [CreativeElementsMetric] Has storytelling:', hasStorytelling);

      const hasAesthetics = /beautiful|stunning|gorgeous|elegant|sophisticated|aesthetic/i.test(prompt);
      if (hasAesthetics) score += 0.25;
      totalChecks++;
      console.log('🔍 [CreativeElementsMetric] Has aesthetics:', hasAesthetics);

      const finalScore = totalChecks > 0 ? score / totalChecks : 0;
      console.log('🔍 [CreativeElementsMetric] Final score:', finalScore);

      return {
        score: finalScore,
        info: {
          reason: `Creative elements: ${(finalScore * 100).toFixed(1)}%`,
          hasImagination,
          hasEmotion,
          hasStorytelling,
          hasAesthetics,
          totalChecks,
          totalImages: parsed.images.length
        }
      };
    } catch (error) {
      console.log('❌ [CreativeElementsMetric] Error:', error);
      return {
        score: 0,
        info: {
          reason: 'Error evaluating creative elements',
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }
}

// Custom eval for character focus
export class CharacterFocusMetric {
  async measure(input: string, output: string): Promise<MetricResult> {
    console.log('🔍 [CharacterFocusMetric] Starting evaluation...');

    try {
      const jsonOutput = extractJSON(output);
      const parsed = JSON.parse(jsonOutput);
      console.log('🔍 [CharacterFocusMetric] JSON parsed successfully');

      if (!parsed.images || !Array.isArray(parsed.images) || parsed.images.length === 0) {
        console.log('❌ [CharacterFocusMetric] No images array found in output');
        return { score: 0, info: { reason: 'No images array found in output' } };
      }

      const firstImage = parsed.images[0];
      if (!firstImage.prompt || typeof firstImage.prompt !== 'string') {
        console.log('❌ [CharacterFocusMetric] No prompt found in first image');
        return { score: 0, info: { reason: 'No prompt found in first image' } };
      }

      const prompt = firstImage.prompt;
      console.log('🔍 [CharacterFocusMetric] Image prompt:', prompt.substring(0, 100) + '...');

      let score = 0;
      let totalChecks = 0;

      // Check for character-focused elements
      const hasCharacter = /character|person|figure|portrait|face|expression/i.test(prompt);
      if (hasCharacter) score += 0.4;
      totalChecks++;
      console.log('🔍 [CharacterFocusMetric] Has character:', hasCharacter);

      const hasCharacterDetails = /hair|eyes|clothing|costume|outfit|accessories/i.test(prompt);
      if (hasCharacterDetails) score += 0.3;
      totalChecks++;
      console.log('🔍 [CharacterFocusMetric] Has character details:', hasCharacterDetails);

      const hasCharacterAction = /standing|sitting|walking|running|gesturing|posing/i.test(prompt);
      if (hasCharacterAction) score += 0.3;
      totalChecks++;
      console.log('🔍 [CharacterFocusMetric] Has character action:', hasCharacterAction);

      const finalScore = totalChecks > 0 ? score / totalChecks : 0;
      console.log('🔍 [CharacterFocusMetric] Final score:', finalScore);

      return {
        score: finalScore,
        info: {
          reason: `Character focus: ${(finalScore * 100).toFixed(1)}%`,
          hasCharacter,
          hasCharacterDetails,
          hasCharacterAction,
          totalChecks,
          totalImages: parsed.images.length
        }
      };
    } catch (error) {
      console.log('❌ [CharacterFocusMetric] Error:', error);
      return {
        score: 0,
        info: {
          reason: 'Error evaluating character focus',
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }
}

// Export all image-specific evals
export const imageSpecificEvals = {
  promptQuality: new ImagePromptQualityMetric(),
  visualConsistency: new VisualConsistencyMetric(),
  technicalSpecs: new TechnicalSpecsMetric(),
  creativeElements: new CreativeElementsMetric(),
  characterFocus: new CharacterFocusMetric(),
};