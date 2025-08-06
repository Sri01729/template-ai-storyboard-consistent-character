import { mastra } from '../src/mastra/index.js';

/**
 * Agent Network Example
 *
 * This example demonstrates how to use the NewAgentNetwork (vNext)
 * with memory capabilities for storyboard generation.
 */

async function agentNetworkExample() {
  console.log('🤖 Starting Agent Network example...\n');

  try {
    // Get the vNext network with memory
    const network = mastra.getNetwork('AI_Storyboard_Generator_Network');

    // First interaction - establish context
    console.log('💬 First interaction: Setting up story context...');
    const response1 = await network.generate({
      messages: [{
        role: 'user',
        content: 'I want to create a storyboard about a robot learning to paint. My name is Alex.'
      }],
      memory: {
        thread: 'alex_story_1',
        resource: 'user_alex'
      }
    });

    console.log('🤖 Network Response 1:');
    console.log(response1.text.substring(0, 200) + '...\n');

    // Second interaction - network should remember the user and context
    console.log('💬 Second interaction: Adding more details...');
    const response2 = await network.generate({
      messages: [{
        role: 'user',
        content: 'Can you make it in Ghibli-esque style and add 3 scenes?'
      }],
      memory: {
        thread: 'alex_story_2',
        resource: 'user_alex' // Same resource, different thread
      }
    });

    console.log('🤖 Network Response 2:');
    console.log(response2.text.substring(0, 200) + '...\n');

    // Third interaction - test memory recall
    console.log('💬 Third interaction: Testing memory...');
    const response3 = await network.generate({
      messages: [{
        role: 'user',
        content: 'What is my name and what story are we working on?'
      }],
      memory: {
        thread: 'alex_story_3',
        resource: 'user_alex' // Same resource, should remember everything
      }
    });

    console.log('🤖 Network Response 3 (Memory Test):');
    console.log(response3.text.substring(0, 300) + '...\n');

    console.log('✅ Agent Network example completed successfully!');

  } catch (error) {
    console.error('❌ Error in Agent Network example:', error);
  }
}

// Run the example
agentNetworkExample();