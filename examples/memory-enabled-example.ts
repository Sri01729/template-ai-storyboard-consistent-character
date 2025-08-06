import { mastra } from '../src/mastra/index.js';

/**
 * Memory-Enabled Example
 *
 * This example demonstrates how memory works across different threads
 * and resources in the storyboard generator.
 */

async function memoryEnabledExample() {
  console.log('🧠 Starting memory-enabled example...\n');

  try {
    const network = mastra.getNetwork('AI_Storyboard_Generator_Network');
    if (!network) {
      throw new Error('Network not found');
    }

    // First session - establish user preferences
    console.log('👤 Session 1: Setting up user preferences...');
    const response1 = await network.generate(
      'Hi, I\'m Sarah. I love fantasy stories and prefer Ghibli-esque art style.',
      {
        memory: {
          thread: 'sarah_intro',
          resource: 'user_sarah'
        }
      }
    );

    console.log('🤖 Response 1:');
    console.log(response1.text.substring(0, 150) + '...\n');

    // Second session - create a story (should remember preferences)
    console.log('📚 Session 2: Creating a story (should remember preferences)...');
    const response2 = await network.generate(
      'Create a story about a magical forest guardian',
      {
        memory: {
          thread: 'sarah_story_1',
          resource: 'user_sarah' // Same resource, different thread
        }
      }
    );

    console.log('🤖 Response 2:');
    console.log(response2.text.substring(0, 200) + '...\n');

    // Third session - test memory recall
    console.log('🧠 Session 3: Testing memory recall...');
    const response3 = await network.generate(
      'What\'s my name and what art style do I prefer?',
      {
        memory: {
          thread: 'sarah_memory_test',
          resource: 'user_sarah' // Same resource, should remember everything
        }
      }
    );

    console.log('🤖 Response 3 (Memory Test):');
    console.log(response3.text.substring(0, 250) + '...\n');

    // Fourth session - different user (should not have Sarah's memory)
    console.log('👤 Session 4: Different user (should not have Sarah\'s memory)...');
    const response4 = await network.generate(
      'What\'s my name and what art style do I prefer?',
      {
        memory: {
          thread: 'mike_test',
          resource: 'user_mike' // Different resource, should not know about Sarah
        }
      }
    );

    console.log('🤖 Response 4 (Different User):');
    console.log(response4.text.substring(0, 200) + '...\n');

    // Fifth session - back to Sarah (should remember everything)
    console.log('👤 Session 5: Back to Sarah (should remember everything)...');
    const response5 = await network.generate(
      'Can you create another story in my preferred style?',
      {
        memory: {
          thread: 'sarah_story_2',
          resource: 'user_sarah' // Back to Sarah's resource
        }
      }
    );

    console.log('🤖 Response 5 (Back to Sarah):');
    console.log(response5.text.substring(0, 200) + '...\n');

    console.log('✅ Memory-enabled example completed successfully!');

  } catch (error) {
    console.error('❌ Error in memory-enabled example:', error);
  }
}

// Run the example
memoryEnabledExample();