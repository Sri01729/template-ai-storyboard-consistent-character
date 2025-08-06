import { mastra } from '../src/mastra/index.js';

/**
 * Basic Usage Example
 *
 * This example shows the simplest way to generate a storyboard from a story idea.
 * It uses the automated workflow which handles the entire pipeline automatically.
 */

async function basicStoryboardGeneration() {
  console.log('🎬 Starting basic storyboard generation...\n');

  try {
    // Generate a complete storyboard from a story idea
    const result = await mastra.getWorkflow('automatedAgentNetworkWorkflow').createRun().start({
      inputData: {
        storyIdea: "A brave knight rescues a princess from a dragon in a magical forest",
        style: "Ghibli-esque",
        title: "The Dragon's Forest",
        genre: "fantasy",
        tone: "adventurous"
      }
    });

    if (result.status === 'success') {
      console.log('✅ Storyboard generated successfully!');
      console.log(`📖 Title: ${result.result.title}`);
      console.log(`🎭 Scenes: ${result.result.storyboard.scenes.length}`);
      console.log(`🖼️  Images generated: ${result.result.summary.totalImages}`);
      console.log(`📄 PDF exported: ${result.result.pdfPath}`);

      // Display the first scene as an example
      if (result.result.storyboard.scenes.length > 0) {
        const firstScene = result.result.storyboard.scenes[0];
        console.log('\n📝 First Scene:');
        console.log(`Scene ${firstScene.sceneNumber}: ${firstScene.description.substring(0, 100)}...`);
      }
    } else {
      console.log('❌ Workflow failed');
      console.log('Steps status:');
      Object.entries(result.steps).forEach(([stepName, stepResult]) => {
        console.log(`  ${stepName}: ${stepResult.status}`);
        if (stepResult.status === 'failed' && stepResult.error) {
          console.log(`    Error: ${stepResult.error}`);
        }
      });
    }

  } catch (error) {
    console.error('❌ Error generating storyboard:', error);
  }
}

// Run the example
basicStoryboardGeneration();