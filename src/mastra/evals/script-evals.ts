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

// Custom eval for script structure validation
export class ScriptStructureMetric {
  async measure(input: string, output: string): Promise<MetricResult> {
    console.log('🔍 [ScriptStructureMetric] Starting evaluation...');
    console.log('🔍 [ScriptStructureMetric] Input:', input.substring(0, 100) + '...');
    console.log('🔍 [ScriptStructureMetric] Output length:', output.length);
    
    try {
      // Extract JSON from markdown if needed
      const jsonOutput = extractJSON(output);
      
      // Parse the output to check if it's valid JSON with required structure
      console.log('🔍 [ScriptStructureMetric] Attempting to parse JSON...');
      const parsed = JSON.parse(jsonOutput);
      console.log('🔍 [ScriptStructureMetric] JSON parsed successfully');
      console.log('🔍 [ScriptStructureMetric] Parsed keys:', Object.keys(parsed));

      if (!parsed.title || !parsed.genre || !parsed.logline || !parsed.characters || !parsed.scenes) {
        console.log('❌ [ScriptStructureMetric] Missing required fields');
        console.log('❌ [ScriptStructureMetric] Has title:', !!parsed.title);
        console.log('❌ [ScriptStructureMetric] Has genre:', !!parsed.genre);
        console.log('❌ [ScriptStructureMetric] Has logline:', !!parsed.logline);
        console.log('❌ [ScriptStructureMetric] Has characters:', !!parsed.characters);
        console.log('❌ [ScriptStructureMetric] Has scenes:', !!parsed.scenes);
        
        return {
          score: 0,
          info: {
            reason: 'Output missing required fields: title, genre, logline, characters, or scenes',
            structure: 'invalid',
            parsedKeys: Object.keys(parsed),
            hasTitle: !!parsed.title,
            hasGenre: !!parsed.genre,
            hasLogline: !!parsed.logline,
            hasCharacters: !!parsed.characters,
            hasScenes: !!parsed.scenes
          }
        };
      }

      const requiredFields = ['title', 'genre', 'logline', 'characters', 'scenes'];
      let validFields = 0;

      for (const field of requiredFields) {
        console.log(`🔍 [ScriptStructureMetric] Checking field: ${field}`);
        if (parsed[field]) {
          if (field === 'characters' && Array.isArray(parsed[field])) {
            validFields++;
            console.log(`✅ [ScriptStructureMetric] Field ${field} is valid array with ${parsed[field].length} items`);
          } else if (field === 'scenes' && Array.isArray(parsed[field])) {
            validFields++;
            console.log(`✅ [ScriptStructureMetric] Field ${field} is valid array with ${parsed[field].length} items`);
          } else if (typeof parsed[field] === 'string' && parsed[field].trim().length > 0) {
            validFields++;
            console.log(`✅ [ScriptStructureMetric] Field ${field} is valid string: "${parsed[field].substring(0, 50)}..."`);
          } else {
            console.log(`❌ [ScriptStructureMetric] Field ${field} is invalid:`, typeof parsed[field], parsed[field]);
          }
        } else {
          console.log(`❌ [ScriptStructureMetric] Field ${field} is missing or falsy`);
        }
      }

      const score = validFields / requiredFields.length;
      console.log('🔍 [ScriptStructureMetric] Final score:', score, `(${validFields}/${requiredFields.length} valid fields)`);

      return {
        score,
        info: {
          reason: `${validFields} out of ${requiredFields.length} required fields are valid`,
          totalFields: requiredFields.length,
          validFields,
          requiredFields
        }
      };
    } catch (error) {
      console.log('❌ [ScriptStructureMetric] Error parsing JSON:', error);
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

// Custom eval for dialogue quality
export class DialogueQualityMetric {
  async measure(input: string, output: string): Promise<MetricResult> {
    console.log('🔍 [DialogueQualityMetric] Starting evaluation...');
    
    try {
      const jsonOutput = extractJSON(output);
      const parsed = JSON.parse(jsonOutput);
      console.log('🔍 [DialogueQualityMetric] JSON parsed successfully');
      
      if (!parsed.scenes || !Array.isArray(parsed.scenes)) {
        console.log('❌ [DialogueQualityMetric] No scenes found in output');
        return { score: 0, info: { reason: 'No scenes found in output' } };
      }

      const scenes = parsed.scenes;
      console.log('🔍 [DialogueQualityMetric] Found', scenes.length, 'scenes');
      
      let totalDialogueLength = 0;
      let scenesWithDialogue = 0;
      let dialogueQualityScores = [];

      for (let i = 0; i < scenes.length; i++) {
        const scene = scenes[i];
        console.log(`🔍 [DialogueQualityMetric] Analyzing scene ${i + 1}`);
        
        if (scene.dialogue && typeof scene.dialogue === 'string') {
          const dialogueLength = scene.dialogue.trim().length;
          totalDialogueLength += dialogueLength;
          console.log(`🔍 [DialogueQualityMetric] Scene ${i + 1} dialogue length:`, dialogueLength);

          if (dialogueLength >= 20) {
            scenesWithDialogue++;
            console.log(`✅ [DialogueQualityMetric] Scene ${i + 1} has sufficient dialogue`);
          } else {
            console.log(`❌ [DialogueQualityMetric] Scene ${i + 1} has insufficient dialogue`);
          }

          // Simple dialogue quality heuristics
          const hasQuotes = /["'].*["']/.test(scene.dialogue);
          const hasCharacterNames = /\b[A-Z][A-Z\s]+:/.test(scene.dialogue); // Match ALL CAPS character names
          const hasEmotion = /[!?]/.test(scene.dialogue);
          const hasVariety = /[.!?]/.test(scene.dialogue);

          let qualityScore = 0;
          if (hasQuotes) qualityScore += 0.3;
          if (hasCharacterNames) qualityScore += 0.3;
          if (hasEmotion) qualityScore += 0.2;
          if (hasVariety) qualityScore += 0.2;

          const finalScore = Math.min(qualityScore, 1);
          dialogueQualityScores.push(finalScore);
          
          console.log(`🔍 [DialogueQualityMetric] Scene ${i + 1} quality score:`, finalScore, {
            hasQuotes, hasCharacterNames, hasEmotion, hasVariety, dialogue: scene.dialogue.substring(0, 50) + '...'
          });
        } else {
          console.log(`❌ [DialogueQualityMetric] Scene ${i + 1} has no dialogue`);
        }
      }

      const averageDialogueLength = scenes.length > 0 ? totalDialogueLength / scenes.length : 0;
      const dialoguePresenceScore = scenes.length > 0 ? scenesWithDialogue / scenes.length : 0;
      const averageQualityScore = dialogueQualityScores.length > 0
        ? dialogueQualityScores.reduce((sum: number, score: number) => sum + score, 0) / dialogueQualityScores.length
        : 0;

      // Combine length and quality scores
      const lengthScore = Math.min(averageDialogueLength / 100, 1); // Normalize to 100 chars
      const finalScore = (dialoguePresenceScore + averageQualityScore + lengthScore) / 3;

      console.log('🔍 [DialogueQualityMetric] Final metrics:', {
        averageDialogueLength: Math.round(averageDialogueLength),
        scenesWithDialogue,
        totalScenes: scenes.length,
        dialoguePresenceScore,
        averageQualityScore,
        lengthScore,
        finalScore
      });

      return {
        score: finalScore,
        info: {
          reason: `Dialogue quality: ${(finalScore * 100).toFixed(1)}%`,
          averageDialogueLength: Math.round(averageDialogueLength),
          scenesWithDialogue,
          totalScenes: scenes.length,
          dialoguePresenceScore,
          averageQualityScore,
          lengthScore
        }
      };
    } catch (error) {
      console.log('❌ [DialogueQualityMetric] Error:', error);
      return {
        score: 0,
        info: {
          reason: 'Error evaluating dialogue quality',
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }
}

// Custom eval for character development
export class CharacterDevelopmentMetric {
  async measure(input: string, output: string): Promise<MetricResult> {
    console.log('🔍 [CharacterDevelopmentMetric] Starting evaluation...');
    
    try {
      const jsonOutput = extractJSON(output);
      const parsed = JSON.parse(jsonOutput);
      console.log('🔍 [CharacterDevelopmentMetric] JSON parsed successfully');
      
      if (!parsed.characters || !Array.isArray(parsed.characters)) {
        console.log('❌ [CharacterDevelopmentMetric] No characters found in output');
        return { score: 0, info: { reason: 'No characters found in output' } };
      }

      const characters = parsed.characters;
      console.log('🔍 [CharacterDevelopmentMetric] Found', characters.length, 'characters');
      
      let totalCharacters = characters.length;
      let wellDevelopedCharacters = 0;
      let characterScores = [];

      for (let i = 0; i < characters.length; i++) {
        const character = characters[i];
        console.log(`🔍 [CharacterDevelopmentMetric] Analyzing character ${i + 1}:`, character.name);
        
        let characterScore = 0;

        // Check for required character fields
        if (character.name && typeof character.name === 'string' && character.name.trim().length > 0) {
          characterScore += 0.3;
          console.log(`✅ [CharacterDevelopmentMetric] Character ${i + 1} has valid name: "${character.name}"`);
        } else {
          console.log(`❌ [CharacterDevelopmentMetric] Character ${i + 1} has invalid name:`, character.name);
        }
        
        if (character.description && typeof character.description === 'string' && character.description.trim().length > 10) {
          characterScore += 0.4;
          console.log(`✅ [CharacterDevelopmentMetric] Character ${i + 1} has good description (${character.description.length} chars)`);
        } else {
          console.log(`❌ [CharacterDevelopmentMetric] Character ${i + 1} has poor description:`, character.description);
        }
        
        if (character.role && typeof character.role === 'string' && character.role.trim().length > 0) {
          characterScore += 0.3;
          console.log(`✅ [CharacterDevelopmentMetric] Character ${i + 1} has valid role: "${character.role}"`);
        } else {
          console.log(`❌ [CharacterDevelopmentMetric] Character ${i + 1} has invalid role:`, character.role);
        }

        characterScores.push(characterScore);
        console.log(`🔍 [CharacterDevelopmentMetric] Character ${i + 1} total score:`, characterScore);
        
        if (characterScore >= 0.7) {
          wellDevelopedCharacters++;
          console.log(`✅ [CharacterDevelopmentMetric] Character ${i + 1} is well-developed`);
        } else {
          console.log(`❌ [CharacterDevelopmentMetric] Character ${i + 1} needs development`);
        }
      }

      const averageCharacterScore = characterScores.length > 0
        ? characterScores.reduce((sum: number, score: number) => sum + score, 0) / characterScores.length
        : 0;
      const developmentRatio = totalCharacters > 0 ? wellDevelopedCharacters / totalCharacters : 0;

      // Bonus for having multiple characters
      const characterCountBonus = Math.min(totalCharacters / 5, 1) * 0.2;
      const finalScore = Math.min(averageCharacterScore + characterCountBonus, 1);

      console.log('🔍 [CharacterDevelopmentMetric] Final metrics:', {
        totalCharacters,
        wellDevelopedCharacters,
        averageCharacterScore,
        developmentRatio,
        characterCountBonus,
        finalScore
      });

      return {
        score: finalScore,
        info: {
          reason: `Character development: ${(finalScore * 100).toFixed(1)}%`,
          totalCharacters,
          wellDevelopedCharacters,
          averageCharacterScore,
          developmentRatio,
          characterCountBonus
        }
      };
    } catch (error) {
      console.log('❌ [CharacterDevelopmentMetric] Error:', error);
      return {
        score: 0,
        info: {
          reason: 'Error evaluating character development',
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }
}

// Custom eval for plot coherence
export class PlotCoherenceMetric {
  async measure(input: string, output: string): Promise<MetricResult> {
    console.log('🔍 [PlotCoherenceMetric] Starting evaluation...');
    
    try {
      const jsonOutput = extractJSON(output);
      const parsed = JSON.parse(jsonOutput);
      console.log('🔍 [PlotCoherenceMetric] JSON parsed successfully');
      
      if (!parsed.scenes || !Array.isArray(parsed.scenes) || parsed.scenes.length < 2) {
        console.log('❌ [PlotCoherenceMetric] Not enough scenes to evaluate plot coherence');
        return { score: 1, info: { reason: 'Not enough scenes to evaluate plot coherence' } };
      }

      const scenes = parsed.scenes;
      console.log('🔍 [PlotCoherenceMetric] Found', scenes.length, 'scenes');
      
      let coherenceScore = 0;
      let totalChecks = 0;

      // Check if scene numbers are sequential
      const sceneNumbers = scenes.map((scene: any) => scene.sceneNumber).filter(Boolean);
      console.log('🔍 [PlotCoherenceMetric] Scene numbers:', sceneNumbers);
      
      const isSequential = sceneNumbers.every((num: number, index: number) => num === index + 1);
      if (isSequential) coherenceScore += 0.3;
      totalChecks++;
      console.log('🔍 [PlotCoherenceMetric] Sequential check:', isSequential);

      // Check if scenes have content
      const scenesWithContent = scenes.filter((scene: any) =>
        (scene.description && scene.description.trim().length > 0) ||
        (scene.dialogue && scene.dialogue.trim().length > 0)
      ).length;
      const contentRatio = scenesWithContent / scenes.length;
      coherenceScore += contentRatio * 0.4;
      totalChecks++;
      console.log('🔍 [PlotCoherenceMetric] Content ratio:', contentRatio, `(${scenesWithContent}/${scenes.length})`);

      // Check for logical scene transitions
      const hasTransitions = scenes.some((scene: any) =>
        (scene.description && /then|next|after|later|meanwhile|suddenly/i.test(scene.description)) ||
        (scene.dialogue && /then|next|after|later|meanwhile|suddenly/i.test(scene.dialogue))
      );
      if (hasTransitions) coherenceScore += 0.3;
      totalChecks++;
      console.log('🔍 [PlotCoherenceMetric] Has transitions:', hasTransitions);

      const finalScore = totalChecks > 0 ? coherenceScore / totalChecks : 0;
      console.log('🔍 [PlotCoherenceMetric] Final score:', finalScore);

      return {
        score: finalScore,
        info: {
          reason: `Plot coherence: ${(finalScore * 100).toFixed(1)}%`,
          totalScenes: scenes.length,
          isSequential,
          contentRatio,
          hasTransitions
        }
      };
    } catch (error) {
      console.log('❌ [PlotCoherenceMetric] Error:', error);
      return {
        score: 0,
        info: {
          reason: 'Error evaluating plot coherence',
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }
}

// Custom eval for genre alignment
export class GenreAlignmentMetric {
  async measure(input: string, output: string): Promise<MetricResult> {
    console.log('🔍 [GenreAlignmentMetric] Starting evaluation...');
    
    try {
      const jsonOutput = extractJSON(output);
      const parsed = JSON.parse(jsonOutput);
      console.log('🔍 [GenreAlignmentMetric] JSON parsed successfully');
      
      if (!parsed.genre || typeof parsed.genre !== 'string') {
        console.log('❌ [GenreAlignmentMetric] No genre specified in output');
        return { score: 0, info: { reason: 'No genre specified in output' } };
      }

      const genre = parsed.genre.toLowerCase();
      console.log('🔍 [GenreAlignmentMetric] Genre:', genre);
      
      const allContent = JSON.stringify(parsed).toLowerCase();
      console.log('🔍 [GenreAlignmentMetric] Content length:', allContent.length);
      
      // Genre-specific keyword checks
      const genreKeywords = {
        'drama': ['conflict', 'emotion', 'character', 'relationship', 'tension', 'struggle', 'resilient', 'desperate', 'survival'],
        'comedy': ['funny', 'humor', 'joke', 'laugh', 'amusing', 'witty', 'hilarious'],
        'action': ['fight', 'chase', 'battle', 'explosion', 'weapon', 'danger', 'thrill'],
        'fantasy': ['magic', 'wizard', 'dragon', 'spell', 'enchanted', 'mythical', 'supernatural'],
        'horror': ['scary', 'fear', 'dark', 'monster', 'terrifying', 'nightmare', 'creepy'],
        'romance': ['love', 'romance', 'relationship', 'heart', 'passion', 'affection'],
        'sci-fi': ['technology', 'future', 'space', 'robot', 'alien', 'scientific', 'advanced']
      };

      const keywords = genreKeywords[genre as keyof typeof genreKeywords] || [];
      if (keywords.length === 0) {
        console.log('❌ [GenreAlignmentMetric] Unknown genre, cannot evaluate alignment');
        return { score: 0.5, info: { reason: 'Unknown genre, cannot evaluate alignment' } };
      }

      console.log('🔍 [GenreAlignmentMetric] Keywords to check:', keywords);

      let keywordMatches = 0;
      const matchedKeywords = [];
      
      for (const keyword of keywords) {
        if (allContent.includes(keyword)) {
          keywordMatches++;
          matchedKeywords.push(keyword);
          console.log(`✅ [GenreAlignmentMetric] Found keyword: "${keyword}"`);
        } else {
          console.log(`❌ [GenreAlignmentMetric] Missing keyword: "${keyword}"`);
        }
      }

      const alignmentScore = keywords.length > 0 ? keywordMatches / keywords.length : 0;
      console.log('🔍 [GenreAlignmentMetric] Alignment score:', alignmentScore, `(${keywordMatches}/${keywords.length} keywords found)`);

      return {
        score: alignmentScore,
        info: {
          reason: `Genre alignment (${genre}): ${(alignmentScore * 100).toFixed(1)}%`,
          genre,
          keywordMatches,
          totalKeywords: keywords.length,
          matchedKeywords
        }
      };
    } catch (error) {
      console.log('❌ [GenreAlignmentMetric] Error:', error);
      return {
        score: 0,
        info: {
          reason: 'Error evaluating genre alignment',
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }
}

// Export all script-specific evals
export const scriptSpecificEvals = {
  structure: new ScriptStructureMetric(),
  dialogueQuality: new DialogueQualityMetric(),
  characterDevelopment: new CharacterDevelopmentMetric(),
  plotCoherence: new PlotCoherenceMetric(),
  genreAlignment: new GenreAlignmentMetric(),
};