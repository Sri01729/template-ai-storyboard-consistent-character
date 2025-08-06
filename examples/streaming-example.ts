import { mastra } from '../src/mastra/index.js';
import {
  streamScriptGeneration,
  streamStoryboardCreation,
  streamImageGeneration,
  streamPDFExport
} from '../src/mastra/index.js';

/**
 * Streaming Example
 *
 * This example demonstrates how to use the streaming functions
 * for real-time progress updates during storyboard generation.
 */

async function streamingExample() {
  console.log('🌊 Starting streaming example...\n');

  const storyIdea = "A time traveler visits ancient Egypt and meets a young pharaoh";
  const style = "Cinematic";

  try {
    // Stream script generation
    console.log('📝 Streaming script generation...');
    const scriptStream = await streamScriptGeneration(storyIdea, {
      genre: 'adventure',
      tone: 'epic',
      title: 'The Time Traveler\'s Pharaoh'
    });

    let script = '';
    for await (const chunk of scriptStream.stream) {
      if (chunk.type === 'text-delta') {
        script += chunk.textDelta;
        process.stdout.write(chunk.textDelta);
      }
    }
    console.log('\n✅ Script generation completed!\n');

    // Stream storyboard creation
    console.log('🎬 Streaming storyboard creation...');
    const storyboardStream = await streamStoryboardCreation(script, {
      style: style,
      numberOfImages: 2,
      title: 'The Time Traveler\'s Pharaoh'
    });

    let storyboardText = '';
    for await (const chunk of storyboardStream.stream) {
      if (chunk.type === 'text-delta') {
        storyboardText += chunk.textDelta;
        process.stdout.write(chunk.textDelta);
      }
    }
    console.log('\n✅ Storyboard creation completed!\n');

    // Stream image generation
    console.log('🖼️  Streaming image generation...');
    const imageStream = await streamImageGeneration(storyboardText, {
      style: style,
      numberOfImages: 2
    });

    for await (const chunk of imageStream.stream) {
      if (chunk.type === 'text-delta') {
        process.stdout.write(chunk.textDelta);
      }
    }
    console.log('\n✅ Image generation completed!\n');

    // Stream PDF export
    console.log('📄 Streaming PDF export...');
    const pdfStream = await streamPDFExport(storyboardText, {
      title: 'The Time Traveler\'s Pharaoh',
      format: 'pdf'
    });

    for await (const chunk of pdfStream.stream) {
      if (chunk.type === 'text-delta') {
        process.stdout.write(chunk.textDelta);
      }
    }
    console.log('\n✅ PDF export completed!\n');

    console.log('🎉 Streaming example completed successfully!');

  } catch (error) {
    console.error('❌ Error in streaming example:', error);
  }
}

// Run the example
streamingExample();