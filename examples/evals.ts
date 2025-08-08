/**
 * Evals Example (Direct Metric Usage)
 *
 * Demonstrates how to directly run implemented eval metrics against
 * inputs/outputs without any extra harness files.
 */

import { storyboardSpecificEvals } from '../src/mastra/evals/storyboard-evals';
import { scriptSpecificEvals } from '../src/mastra/evals/script-evals';

async function main() {
  // Storyboard evals
  const storyboardInput = 'Create a 5-scene storyboard about a mountain rescue.';
  const storyboardOutput = JSON.stringify({
    scenes: [
      {
        sceneNumber: 1,
        storyContent: 'Rescuers gather at dawn, preparing gear.',
        imagePrompt: 'Wide shot, cold blue light, snow, headlamps, breath fogging.',
        location: 'Base camp',
        timeOfDay: 'Dawn',
      },
    ],
  });

  const struct = await storyboardSpecificEvals.structure.measure(
    storyboardInput,
    storyboardOutput
  );
  console.log('Storyboard Structure Score:', struct.score.toFixed(3));

  const visual = await storyboardSpecificEvals.visualPromptQuality.measure(
    storyboardInput,
    storyboardOutput
  );
  console.log('Storyboard Visual Quality Score:', visual.score.toFixed(3));

  // Script evals
  const scriptInput = 'Write a short sci-fi script about a time loop in a subway.';
  const scriptOutput = JSON.stringify({
    title: 'Subway Loop',
    genre: 'sci-fi',
    logline: 'A commuter relives the same train ride and must break the loop.',
    characters: [
      { name: 'Alex', description: 'Observant and anxious', role: 'Protagonist' },
    ],
    scenes: [
      { sceneNumber: 1, description: 'Train departs.', dialogue: 'ALEX: Not again...' },
      { sceneNumber: 2, description: 'Time loop realization.', dialogue: 'ALEX: This is repeating.' },
    ],
  });

  const scriptStruct = await scriptSpecificEvals.structure.measure(
    scriptInput,
    scriptOutput
  );
  console.log('Script Structure Score:', scriptStruct.score.toFixed(3));

  const genreAlign = await scriptSpecificEvals.genreAlignment.measure(
    scriptInput,
    scriptOutput
  );
  console.log('Script Genre Alignment Score:', genreAlign.score.toFixed(3));
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

export { main };


