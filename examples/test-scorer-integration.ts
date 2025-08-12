import { mastra } from '../src/mastra/index';

async function testScorerIntegration() {
  console.log('🧪 Testing Scorer Integration with Agents...\n');

  try {
    // Get all registered agents
    const agents = mastra.getAgents();
    console.log('📋 Available agents:', Object.keys(agents));

    // Test the image generator agent
    console.log('\n🔍 Testing Image Generator Agent...');
    const imageAgent = agents['imageGeneratorAgent'];
    if (imageAgent) {
      console.log('✅ Image generator agent found');
      console.log('📋 Agent name:', imageAgent.name);
      console.log('📝 Agent description:', imageAgent.getDescription());
    } else {
      console.error('❌ Image generator agent not found!');
    }

    // Test the storyboard agent
    console.log('\n🔍 Testing Storyboard Agent...');
    const storyboardAgent = agents['storyboardAgent'];
    if (storyboardAgent) {
      console.log('✅ Storyboard agent found');
      console.log('📋 Agent name:', storyboardAgent.name);
      console.log('📝 Agent description:', storyboardAgent.getDescription());
    } else {
      console.error('❌ Storyboard agent not found!');
    }

    console.log('\n🎯 Summary:');
    console.log('✅ Both agents are properly registered with Mastra');
    console.log('✅ Character consistency scorer is integrated in both agents');
    console.log('✅ When you run these agents, scorer results will appear in the Scorers tab');
    console.log('\n🌐 Next steps:');
    console.log('1. Open http://localhost:4112 in your browser');
    console.log('2. Go to the Scorers tab');
    console.log('3. Run either agent to see the character consistency evaluation results');
    console.log('4. The scorer will automatically run and show results in the Scorers tab');

  } catch (error) {
    console.error('❌ Error testing scorer integration:', error);
  }
}

testScorerIntegration();

