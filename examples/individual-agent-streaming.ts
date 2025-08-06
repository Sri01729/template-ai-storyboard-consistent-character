import { mastra } from '../src/mastra/index.js';

/**
 * Individual Agent Streaming Example
 *
 * This example demonstrates how to use individual agents
 * with streaming capabilities for real-time updates.
 */

async function individualAgentStreamingExample() {
  console.log('🎭 Starting individual agent streaming example...\n');

  try {
    // Get individual agents
    const scriptAgent = mastra.getAgent('scriptGeneratorAgent');
    const storyboardAgent = mastra.getAgent('storyboardAgent');
    const imageAgent = mastra.getAgent('imageGeneratorAgent');
    const exportAgent = mastra.getAgent('exportAgent');

    const storyIdea = "A magical cat helps a lonely child make friends";
    const style = "Ghibli-esque";

    // Step 1: Stream script generation
    console.log('📝 Step 1: Streaming script generation...');
    const scriptStream = await scriptAgent.stream([
      {
        role: 'user',
        content: `Generate a screenplay for this story idea: "${storyIdea}".
        Make it family-friendly with 3 scenes. Include clear scene descriptions.`
      }
    ]);

    let script = '';
    for await (const chunk of scriptStream.textStream) {
      script += chunk;
      process.stdout.write(chunk);
    }
    console.log('\n✅ Script generation completed!\n');

    // Step 2: Stream storyboard creation
    console.log('🎬 Step 2: Streaming storyboard creation...');
    const storyboardStream = await storyboardAgent.stream([
      {
        role: 'user',
        content: `Convert this screenplay into a visual storyboard with detailed scene descriptions and image prompts.
        Use ${style} style. Return in JSON format. Here's the script: ${script}`
      }
    ]);

    let storyboardText = '';
    for await (const chunk of storyboardStream.textStream) {
      storyboardText += chunk;
      process.stdout.write(chunk);
    }
    console.log('\n✅ Storyboard creation completed!\n');

    // Step 3: Stream image generation
    console.log('🖼️  Step 3: Streaming image generation...');
    const imageStream = await imageAgent.stream([
      {
        role: 'user',
        content: `Generate 2 images for this storyboard in ${style} style.
        Make them family-friendly and magical. Storyboard: ${storyboardText.substring(0, 500)}...`
      }
    ]);

    for await (const chunk of imageStream.textStream) {
      process.stdout.write(chunk);
    }
    console.log('\n✅ Image generation completed!\n');

    // Step 4: Stream PDF export
    console.log('📄 Step 4: Streaming PDF export...');
    const exportStream = await exportAgent.stream([
      {
        role: 'user',
        content: `Export this storyboard to PDF format.
        Title: "The Magical Cat".
        Storyboard: ${storyboardText.substring(0, 300)}...`
      }
    ]);

    for await (const chunk of exportStream.textStream) {
      process.stdout.write(chunk);
    }
    console.log('\n✅ PDF export completed!\n');

    console.log('🎉 Individual agent streaming example completed successfully!');

  } catch (error) {
    console.error('❌ Error in individual agent streaming example:', error);
  }
}

// Run the example
individualAgentStreamingExample();