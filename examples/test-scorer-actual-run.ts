import { mastra } from '../src/mastra/index';

async function testScorerWithActualRun() {
  console.log('🧪 Testing Scorer with Actual Agent Run...\n');

  try {
    const agents = mastra.getAgents();
    const storyboardAgent = agents['storyboardAgent'];

    if (!storyboardAgent) {
      console.error('❌ Storyboard agent not found!');
      return;
    }

    console.log('✅ Storyboard agent found');
    console.log('📋 Agent name:', storyboardAgent.name);

    // Test with a simple storyboard generation to trigger the scorer
    console.log('\n🚀 Running storyboard agent to trigger character consistency scorer...');

    const testScript = `Title: The Dragon's First Flight

INT. DRAGON CAVE - DAY
A young dragon named Ember sits in a dark cave, looking nervous.

EMBER
(whispering to himself)
I can do this... I can fly...

EXT. MOUNTAIN CLIFF - DAY
Ember stands at the edge of a cliff, spreading his wings.

EMBER
Here goes nothing!

EXT. SKY - DAY
Ember soars through the sky, his face filled with joy.

EMBER
I'm flying! I'm actually flying!`;

    console.log('📝 Test script length:', testScript.length, 'characters');

    const response = await storyboardAgent.generate([
      {
        role: 'user',
        content: `Convert this script into a storyboard with 3 scenes. Focus on maintaining visual consistency for the dragon character Ember across all scenes.`
      }
    ]);

    console.log('✅ Storyboard agent completed successfully!');
    console.log('📄 Response length:', response.text.length, 'characters');
    console.log('📊 Response preview:', response.text.substring(0, 200) + '...');

    console.log('\n🎯 Next Steps:');
    console.log('1. Open http://localhost:4112 in your browser');
    console.log('2. Go to the Scorers tab');
    console.log('3. You should now see the character consistency scorer results!');
    console.log('4. The scorer ran automatically when the agent generated the storyboard');

  } catch (error) {
    console.error('❌ Error running agent:', error);
  }
}

testScorerWithActualRun();

