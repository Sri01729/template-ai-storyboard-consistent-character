import { mastra } from '../src/mastra/index.js';

/**
 * Automated Workflow Example
 *
 * This example demonstrates how to use the automated workflow
 * for different storyboard generation scenarios.
 */

async function automatedWorkflowExample() {
  console.log('🤖 Starting automated workflow example...\n');

  try {
    // Scenario 1: Fantasy Adventure
    console.log('🐉 Scenario 1: Fantasy Adventure...');
    const result1 = await mastra.getWorkflow('automatedAgentNetworkWorkflow').createRun().start({
      inputData: {
        storyIdea: "A young dragon rider discovers an ancient prophecy",
        style: "Fantasy",
        title: "The Dragon Rider's Prophecy",
        genre: "fantasy",
        tone: "epic"
      }
    });

    console.log('✅ Fantasy scenario completed!');
    console.log(`📄 PDF: ${result1.result.pdfPath}\n`);

    // Scenario 2: Modern Mystery
    console.log('🔍 Scenario 2: Modern Mystery...');
    const result2 = await mastra.getWorkflow('automatedAgentNetworkWorkflow').createRun().start({
      inputData: {
        storyIdea: "A detective solves a case using social media clues",
        style: "Photorealistic",
        title: "Digital Detective",
        genre: "mystery",
        tone: "suspenseful"
      }
    });

    console.log('✅ Mystery scenario completed!');
    console.log(`📄 PDF: ${result2.result.pdfPath}\n`);

    // Scenario 3: Sci-Fi Comedy
    console.log('🤖 Scenario 3: Sci-Fi Comedy...');
    const result3 = await mastra.getWorkflow('automatedAgentNetworkWorkflow').createRun().start({
      inputData: {
        storyIdea: "A robot butler causes chaos at a fancy dinner party",
        style: "Cartoon",
        title: "The Robot Butler's Mishap",
        genre: "comedy",
        tone: "humorous"
      }
    });

    console.log('✅ Comedy scenario completed!');
    console.log(`📄 PDF: ${result3.result.pdfPath}\n`);

    // Scenario 4: Historical Drama
    console.log('🏛️  Scenario 4: Historical Drama...');
    const result4 = await mastra.getWorkflow('automatedAgentNetworkWorkflow').createRun().start({
      inputData: {
        storyIdea: "A young woman fights for women's suffrage in 1920s America",
        style: "Oil Painting",
        title: "Votes for Women",
        genre: "drama",
        tone: "inspiring"
      }
    });

    console.log('✅ Historical scenario completed!');
    console.log(`📄 PDF: ${result4.result.pdfPath}\n`);

    console.log('🎉 Automated workflow example completed successfully!');
    console.log('📁 Check the generated-exports/ directory for all PDF files');

  } catch (error) {
    console.error('❌ Error in automated workflow example:', error);
  }
}

// Run the example
automatedWorkflowExample();