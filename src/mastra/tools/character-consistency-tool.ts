import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

export const characterConsistencyTool = createTool({
  id: 'maintainCharacterConsistency',
  description: 'Maintains consistent character descriptions across storyboard scenes',
  inputSchema: z.object({
    characters: z.array(z.object({
      name: z.string().describe('Character name'),
      description: z.string().describe('Current character description'),
    })).describe('List of characters with their descriptions'),
    scenePrompt: z.string().describe('The scene prompt that needs character consistency'),
    style: z.string().optional().describe('Visual style to consider for character descriptions'),
  }),
  outputSchema: z.object({
    consistentPrompt: z.string().describe('Scene prompt with consistent character descriptions'),
    characterAnchors: z.array(z.object({
      name: z.string(),
      description: z.string(),
      usage: z.string().describe('How the character is used in this scene'),
    })).describe('Character anchors used in this scene'),
    suggestions: z.array(z.string()).optional().describe('Suggestions for improving character consistency'),
  }),
  execute: async ({ context }) => {
    const { characters, scenePrompt, style } = context;

    // Extract character names from the scene prompt
    const characterNames = characters.map(char => char.name);
    const usedCharacters: Array<{ name: string; description: string; usage: string }> = [];

    // Check which characters are mentioned in the scene prompt
    for (const character of characters) {
      const namePattern = new RegExp(`\\b${character.name.replace(/\s+/g, '\\s+')}\\b`, 'i');
      if (namePattern.test(scenePrompt)) {
        usedCharacters.push({
          name: character.name,
          description: character.description,
          usage: 'Present in scene',
        });
      }
    }

    // Build consistent prompt by ensuring character descriptions are included
    let consistentPrompt = scenePrompt;

    // If no characters are explicitly mentioned, try to infer from context
    if (usedCharacters.length === 0) {
      // Look for pronouns or generic terms that might refer to characters
      const pronounPatterns = [
        /\b(he|she|they|him|her|them|his|hers|theirs)\b/gi,
        /\b(man|woman|person|boy|girl|child|adult)\b/gi,
        /\b(protagonist|hero|heroine|villain|character)\b/gi,
      ];

      let hasPronouns = false;
      for (const pattern of pronounPatterns) {
        if (pattern.test(scenePrompt)) {
          hasPronouns = true;
          break;
        }
      }

      if (hasPronouns && characters.length > 0) {
        // Assume the first character is the main character
        usedCharacters.push({
          name: characters[0].name,
          description: characters[0].description,
          usage: 'Inferred main character',
        });
      }
    }

    // Add character descriptions to the prompt if they're not already present
    for (const usedChar of usedCharacters) {
      const namePattern = new RegExp(`\\b${usedChar.name.replace(/\s+/g, '\\s+')}\\b`, 'i');

      // Check if the character description is already in the prompt
      const descriptionWords = usedChar.description.toLowerCase().split(/\s+/);
      const hasDescription = descriptionWords.some(word =>
        word.length > 3 && scenePrompt.toLowerCase().includes(word)
      );

      if (!hasDescription) {
        // Add character description before the character name
        const replacement = `${usedChar.description} ${usedChar.name}`;
        consistentPrompt = consistentPrompt.replace(namePattern, replacement);
      }
    }

    // Style-specific adjustments
    if (style) {
      const styleAdjustments: Record<string, string> = {
        'Anime': ' anime-style character design',
        'Comic Book': ' comic book character design',
        'Film Noir': ' film noir character design',
        'Disney-esque': ' Disney-style character design',
        'Photographic': ' photorealistic character design',
      };

      if (styleAdjustments[style]) {
        consistentPrompt += styleAdjustments[style];
      }
    }

    // Generate suggestions for improving consistency
    const suggestions: string[] = [];

    if (usedCharacters.length === 0) {
      suggestions.push('No characters detected in scene. Consider adding character names or descriptions.');
    }

    if (usedCharacters.length > 1) {
      suggestions.push('Multiple characters detected. Ensure each character has their full description included.');
    }

    if (consistentPrompt.length > 500) {
      suggestions.push('Prompt is quite long. Consider focusing on the most important character details for this scene.');
    }

    return {
      consistentPrompt,
      characterAnchors: usedCharacters,
      suggestions: suggestions.length > 0 ? suggestions : undefined,
    };
  },
});