/**
 * Streaming Example
 *
 * Shows how to use the streaming APIs to track progress in real time.
 */

import {
  generateScript,
  createStoryboard,
  generateStoryboardImages,
  exportStoryboard,
} from '../src/mastra/index';

async function consumeStream(stream: AsyncIterable<any>, label: string) {
  console.log(`\n--- Streaming: ${label} ---`);
  for await (const chunk of stream) {
    // Chunks are opaque by design; log a safe preview
    const preview = typeof chunk === 'string' ? chunk : JSON.stringify(chunk);
    console.log(preview.slice(0, 200));
  }
}

async function main() {
  const idea = 'An astronaut discovers bioluminescent life beneath Europa’s ice.';

  // 1) Generate script
  const scriptStream = await generateScript(idea, {
    genre: 'sci-fi',
    length: 'short',
    tone: 'wonder',
  });
  await consumeStream(scriptStream, 'Script Generation');

  // 2) Convert to storyboard
  const mockScript = 'FADE IN: EXT. EUROPA ICE PLAIN - NIGHT ...';
  const storyboardStream = await createStoryboard(mockScript, {
    style: 'Cinematic',
    numberOfImages: 5,
  });
  await consumeStream(storyboardStream, 'Storyboard Creation');

  // 3) Generate images for storyboard
  const mockStoryboard = { title: 'Europa Lights', scenes: [{ sceneNumber: 1, imagePrompt: '...' }] };
  const imagesStream = await generateStoryboardImages(mockStoryboard, {
    style: 'Photorealistic',
    quality: 'standard',
  });
  await consumeStream(imagesStream, 'Image Generation');

  // 4) Export storyboard
  const exportStream = await exportStoryboard(mockStoryboard, {
    format: 'pdf',
    title: 'Europa Lights',
    layout: 'cinematic',
  });
  await consumeStream(exportStream, 'Export PDF');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

export { main };


