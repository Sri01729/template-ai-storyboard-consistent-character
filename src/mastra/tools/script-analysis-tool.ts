import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

export const scriptAnalysisTool = createTool({
  id: 'analyzeScript',
  description: 'Analyzes a script to extract key information like characters, scenes, and dialogue',
  inputSchema: z.object({
    script: z.string().describe('The script content to analyze'),
    analysisType: z.enum(['characters', 'scenes', 'dialogue', 'structure', 'full']).default('full').describe('Type of analysis to perform'),
  }),
  outputSchema: z.object({
    characters: z.array(z.object({
      name: z.string(),
      firstAppearance: z.string(),
      dialogueCount: z.number(),
      description: z.string().optional(),
    })).optional(),
    scenes: z.array(z.object({
      number: z.number(),
      heading: z.string(),
      location: z.string(),
      timeOfDay: z.string(),
      characters: z.array(z.string()),
      action: z.string(),
    })).optional(),
    dialogue: z.array(z.object({
      character: z.string(),
      text: z.string(),
      scene: z.number(),
    })).optional(),
    structure: z.object({
      totalScenes: z.number(),
      totalCharacters: z.number(),
      totalDialogue: z.number(),
      estimatedDuration: z.string(),
      genre: z.string().optional(),
      themes: z.array(z.string()).optional(),
    }).optional(),
    fullAnalysis: z.object({
      summary: z.string(),
      characters: z.array(z.object({
        name: z.string(),
        firstAppearance: z.string(),
        dialogueCount: z.number(),
        description: z.string().optional(),
      })),
      scenes: z.array(z.object({
        number: z.number(),
        heading: z.string(),
        location: z.string(),
        timeOfDay: z.string(),
        characters: z.array(z.string()),
        action: z.string(),
      })),
      structure: z.object({
        totalScenes: z.number(),
        totalCharacters: z.number(),
        totalDialogue: z.number(),
        estimatedDuration: z.string(),
        genre: z.string().optional(),
        themes: z.array(z.string()).optional(),
      }),
    }).optional(),
  }),
  execute: async ({ context }) => {
    const { script, analysisType } = context;

    // Parse the script to extract information
    const lines = script.split('\n').map(line => line.trim()).filter(line => line.length > 0);

    const characters = new Map<string, { firstAppearance: string; dialogueCount: number; description?: string }>();
    const scenes: Array<{ number: number; heading: string; location: string; timeOfDay: string; characters: string[]; action: string }> = [];
    const dialogue: Array<{ character: string; text: string; scene: number }> = [];

    let currentScene = 0;
    let currentSceneHeading = '';
    let currentLocation = '';
    let currentTimeOfDay = '';
    let currentAction = '';

    for (const line of lines) {
      // Detect scene headings (INT./EXT. LOCATION - TIME)
      if (line.match(/^(INT\.|EXT\.|INT\/EXT\.)/)) {
        currentScene++;
        currentSceneHeading = line;

        // Parse location and time
        const match = line.match(/^(INT\.|EXT\.|INT\/EXT\.)\s+(.+?)\s*-\s*(.+)$/);
        if (match) {
          currentLocation = match[2].trim();
          currentTimeOfDay = match[3].trim();
        }

        scenes.push({
          number: currentScene,
          heading: currentSceneHeading,
          location: currentLocation,
          timeOfDay: currentTimeOfDay,
          characters: [],
          action: '',
        });

        currentAction = '';
      }
      // Detect character names (ALL CAPS)
      else if (line.match(/^[A-Z\s]+$/) && line.length > 2 && line.length < 50) {
        const characterName = line.trim();
        if (!characters.has(characterName)) {
          characters.set(characterName, {
            firstAppearance: currentSceneHeading,
            dialogueCount: 0,
          });
        }

        if (scenes.length > 0) {
          const lastScene = scenes[scenes.length - 1];
          if (!lastScene.characters.includes(characterName)) {
            lastScene.characters.push(characterName);
          }
        }
      }
      // Detect dialogue (indented text after character name)
      else if (line.startsWith('  ') || line.startsWith('\t')) {
        const dialogueText = line.trim();
        if (dialogueText.length > 0 && scenes.length > 0) {
          // Find the most recent character
          const lastScene = scenes[scenes.length - 1];
          if (lastScene.characters.length > 0) {
            const lastCharacter = lastScene.characters[lastScene.characters.length - 1];
            dialogue.push({
              character: lastCharacter,
              text: dialogueText,
              scene: currentScene,
            });

            // Update character dialogue count
            const charInfo = characters.get(lastCharacter);
            if (charInfo) {
              charInfo.dialogueCount++;
            }
          }
        }
      }
      // Detect action/description (not dialogue, not character name, not scene heading)
      else if (line.length > 0 && !line.match(/^(INT\.|EXT\.|INT\/EXT\.)/) && !line.match(/^[A-Z\s]+$/) && !line.startsWith('  ') && !line.startsWith('\t')) {
        currentAction += line + ' ';

        if (scenes.length > 0) {
          const lastScene = scenes[scenes.length - 1];
          lastScene.action = currentAction.trim();
        }
      }
    }

    // Calculate structure information
    const totalScenes = scenes.length;
    const totalCharacters = characters.size;
    const totalDialogue = dialogue.length;
    const estimatedDuration = `${Math.ceil(totalScenes * 2)}-${Math.ceil(totalScenes * 3)} minutes`;

    // Try to detect genre based on content
    const scriptText = script.toLowerCase();
    let genre = 'Drama';
    if (scriptText.includes('detective') || scriptText.includes('mystery') || scriptText.includes('crime')) {
      genre = 'Mystery/Thriller';
    } else if (scriptText.includes('space') || scriptText.includes('alien') || scriptText.includes('robot')) {
      genre = 'Science Fiction';
    } else if (scriptText.includes('magic') || scriptText.includes('wizard') || scriptText.includes('fantasy')) {
      genre = 'Fantasy';
    } else if (scriptText.includes('love') || scriptText.includes('romance') || scriptText.includes('relationship')) {
      genre = 'Romance';
    }

    // Extract themes
    const themes: string[] = [];
    if (scriptText.includes('family')) themes.push('Family');
    if (scriptText.includes('friendship')) themes.push('Friendship');
    if (scriptText.includes('love')) themes.push('Love');
    if (scriptText.includes('betrayal')) themes.push('Betrayal');
    if (scriptText.includes('redemption')) themes.push('Redemption');
    if (scriptText.includes('justice')) themes.push('Justice');
    if (scriptText.includes('freedom')) themes.push('Freedom');

    const structure = {
      totalScenes,
      totalCharacters,
      totalDialogue,
      estimatedDuration,
      genre,
      themes: themes.length > 0 ? themes : undefined,
    };

    // Return based on analysis type
    switch (analysisType) {
      case 'characters':
        return {
          characters: Array.from(characters.entries()).map(([name, info]) => ({
            name,
            firstAppearance: info.firstAppearance,
            dialogueCount: info.dialogueCount,
            description: info.description,
          })),
        };

      case 'scenes':
        return { scenes };

      case 'dialogue':
        return { dialogue };

      case 'structure':
        return { structure };

      case 'full':
      default:
        return {
          fullAnalysis: {
            summary: `A ${genre} script with ${totalScenes} scenes, ${totalCharacters} characters, and ${totalDialogue} dialogue exchanges. Estimated duration: ${estimatedDuration}.`,
            characters: Array.from(characters.entries()).map(([name, info]) => ({
              name,
              firstAppearance: info.firstAppearance,
              dialogueCount: info.dialogueCount,
              description: info.description,
            })),
            scenes,
            structure,
          },
        };
    }
  },
});