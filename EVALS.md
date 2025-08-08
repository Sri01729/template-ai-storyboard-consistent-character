# Evaluation System (Storyboards & Scripts)

This project implements a lightweight, heuristic-based evaluation suite focused on two agents: storyboard and script. It provides 10 implemented metrics (5 per agent) that score outputs between 0.0–1.0 without requiring LLM-as-judge calls.

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

## Notes & Tips
- Metrics are heuristic and transparent—good for fast feedback.
- Outputs often come wrapped in Markdown code blocks; metrics auto-strip those during JSON parsing.
- For character consistency and flow, ensure scenes have meaningful `storyContent` and sequential `sceneNumber`.
- For dialogue quality, include quotes, ALL‑CAPS speaker labels (if using screenplay style), and sentence variety.

## Requirements
- Env vars required for project runtime: `OPENAI_API_KEY`, `GOOGLE_API_KEY`.
- You can run metrics on any output string that matches the expected JSON shape.

## Not Included (by design)
- No LLM-as-judge scoring.
- No separate CI/CLI harness in this repo (use `examples/evals.ts`).
- No image/export/PDF agent-specific evals at this time.
