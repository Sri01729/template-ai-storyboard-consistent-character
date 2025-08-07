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

// Custom eval for storyboard scene structure validation
export class StoryboardStructureMetric {
  async measure(input: string, output: string): Promise<MetricResult> {
    console.log('🔍 [StoryboardStructureMetric] Starting evaluation...');
    console.log('🔍 [StoryboardStructureMetric] Input:', input.substring(0, 100) + '...');
    console.log('🔍 [StoryboardStructureMetric] Output length:', output.length);

    try {
      // Extract JSON from markdown if needed
      const jsonOutput = extractJSON(output);

      // Parse the output to check if it's valid JSON with required structure
      console.log('🔍 [StoryboardStructureMetric] Attempting to parse JSON...');
      const parsed = JSON.parse(jsonOutput);
      console.log('🔍 [StoryboardStructureMetric] JSON parsed successfully');
      console.log('🔍 [StoryboardStructureMetric] Parsed keys:', Object.keys(parsed));

      if (!parsed.scenes || !Array.isArray(parsed.scenes)) {
        console.log('❌ [StoryboardStructureMetric] No scenes array found');
        return {
          score: 0,
          info: {
            reason: 'Output does not contain scenes array',
            structure: 'invalid',
            parsedKeys: Object.keys(parsed),
            hasScenes: !!parsed.scenes,
            scenesType: typeof parsed.scenes,
            isArray: Array.isArray(parsed.scenes)
          }
        };
      }

      const scenes = parsed.scenes;
      console.log('🔍 [StoryboardStructureMetric] Found', scenes.length, 'scenes');

      let validScenes = 0;
      const requiredFields = ['sceneNumber', 'storyContent', 'imagePrompt', 'location', 'timeOfDay'];

      for (let i = 0; i < scenes.length; i++) {
        const scene = scenes[i];
        console.log(`🔍 [StoryboardStructureMetric] Analyzing scene ${i + 1}:`, {
          sceneNumber: scene.sceneNumber,
          hasStoryContent: !!scene.storyContent,
          hasImagePrompt: !!scene.imagePrompt,
          hasLocation: !!scene.location,
          hasTimeOfDay: !!scene.timeOfDay
        });

        const hasAllFields = requiredFields.every(field => {
          if (field === 'sceneNumber') {
            const isValid = scene.hasOwnProperty(field) &&
                   (typeof scene[field] === 'string' || typeof scene[field] === 'number') &&
                   (typeof scene[field] === 'string' ? scene[field].toString().trim().length > 0 : true);
            console.log(`🔍 [StoryboardStructureMetric] Field ${field}:`, isValid);
            return isValid;
          } else {
            const isValid = scene.hasOwnProperty(field) &&
                   typeof scene[field] === 'string' &&
                   scene[field].trim().length > 0;
            console.log(`🔍 [StoryboardStructureMetric] Field ${field}:`, isValid);
            return isValid;
          }
        });

        if (hasAllFields) {
          validScenes++;
          console.log(`✅ [StoryboardStructureMetric] Scene ${i + 1} is valid`);
        } else {
          console.log(`❌ [StoryboardStructureMetric] Scene ${i + 1} is invalid`);
        }
      }

      const score = scenes.length > 0 ? validScenes / scenes.length : 0;
      console.log('🔍 [StoryboardStructureMetric] Final score:', score, `(${validScenes}/${scenes.length} valid scenes)`);

      return {
        score,
        info: {
          reason: `${validScenes} out of ${scenes.length} scenes have valid structure`,
          totalScenes: scenes.length,
          validScenes,
          requiredFields
        }
      };
    } catch (error) {
      console.log('❌ [StoryboardStructureMetric] Error parsing JSON:', error);
      return {
        score: 0,
        info: {
          reason: 'Output is not valid JSON',
          error: error instanceof Error ? error.message : 'Unknown error',
          outputPreview: output.substring(0, 200) + '...'
        }
      };
    }
  }
}

