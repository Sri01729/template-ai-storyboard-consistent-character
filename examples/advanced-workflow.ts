import { mastra } from '../src/mastra/index.js';
import { runAutomatedAgentNetwork } from '../src/mastra/index.js';

/**
 * Advanced Workflow Example
 *
 * This example demonstrates how to use the automated agent network
 * workflow for complex storyboard generation scenarios.
 */

async function advancedWorkflowExample() {
  console.log('🚀 Starting advanced workflow example...\n');

  try {
    // Example 1: Simple automated workflow
    console.log('📖 Example 1: Simple automated workflow...');
    const result1 = await runAutomatedAgentNetwork(
      "A young detective solves a mystery in a haunted mansion",
      {
        style: "Noir",
        title: "The Haunted Mansion Mystery",
        genre: "mystery",
        tone: "dark"
      }
    );

    console.log('✅ Example 1 completed!');
    console.log(`📄 PDF generated: ${result1}\n`);

    // Example 2: Different style and genre
    console.log('🎨 Example 2: Different style and genre...');
    const result2 = await runAutomatedAgentNetwork(
      "A group of friends discover a portal to a magical world",
      {
        style: "Ghibli-esque",
        title: "The Portal Adventure",
        genre: "adventure",
        tone: "whimsical"
      }
    );

    console.log('✅ Example 2 completed!');
    console.log(`📄 PDF generated: ${result2}\n`);

    // Example 3: Sci-fi story
    console.log('🔬 Example 3: Sci-fi story...');
    const result3 = await runAutomatedAgentNetwork(
      "A robot gains consciousness and questions its purpose",
      {
        style: "Cyberpunk",
        title: "The Awakening",
        genre: "sci-fi",
        tone: "philosophical"
      }
    );

    console.log('✅ Example 3 completed!');
    console.log(`📄 PDF generated: ${result3}\n`);

    // Example 4: Historical drama
    console.log('🏛️  Example 4: Historical drama...');
    const result4 = await runAutomatedAgentNetwork(
      "A young artist struggles to find their voice in Renaissance Italy",
      {
        style: "Oil Painting",
        title: "The Renaissance Artist",
        genre: "drama",
        tone: "inspiring"
      }
    );

    console.log('✅ Example 4 completed!');
    console.log(`📄 PDF generated: ${result4}\n`);

    console.log('🎉 Advanced workflow example completed successfully!');
    console.log('📁 Check the generated-exports/ directory for PDF files');

  } catch (error) {
    console.error('❌ Error in advanced workflow example:', error);
  }
}

// Run the example
advancedWorkflowExample();