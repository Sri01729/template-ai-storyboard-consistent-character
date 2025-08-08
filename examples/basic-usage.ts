/**
 * Basic Usage Example (Non-Streaming)
 *
 * Demonstrates the simplest end-to-end path using non-streaming helpers.
 */

import {
  generateCompleteStoryboardSync,
  storyIdeaToPDFSync,
  scriptToPDFSync,
} from '../src/mastra/index';

async function main() {
  const storyIdea = 'A young inventor builds a flying machine to cross a vast canyon.';

  console.log('\n=== generateCompleteStoryboardSync ===');
  const storyboardResult = await generateCompleteStoryboardSync(storyIdea, {
    style: 'Cinematic',
    numberOfImages: 5,
    exportFormat: 'pdf',
    title: 'The Flight Across The Canyon',
  });
  console.log('Result (truncated):', JSON.stringify(storyboardResult).slice(0, 400) + '...');

  console.log('\n=== storyIdeaToPDFSync ===');
  const pdfFromIdea = await storyIdeaToPDFSync(storyIdea, {
    style: 'Ghibli-esque',
    numberOfImages: 5,
    title: 'Canyon Journey',
    genre: 'adventure',
    tone: 'optimistic',
  });
  console.log('PDF From Idea (truncated):', JSON.stringify(pdfFromIdea).slice(0, 400) + '...');

  console.log('\n=== scriptToPDFSync ===');
  const sampleScript = `EXT. CANYON EDGE - DAY\n\nAn expansive canyon yawns below. The INVENTOR (20s) tightens straps on a homemade glider.\n\nINVENTOR\n(whispers)\nToday we fly.`;
  const pdfFromScript = await scriptToPDFSync(sampleScript, {
    style: 'Cinematic',
    numberOfImages: 4,
    title: 'First Flight',
  });
  console.log('PDF From Script (truncated):', JSON.stringify(pdfFromScript).slice(0, 400) + '...');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

export { main };


