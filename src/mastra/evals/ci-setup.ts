import { mastra } from '../index';
import { storyboardSpecificEvals } from './storyboard-evals';

// Test suite configuration for different environments
export const evalTestConfig = {
  // Thresholds for different quality levels
  thresholds: {
    excellent: 0.9,
    good: 0.8,
    acceptable: 0.7,
    needsImprovement: 0.6,
    poor: 0.5
  },

  // Required evaluations for CI/CD
  requiredEvals: [
    'structure',
    'visualPromptQuality',
    'storyContentCompleteness'
  ],

  // Optional evaluations for detailed analysis
  optionalEvals: [
    'characterConsistency',
    'narrativeFlow'
  ],

  // Test scenarios for comprehensive evaluation
  testScenarios: [
    {
      name: 'Simple Story',
      input: 'A cat chases a mouse around the house.',
      expectedMinScore: 0.7
    },
    {
      name: 'Complex Fantasy',
      input: 'A young wizard discovers a magical book that summons a dragon. The dragon is lost and the wizard must help it find its way home through a mystical forest.',
      expectedMinScore: 0.8
    },
    {
      name: 'Character-Driven Drama',
      input: 'Two friends argue about a lost treasure map. One wants to keep searching, the other wants to give up. Their friendship is tested.',
      expectedMinScore: 0.75
    }
  ]
};

// CI/CD evaluation runner
export async function runCICDEvals() {
  console.log('🚀 Starting CI/CD Evaluation Suite...\n');

  try {
    const results = [];

    // Run tests for each scenario
    for (const scenario of evalTestConfig.testScenarios) {
      console.log(`📝 Testing Scenario: ${scenario.name}`);

      const storyboardAgent = mastra.getAgent('storyboardAgent');

      const response = await storyboardAgent.generate([
        {
          role: 'user',
          content: `Create a storyboard for this script: ${scenario.input}`
        }
      ]);

      const output = response.text;

      // Run required evaluations
      const evalResults: Record<string, number> = {};

      for (const evalName of evalTestConfig.requiredEvals) {
        let metric;

        switch (evalName) {
          case 'structure':
            metric = storyboardSpecificEvals.structure;
            break;
          case 'visualPromptQuality':
            metric = storyboardSpecificEvals.visualPromptQuality;
            break;
          case 'storyContentCompleteness':
            metric = storyboardSpecificEvals.storyContentCompleteness;
            break;
          default:
            continue;
        }

        const result = await metric.measure(scenario.input, output);
        evalResults[evalName] = result.score;
      }

      // Calculate average score
      const scores = Object.values(evalResults) as number[];
      const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;

      const passed = averageScore >= scenario.expectedMinScore;

      results.push({
        scenario: scenario.name,
        scores: evalResults,
        averageScore,
        expectedMinScore: scenario.expectedMinScore,
        passed,
        output: output.substring(0, 200) + '...' // Truncate for logging
      });

      console.log(`  Average Score: ${averageScore.toFixed(3)}`);
      console.log(`  Expected Min: ${scenario.expectedMinScore}`);
      console.log(`  Status: ${passed ? '✅ PASSED' : '❌ FAILED'}\n`);
    }

    // Generate CI/CD report
    const totalTests = results.length;
    const passedTests = results.filter(r => r.passed).length;
    const overallPassRate = passedTests / totalTests;

    console.log('📊 CI/CD Evaluation Report');
    console.log('========================');
    console.log(`Total Scenarios: ${totalTests}`);
    console.log(`Passed: ${passedTests}`);
    console.log(`Failed: ${totalTests - passedTests}`);
    console.log(`Pass Rate: ${(overallPassRate * 100).toFixed(1)}%`);

    // Detailed results
    console.log('\n📋 Detailed Results:');
    results.forEach(result => {
      console.log(`\n${result.scenario}:`);
      console.log(`  Average Score: ${result.averageScore.toFixed(3)}`);
      console.log(`  Expected Min: ${result.expectedMinScore}`);
      console.log(`  Status: ${result.passed ? '✅ PASSED' : '❌ FAILED'}`);

      Object.entries(result.scores).forEach(([evalName, score]) => {
        console.log(`    ${evalName}: ${(score as number).toFixed(3)}`);
      });
    });

    // Exit with appropriate code for CI/CD
    if (overallPassRate >= 0.8) {
      console.log('\n🎉 CI/CD Evaluation Suite PASSED');
      return { success: true, passRate: overallPassRate };
    } else {
      console.log('\n💥 CI/CD Evaluation Suite FAILED');
      return { success: false, passRate: overallPassRate };
    }

  } catch (error) {
    console.error('❌ CI/CD Evaluation Suite Error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

