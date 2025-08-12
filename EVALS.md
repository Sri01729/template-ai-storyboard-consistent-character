# Evaluation System (Storyboards, Scripts & Images)

This project implements a comprehensive evaluation suite covering three agents: storyboard, script, and image generation. It provides 11 implemented metrics that score outputs between 0.0–1.0, including both heuristic-based evaluations and advanced vision-based analysis using LLM-as-judge for visual consistency.

## Implemented Metrics

### Storyboard Metrics (`src/mastra/evals/storyboard-evals.ts`)
- **Structure**: Valid JSON with required fields per scene (`sceneNumber`, `storyContent`, `imagePrompt`, `location`, `timeOfDay`).
- **Visual Prompt Quality**: Prompt depth (length), camera/angle, lighting, mood, character positioning.
- **Story Content Completeness**: Presence and length of `storyContent` across scenes.
- **Character Consistency**: Overlap of character mentions between adjacent scenes.
- **Narrative Flow**: Sequential scene numbering, content presence, transition cues (e.g., then/next/later).

### Script Metrics (`src/mastra/evals/script-evals.ts`)
- **Structure**: Required top-level fields (`title`, `genre`, `logline`, `characters[]`, `scenes[]`).
- **Dialogue Quality**: Presence/length of dialogue; quotes, character name markers, emotion/variety cues.
- **Character Development**: Name/description/role completeness with a per-character score.
- **Plot Coherence**: Sequential scenes, content presence, transition cues.
- **Genre Alignment**: Keyword alignment for common genres (drama, comedy, action, fantasy, horror, romance, sci‑fi).

### Image Generation Metrics (`src/mastra/scorers/character-visual-consistency-scorer.ts`)
- **Character & Environment Visual Consistency**: Vision-based analysis using GPT-4o-mini to evaluate:
  - **Character Consistency (60% weight)**: Facial features, hair, clothing, body proportions, distinctive marks across images
  - **Environment Consistency (40% weight)**: Setting, lighting, atmosphere, background elements, color palette, art style
  - **Multi-modal Processing**: Converts local image paths to base64 data URIs for LLM vision analysis
  - **Weighted Scoring**: Final score = (character_score * 0.6) + (environment_score * 0.4)
  - **Detailed Analysis**: Per-character breakdown, per-image analysis, and specific consistency issues

## Scoring (0.0–1.0)
- **0.9–1.0**: Excellent
- **0.8–0.89**: Good
- **0.7–0.79**: Acceptable
- **0.6–0.69**: Needs improvement
- **< 0.6**: Poor

## How to Run

### Easiest: run the example script
```bash
# From project root (ensure OPENAI_API_KEY and GOOGLE_API_KEY are set)
npx tsx examples/evals.ts
```

### Direct metric call
```ts
import { storyboardSpecificEvals } from './src/mastra/evals/storyboard-evals';

const input = 'Create a 5-scene storyboard about a mountain rescue.';
const output = JSON.stringify({
  scenes: [
    {
      sceneNumber: 1,
      storyContent: 'Rescuers gather at dawn, preparing gear.',
      imagePrompt: 'Wide shot, cold blue light, snow, headlamps.',
      location: 'Base camp',
      timeOfDay: 'Dawn',
    },
  ],
});

const result = await storyboardSpecificEvals.structure.measure(input, output);
console.log('Structure Score:', result.score, result.info);
```

### Script eval example
```ts
import { scriptSpecificEvals } from './src/mastra/evals/script-evals';

const input = 'Write a short sci-fi script about a time loop in a subway.';
const output = JSON.stringify({
  title: 'Subway Loop',
  genre: 'sci-fi',
  logline: 'A commuter relives the same ride and must break the loop.',
  characters: [{ name: 'Alex', description: 'Observant and anxious', role: 'Protagonist' }],
  scenes: [
    { sceneNumber: 1, description: 'Train departs.', dialogue: 'ALEX: Not again...' },
    { sceneNumber: 2, description: 'Realization.', dialogue: 'ALEX: This is repeating.' },
  ],
});

const genre = await scriptSpecificEvals.genreAlignment.measure(input, output);
console.log('Genre Alignment:', genre.score, genre.info);
```

### Image consistency eval example
```ts
import { characterVisualConsistencyLLMScorer } from './src/mastra/scorers/character-visual-consistency-scorer';

const storyboardJson = JSON.stringify({
  scenes: [
    {
      sceneNumber: 1,
      imagePath: "generated-images/scene_1_forest_001.png"
    },
    {
      sceneNumber: 2,
      imagePath: "generated-images/scene_1_forest_002.png"
    }
  ]
});

const result = await characterVisualConsistencyLLMScorer.measure(
  "Create a storyboard with consistent characters",
  storyboardJson
);

console.log('Visual Consistency:', result.score, result.info);
```

### Testing with sample images
```bash
# Test the vision-based evaluation with provided sample images
npx tsx examples/test-character-consistency.ts
```

This uses the 5 forest scene images in `generated-images/` to demonstrate:
- Multi-modal LLM analysis of actual generated images
- Character consistency across scenes (Young Explorer, Crow Companion)
- Environment consistency (forest setting, lighting, atmosphere)
- Weighted scoring system with detailed breakdowns

## Notes & Tips
- **Heuristic metrics** are transparent and provide fast feedback for structure and content analysis.
- **Vision-based metrics** use GPT-4o-mini for advanced multi-modal analysis of actual generated images.
- Outputs often come wrapped in Markdown code blocks; metrics auto-strip those during JSON parsing.
- For character consistency and flow, ensure scenes have meaningful `storyContent` and sequential `sceneNumber`.
- For dialogue quality, include quotes, ALL‑CAPS speaker labels (if using screenplay style), and sentence variety.
- **Image paths** in storyboard JSON should use `imagePath` field (primary) or `imageUrl` (fallback) for vision evaluation.
- **Local images** are automatically converted to base64 data URIs for LLM vision analysis.
- **Vision evaluation** requires `OPENAI_API_KEY` for GPT-4o-mini access.

## Requirements
- Env vars required for project runtime: `OPENAI_API_KEY`, `GOOGLE_API_KEY`.
- You can run metrics on any output string that matches the expected JSON shape.

## Not Included (by design)
- No LLM-as-judge scoring for text-based metrics (heuristic approach for speed).
- No separate CI/CLI harness in this repo (use `examples/evals.ts` and `examples/test-character-consistency.ts`).
- No export/PDF agent-specific evals at this time.

## Vision-Based Evaluation Features
- **Multi-modal Analysis**: Processes actual generated images using GPT-4o-mini vision capabilities
- **Automatic Image Processing**: Converts local file paths to base64 data URIs for LLM analysis
- **Mastra Integration**: Uses `MastraAgentJudge` with proper attachment format for seamless integration
- **JSON Extraction**: Automatically extracts image paths from storyboard JSON output
- **Weighted Scoring**: Character consistency (60%) + Environment consistency (40%) = Final score
- **Detailed Reporting**: Per-character analysis, per-image breakdown, and specific consistency issues
