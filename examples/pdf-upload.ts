/**
 * PDF Upload Workflow Example
 *
 * Demonstrates generating a storyboard and uploading the resulting PDF using
 * the provided workflow helper.
 */

import { storyIdeaToPDFSync } from '../src/mastra/index';

async function main() {
  const result = await storyIdeaToPDFSync('A chef opens a late-night food truck to help insomniacs.', {
    style: 'Cinematic',
    title: 'Midnight Kitchen',
    numberOfImages: 5,
  });

  console.log('Storyboard Result:', result);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

export { main };


