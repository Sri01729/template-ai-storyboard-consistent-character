import { mastra } from '../src/mastra/index.js';
import {
  generateCompleteStoryboard,
  generateScript,
  createStoryboard,
  generateStoryboardImages,
  exportStoryboard
} from '../src/mastra/index.js';

/**
 * Complete Workflow Example
 *
 * This example demonstrates the complete storyboard generation pipeline
 * step by step, showing how each component works individually.
 */

async function completeWorkflowExample() {
  console.log('🎬 Starting complete workflow example...\n');

  const storyIdea = "A young wizard discovers a magical book that can bring stories to life";
  const style = "Ghibli-esque";
  const title = "The Living Book";

  try {
    // Step 1: Generate Script
    console.log('📝 Step 1: Generating script...');
    const script = await generateScript(storyIdea, {
      genre: 'fantasy',
      length: 'medium',
      tone: 'whimsical',
      targetAudience: 'family'
    });
    console.log(`✅ Script generated (${script.length} characters)\n`);

    // Step 2: Create Storyboard
    console.log('🎬 Step 2: Creating storyboard...');
    const storyboard = await createStoryboard(script, {
      numberOfImages: 3,
      style: style,
      quality: 'standard'
    });
    console.log(`✅ Storyboard created with ${storyboard.scenes.length} scenes\n`);

    // Step 3: Generate Images
    console.log('🖼️  Step 3: Generating images...');
    const images = await generateStoryboardImages(storyboard, {
      style: style,
      quality: 'standard'
    });
    console.log(`✅ ${images.length} images generated\n`);

    // Step 4: Export to PDF
    console.log('📄 Step 4: Exporting to PDF...');
    const pdfPath = await exportStoryboard(storyboard, {
      format: 'pdf',
      title: title,
      layout: 'storyboard'
    });
    console.log(`✅ PDF exported to: ${pdfPath}\n`);

    // Alternative: Use the complete pipeline
    console.log('🚀 Alternative: Using complete pipeline...');
    const completeResult = await generateCompleteStoryboard(storyIdea, {
      style: style,
      numberOfImages: 3,
      exportFormat: 'pdf',
      title: title
    });
    console.log(`✅ Complete pipeline finished: ${completeResult}\n`);

    console.log('🎉 Complete workflow example finished successfully!');

  } catch (error) {
    console.error('❌ Error in complete workflow:', error);
  }
}

// Run the example
completeWorkflowExample();