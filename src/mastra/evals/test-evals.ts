import { storyboardSpecificEvals } from './storyboard-evals';

// Test data for storyboard evaluation
const testScript = `
A young wizard named Alex discovers a mysterious book in the attic.
As Alex opens it, magical symbols begin to glow. Suddenly, a small
dragon appears from the pages, looking confused and lost. Alex
decides to help the dragon find its way back home.
`;

const expectedStoryboardOutput = JSON.stringify({
  scenes: [
    {
      sceneNumber: 1,
      storyContent: "Alex, a young wizard, explores the dusty attic of their family home. They discover an old, mysterious book covered in strange symbols.",
      imagePrompt: "A dimly lit attic with wooden beams, dust particles floating in the air. Alex, a young wizard in robes, holds a mysterious book with glowing symbols. Camera angle: medium shot from slightly above. Lighting: warm, atmospheric with dust motes catching the light.",
      location: "Attic",
      timeOfDay: "Day"
    },
    {
      sceneNumber: 2,
      storyContent: "As Alex opens the book, the magical symbols begin to glow with an ethereal light. The air around the book shimmers with magical energy.",
      imagePrompt: "Close-up shot of Alex's hands holding the open book. Magical symbols glow with bright blue light, casting shadows on Alex's face. Camera angle: close-up. Lighting: dramatic with the book as the main light source.",
      location: "Attic",
      timeOfDay: "Day"
    },
    {
      sceneNumber: 3,
      storyContent: "Suddenly, a small dragon emerges from the pages of the book, looking confused and lost. The dragon is about the size of a cat and has shimmering scales.",
      imagePrompt: "Medium shot showing Alex's surprised expression as a small dragon materializes from the book. The dragon has shimmering scales and looks confused. Camera angle: medium shot. Lighting: magical glow from the book illuminates both characters.",
      location: "Attic",
      timeOfDay: "Day"
    },
    {
      sceneNumber: 4,
      storyContent: "Alex and the dragon make eye contact. The dragon seems scared and lost, while Alex shows concern and curiosity.",
      imagePrompt: "Two-shot of Alex and the small dragon looking at each other. Alex crouches down to the dragon's level with a gentle expression. Camera angle: eye-level medium shot. Lighting: soft, warm light from the attic window.",
      location: "Attic",
      timeOfDay: "Day"
    },
    {
      sceneNumber: 5,
      storyContent: "Alex decides to help the dragon find its way back home. They carefully pick up the dragon and the book, ready to begin their adventure.",
      imagePrompt: "Wide shot of Alex holding the small dragon gently in their arms, with the magical book tucked under their arm. They stand near the attic window, ready to leave. Camera angle: wide shot. Lighting: natural light from the window creates a hopeful atmosphere.",
      location: "Attic",
      timeOfDay: "Day"
    }
  ]
});

// Test function to run all evals
export async function runStoryboardEvals() {
  console.log('🧪 Running Storyboard Evaluation Tests...\n');

  try {
    // Test Structure Metric
    console.log('📋 Testing Structure Validation...');
    const structureResult = await storyboardSpecificEvals.structure.measure(testScript, expectedStoryboardOutput);
    console.log(`   Score: ${structureResult.score.toFixed(2)}`);
    console.log(`   Info: ${structureResult.info.reason}\n`);

    // Test Visual Prompt Quality
    console.log('🎨 Testing Visual Prompt Quality...');
    const visualQualityResult = await storyboardSpecificEvals.visualPromptQuality.measure(testScript, expectedStoryboardOutput);
    console.log(`   Score: ${visualQualityResult.score.toFixed(2)}`);
    console.log(`   Info: ${visualQualityResult.info.reason}\n`);

    // Test Story Content Completeness
    console.log('📖 Testing Story Content Completeness...');
    const completenessResult = await storyboardSpecificEvals.storyContentCompleteness.measure(testScript, expectedStoryboardOutput);
    console.log(`   Score: ${completenessResult.score.toFixed(2)}`);
    console.log(`   Info: ${completenessResult.info.reason}\n`);

    // Test Character Consistency
    console.log('👥 Testing Character Consistency...');
    const consistencyResult = await storyboardSpecificEvals.characterConsistency.measure(testScript, expectedStoryboardOutput);
    console.log(`   Score: ${consistencyResult.score.toFixed(2)}`);
    console.log(`   Info: ${consistencyResult.info.reason}\n`);

    // Test Narrative Flow
    console.log('🌊 Testing Narrative Flow...');
    const flowResult = await storyboardSpecificEvals.narrativeFlow.measure(testScript, expectedStoryboardOutput);
    console.log(`   Score: ${flowResult.score.toFixed(2)}`);
    console.log(`   Info: ${flowResult.info.reason}\n`);

    // Calculate overall score
    const overallScore = (
      structureResult.score +
      visualQualityResult.score +
      completenessResult.score +
      consistencyResult.score +
      flowResult.score
    ) / 5;

    console.log('📊 Overall Evaluation Results:');
    console.log(`   Structure: ${structureResult.score.toFixed(2)}`);
    console.log(`   Visual Quality: ${visualQualityResult.score.toFixed(2)}`);
    console.log(`   Completeness: ${completenessResult.score.toFixed(2)}`);
    console.log(`   Consistency: ${consistencyResult.score.toFixed(2)}`);
    console.log(`   Flow: ${flowResult.score.toFixed(2)}`);
    console.log(`   Overall Score: ${overallScore.toFixed(2)}`);

    return {
      structure: structureResult,
      visualQuality: visualQualityResult,
      completeness: completenessResult,
      consistency: consistencyResult,
      flow: flowResult,
      overall: overallScore
    };

  } catch (error) {
    console.error('❌ Error running evals:', error);
    throw error;
  }
}

// Test function to evaluate actual agent output
export async function evaluateStoryboardAgent(agentOutput: string) {
  console.log('🤖 Evaluating Agent Output...\n');

  try {
    const results = await runStoryboardEvals();

    // Determine quality level
    let qualityLevel = 'Poor';
    if (results.overall >= 0.8) qualityLevel = 'Excellent';
    else if (results.overall >= 0.7) qualityLevel = 'Good';
    else if (results.overall >= 0.6) qualityLevel = 'Acceptable';
    else if (results.overall >= 0.5) qualityLevel = 'Needs Improvement';

    console.log(`\n🏆 Quality Assessment: ${qualityLevel}`);

    return {
      ...results,
      qualityLevel
    };

  } catch (error) {
    console.error('❌ Error evaluating agent output:', error);
    throw error;
  }
}

// Export test functions
export { testScript, expectedStoryboardOutput };