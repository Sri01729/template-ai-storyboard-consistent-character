import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

const availableStyles = [
  'Cinematic',
  'Photographic',
  'Anime',
  'Manga',
  'Ghibli-esque',
  'Disney-esque',
  'Comic Book',
  'Graphic Novel',
  'Watercolor',
  'Low Poly',
  'Pixel Art',
  'Steampunk',
  'Cyberpunk',
  'Fantasy Art',
  'Film Noir'
];

const styleDescriptions: { [key: string]: string } = {
  'Cinematic': 'Professional film still with photorealistic quality and cinematic lighting',
  'Photographic': 'High-quality photograph with natural lighting and realistic details',
  'Anime': 'Vibrant anime style with cel-shaded characters and detailed backgrounds',
  'Manga': 'Black and white manga panel with screentones and dynamic line work',
  'Ghibli-esque': 'Whimsical hand-drawn animation style with soft color palettes',
  'Disney-esque': 'Classic Disney animation with expressive characters and vibrant colors',
  'Comic Book': 'American comic book art with bold outlines and halftone dots',
  'Graphic Novel': 'Mature graphic novel style with atmospheric lighting and moody colors',
  'Watercolor': 'Beautiful watercolor painting with soft edges and vibrant washes',
  'Low Poly': '3D low poly render with geometric shapes and simple color palette',
  'Pixel Art': '16-bit pixel art with nostalgic retro video game aesthetic',
  'Steampunk': 'Victorian steampunk style with brass details and mechanical elements',
  'Cyberpunk': 'Neon-drenched cyberpunk cityscape with high-tech low-life aesthetic',
  'Fantasy Art': 'Epic fantasy art with dramatic lighting and magical atmosphere',
  'Film Noir': 'Black and white film noir with high contrast and dramatic shadows'
};

export const styleManagerTool = createTool({
  id: 'manageStyles',
  description: 'Manages and validates visual styles for storyboard generation',
  inputSchema: z.object({
    action: z.enum(['list', 'validate', 'describe', 'suggest']).describe('Action to perform'),
    style: z.string().optional().describe('Style to validate or describe'),
    prompt: z.string().optional().describe('Story prompt for style suggestions'),
    preferences: z.array(z.string()).optional().describe('User style preferences'),
  }),
  outputSchema: z.object({
    availableStyles: z.array(z.string()).optional().describe('List of available styles'),
    isValid: z.boolean().optional().describe('Whether the provided style is valid'),
    description: z.string().optional().describe('Description of the style'),
    suggestions: z.array(z.object({
      style: z.string(),
      description: z.string(),
      reason: z.string(),
    })).optional().describe('Suggested styles based on prompt'),
    customStyle: z.object({
      name: z.string(),
      prefix: z.string(),
      suffix: z.string(),
      description: z.string(),
    }).optional().describe('Custom style configuration'),
  }),
  execute: async ({ context }) => {
    const { action, style, prompt, preferences } = context;

    switch (action) {
      case 'list':
        return {
          availableStyles: availableStyles
        };

      case 'validate':
        if (!style) {
          throw new Error('Style parameter is required for validation');
        }
        const isValid = availableStyles.includes(style);
        return {
          isValid,
          description: isValid ? styleDescriptions[style] : undefined,
          availableStyles: isValid ? undefined : availableStyles
        };

      case 'describe':
        if (!style) {
          throw new Error('Style parameter is required for description');
        }
        if (!availableStyles.includes(style)) {
          throw new Error(`Invalid style: ${style}`);
        }
        return {
          description: styleDescriptions[style]
        };

      case 'suggest':
        if (!prompt) {
          throw new Error('Prompt parameter is required for suggestions');
        }

        const promptLower = prompt.toLowerCase();
        const suggestions = [];

        // Analyze prompt content and suggest appropriate styles
        if (promptLower.includes('space') || promptLower.includes('alien') || promptLower.includes('robot')) {
          suggestions.push({
            style: 'Cyberpunk',
            description: styleDescriptions['Cyberpunk'],
            reason: 'Sci-fi elements detected in prompt'
          });
        }

        if (promptLower.includes('magic') || promptLower.includes('wizard') || promptLower.includes('fantasy')) {
          suggestions.push({
            style: 'Fantasy Art',
            description: styleDescriptions['Fantasy Art'],
            reason: 'Fantasy elements detected in prompt'
          });
        }

        if (promptLower.includes('detective') || promptLower.includes('mystery') || promptLower.includes('crime')) {
          suggestions.push({
            style: 'Film Noir',
            description: styleDescriptions['Film Noir'],
            reason: 'Mystery/detective elements detected in prompt'
          });
        }

        if (promptLower.includes('child') || promptLower.includes('family') || promptLower.includes('whimsical')) {
          suggestions.push({
            style: 'Disney-esque',
            description: styleDescriptions['Disney-esque'],
            reason: 'Family-friendly elements detected in prompt'
          });
        }

        // Add default suggestions if none found
        if (suggestions.length === 0) {
          suggestions.push(
            {
              style: 'Cinematic',
              description: styleDescriptions['Cinematic'],
              reason: 'Professional and versatile style for most content'
            },
            {
              style: 'Photographic',
              description: styleDescriptions['Photographic'],
              reason: 'Realistic style for grounded storytelling'
            }
          );
        }

        // Filter by user preferences if provided
        if (preferences && preferences.length > 0) {
          const filteredSuggestions = suggestions.filter(s =>
            preferences.some(pref =>
              s.style.toLowerCase().includes(pref.toLowerCase()) ||
              s.description.toLowerCase().includes(pref.toLowerCase())
            )
          );
          if (filteredSuggestions.length > 0) {
            return { suggestions: filteredSuggestions };
          }
        }

        return { suggestions };

      default:
        throw new Error(`Unknown action: ${action}`);
    }
  },
});