import { mastra } from '../src/mastra/index';
import { characterVisualConsistencyLLMScorer } from '../src/mastra/scorers/character-visual-consistency-scorer';

async function testScorer() {
  console.log('🧪 Testing Character Consistency Scorer...');

  try {
    // Test data
    const testInput = "A story about a young dragon learning to fly";
    const testOutput = JSON.stringify({
      title: "The Dragon's First Flight",
      scenes: [
        {
          sceneNumber: 1,
          description: "A young dragon sits on a cliff",
          imagePath: "generated-images/scene_1_test.png",
          style: "Fantasy"
        },
        {
          sceneNumber: 2,
          description: "The dragon spreads its wings",
          imagePath: "generated-images/scene_2_test.png",
          style: "Fantasy"
        }
      ]
    });

    console.log('📊 Running scorer...');
    const result = await characterVisualConsistencyLLMScorer.measure(testInput, testOutput);

    console.log('✅ Scorer completed!');
    console.log('📈 Score:', result.score);
    console.log('📝 Reason:', result.info?.reason);
    console.log('👥 Characters:', result.info?.totalCharacters);
    console.log('⚠️ Issues:', result.info?.consistencyIssues?.length || 0);

    // Check if we can access the scorer through Mastra
    console.log('\n🔍 Checking if scorer is registered with Mastra...');

    // Try to get scorer info
    console.log('📋 Scorer name:', characterVisualConsistencyLLMScorer.name);
    console.log('📋 Scorer description:', characterVisualConsistencyLLMScorer.description);

  } catch (error) {
    console.error('❌ Error testing scorer:', error);
  }
}

testScorer();
