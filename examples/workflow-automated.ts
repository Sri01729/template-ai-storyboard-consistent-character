/**
 * Automated Workflow Example
 *
 * Runs the full automated agent network end-to-end.
 */

import { automatedStoryIdeaToPDF } from '../src/mastra/index';

async function main() {
  const storyIdea = 'A retired detective returns for one last cold case.';

  const result = await automatedStoryIdeaToPDF(storyIdea, {
    style: 'Noir',
    numberOfImages: 6,
    title: 'The Last Case',
    genre: 'drama',
    tone: 'melancholic',
  });

  console.log('Automated Result (truncated):', JSON.stringify(result).slice(0, 600) + '...');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

export { main };