// Custom eval for visual prompt quality (simplified)
export class VisualPromptQualityMetric {
  async measure(input: string, output: string): Promise<MetricResult> {
    console.log('🔍 [VisualPromptQualityMetric] Starting evaluation...');

    try {
      const jsonOutput = extractJSON(output);
      const parsed = JSON.parse(jsonOutput);
      console.log('🔍 [VisualPromptQualityMetric] JSON parsed successfully');

      if (!parsed.scenes || !Array.isArray(parsed.scenes)) {
        console.log('❌ [VisualPromptQualityMetric] No scenes found in output');
        return { score: 0, info: { reason: 'No scenes found in output' } };
      }

      const prompts = parsed.scenes
        .map((scene: any) => scene.imagePrompt)
        .filter(Boolean);

      console.log('🔍 [VisualPromptQualityMetric] Found', prompts.length, 'image prompts');

      if (prompts.length === 0) {
        console.log('❌ [VisualPromptQualityMetric] No image prompts found');
        return { score: 0, info: { reason: 'No image prompts found' } };
      }

      // Simple heuristic-based evaluation
      const evaluations = prompts.map((prompt: string, index: number) => {
        console.log(`🔍 [VisualPromptQualityMetric] Analyzing prompt ${index + 1}:`, prompt.substring(0, 50) + '...');

        const words = prompt.split(' ').length;
        const hasCameraAngle = /camera|angle|shot|close-up|wide|medium/i.test(prompt);
        const hasLighting = /light|lighting|bright|dark|shadow/i.test(prompt);
        const hasMood = /mood|atmosphere|feeling|emotion/i.test(prompt);
        const hasCharacterPosition = /character|position|standing|sitting|walking/i.test(prompt);

        let score = 0;
        if (words >= 20) score += 0.3; // Good length
        if (hasCameraAngle) score += 0.2;
        if (hasLighting) score += 0.2;
        if (hasMood) score += 0.15;
        if (hasCharacterPosition) score += 0.15;

        const finalScore = Math.min(score, 1);
        console.log(`🔍 [VisualPromptQualityMetric] Prompt ${index + 1} score:`, finalScore, {
          words, hasCameraAngle, hasLighting, hasMood, hasCharacterPosition
        });

        return finalScore;
      });

      const averageScore = evaluations.reduce((sum: number, score: number) => sum + score, 0) / evaluations.length;
      console.log('🔍 [VisualPromptQualityMetric] Average score:', averageScore);

      return {
        score: averageScore,
        info: {
          reason: `Average visual prompt quality: ${averageScore.toFixed(2)}`,
          individualScores: evaluations,
          totalPrompts: prompts.length
        }
      };
    } catch (error) {
      console.log('❌ [VisualPromptQualityMetric] Error:', error);
      return {
        score: 0,
        info: {
          reason: 'Error evaluating visual prompts',
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }
}

// Custom eval for story content completeness
export class StoryContentCompletenessMetric {
  async measure(input: string, output: string): Promise<MetricResult> {
    console.log('🔍 [StoryContentCompletenessMetric] Starting evaluation...');

    try {
      const jsonOutput = extractJSON(output);
      const parsed = JSON.parse(jsonOutput);
      console.log('🔍 [StoryContentCompletenessMetric] JSON parsed successfully');

      if (!parsed.scenes || !Array.isArray(parsed.scenes)) {
        console.log('❌ [StoryContentCompletenessMetric] No scenes found in output');
        return { score: 0, info: { reason: 'No scenes found in output' } };
      }

      const scenes = parsed.scenes;
      console.log('🔍 [StoryContentCompletenessMetric] Found', scenes.length, 'scenes');

      let totalContentLength = 0;
      let scenesWithContent = 0;

      for (let i = 0; i < scenes.length; i++) {
        const scene = scenes[i];
        if (scene.storyContent && typeof scene.storyContent === 'string') {
          const contentLength = scene.storyContent.trim().length;
          totalContentLength += contentLength;
          console.log(`🔍 [StoryContentCompletenessMetric] Scene ${i + 1} content length:`, contentLength);

          // Consider a scene complete if it has substantial content (at least 50 characters)
          if (contentLength >= 50) {
            scenesWithContent++;
            console.log(`✅ [StoryContentCompletenessMetric] Scene ${i + 1} has sufficient content`);
          } else {
            console.log(`❌ [StoryContentCompletenessMetric] Scene ${i + 1} has insufficient content`);
          }
        } else {
          console.log(`❌ [StoryContentCompletenessMetric] Scene ${i + 1} has no storyContent`);
        }
      }

      const averageContentLength = scenes.length > 0 ? totalContentLength / scenes.length : 0;
      const completenessScore = scenes.length > 0 ? scenesWithContent / scenes.length : 0;

      // Combine length and completeness scores
      const lengthScore = Math.min(averageContentLength / 200, 1); // Normalize to 200 chars
      const finalScore = (completenessScore + lengthScore) / 2;

      console.log('🔍 [StoryContentCompletenessMetric] Final metrics:', {
        averageContentLength: Math.round(averageContentLength),
        scenesWithContent,
        totalScenes: scenes.length,
        completenessScore,
        lengthScore,
        finalScore
      });

      return {
        score: finalScore,
        info: {
          reason: `Story content completeness: ${(finalScore * 100).toFixed(1)}%`,
          averageContentLength: Math.round(averageContentLength),
          scenesWithContent,
          totalScenes: scenes.length,
          completenessScore,
          lengthScore
        }
      };
    } catch (error) {
      console.log('❌ [StoryContentCompletenessMetric] Error:', error);
      return {
        score: 0,
        info: {
          reason: 'Error evaluating story content',
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }
}

// Custom eval for character consistency across scenes (simplified)
export class CharacterConsistencyMetric {
  async measure(input: string, output: string): Promise<MetricResult> {
    console.log('🔍 [CharacterConsistencyMetric] Starting evaluation...');

    try {
      const jsonOutput = extractJSON(output);
      const parsed = JSON.parse(jsonOutput);
      console.log('🔍 [CharacterConsistencyMetric] JSON parsed successfully');

      if (!parsed.scenes || !Array.isArray(parsed.scenes) || parsed.scenes.length < 2) {
        console.log('❌ [CharacterConsistencyMetric] Not enough scenes to evaluate consistency');
        return { score: 1, info: { reason: 'Not enough scenes to evaluate consistency' } };
      }

      const scenes = parsed.scenes;
      console.log('🔍 [CharacterConsistencyMetric] Found', scenes.length, 'scenes');

      const consistencyScores = [];

      // Simple text-based consistency check
      for (let i = 0; i < scenes.length - 1; i++) {
        const currentScene = scenes[i].storyContent || '';
        const nextScene = scenes[i + 1].storyContent || '';

        console.log(`🔍 [CharacterConsistencyMetric] Comparing scenes ${i + 1} and ${i + 2}`);

        // Extract character names (simple heuristic)
        const currentNames = currentScene.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g) || [];
        const nextNames = nextScene.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g) || [];

        console.log(`🔍 [CharacterConsistencyMetric] Scene ${i + 1} names:`, currentNames);
        console.log(`🔍 [CharacterConsistencyMetric] Scene ${i + 2} names:`, nextNames);

        // Check for name overlap
        const commonNames = currentNames.filter((name: string) => nextNames.includes(name));
        const totalNames = new Set([...currentNames, ...nextNames]).size;

        const consistencyScore = totalNames > 0 ? commonNames.length / totalNames : 1;
        consistencyScores.push(consistencyScore);

        console.log(`🔍 [CharacterConsistencyMetric] Consistency score for scenes ${i + 1}-${i + 2}:`, consistencyScore, {
          commonNames, totalNames
        });
      }

      const averageConsistency = consistencyScores.reduce((sum, score) => sum + score, 0) / consistencyScores.length;
      console.log('🔍 [CharacterConsistencyMetric] Average consistency:', averageConsistency);

      return {
        score: averageConsistency,
        info: {
          reason: `Average character consistency: ${(averageConsistency * 100).toFixed(1)}%`,
          individualScores: consistencyScores,
          totalComparisons: consistencyScores.length
        }
      };
    } catch (error) {
      console.log('❌ [CharacterConsistencyMetric] Error:', error);
      return {
        score: 0,
        info: {
          reason: 'Error evaluating character consistency',
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }
}

// Custom eval for scene progression and narrative flow (simplified)
export class NarrativeFlowMetric {
  async measure(input: string, output: string): Promise<MetricResult> {
    console.log('🔍 [NarrativeFlowMetric] Starting evaluation...');

    try {
      const jsonOutput = extractJSON(output);
      const parsed = JSON.parse(jsonOutput);
      console.log('🔍 [NarrativeFlowMetric] JSON parsed successfully');

      if (!parsed.scenes || !Array.isArray(parsed.scenes) || parsed.scenes.length < 2) {
        console.log('❌ [NarrativeFlowMetric] Not enough scenes to evaluate narrative flow');
        return { score: 1, info: { reason: 'Not enough scenes to evaluate narrative flow' } };
      }

      const scenes = parsed.scenes;
      console.log('🔍 [NarrativeFlowMetric] Found', scenes.length, 'scenes');

      // Simple flow evaluation based on scene progression
      let flowScore = 0;
      let totalChecks = 0;

      // Check if scene numbers are sequential
      const sceneNumbers = scenes.map((scene: any) => scene.sceneNumber).filter(Boolean);
      console.log('🔍 [NarrativeFlowMetric] Scene numbers:', sceneNumbers);

      const isSequential = sceneNumbers.every((num: number, index: number) => num === index + 1);
      if (isSequential) flowScore += 0.3;
      totalChecks++;
      console.log('🔍 [NarrativeFlowMetric] Sequential check:', isSequential);

      // Check if scenes have content
      const scenesWithContent = scenes.filter((scene: any) =>
        scene.storyContent && scene.storyContent.trim().length > 0
      ).length;
      const contentRatio = scenesWithContent / scenes.length;
      flowScore += contentRatio * 0.4;
      totalChecks++;
      console.log('🔍 [NarrativeFlowMetric] Content ratio:', contentRatio, `(${scenesWithContent}/${scenes.length})`);

      // Check for logical scene transitions (simple heuristic)
      const hasTransitions = scenes.some((scene: any) =>
        scene.storyContent && /then|next|after|later|meanwhile/i.test(scene.storyContent)
      );
      if (hasTransitions) flowScore += 0.3;
      totalChecks++;
      console.log('🔍 [NarrativeFlowMetric] Has transitions:', hasTransitions);

      const finalScore = totalChecks > 0 ? flowScore / totalChecks : 0;
      console.log('🔍 [NarrativeFlowMetric] Final score:', finalScore);

      return {
        score: finalScore,
        info: {
          reason: `Narrative flow quality: ${(finalScore * 100).toFixed(1)}%`,
          totalScenes: scenes.length,
          isSequential,
          contentRatio,
          hasTransitions
        }
      };
    } catch (error) {
      console.log('❌ [NarrativeFlowMetric] Error:', error);
      return {
        score: 0,
        info: {
          reason: 'Error evaluating narrative flow',
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }
}

// Export all storyboard-specific evals
export const storyboardSpecificEvals = {
  structure: new StoryboardStructureMetric(),
  visualPromptQuality: new VisualPromptQualityMetric(),
  storyContentCompleteness: new StoryContentCompletenessMetric(),
  characterConsistency: new CharacterConsistencyMetric(),
  narrativeFlow: new NarrativeFlowMetric(),
};