import { mastra } from '../src/mastra/index';
import { runStoryboardEvals, evaluateStoryboardAgent } from '../src/mastra/evals/test-evals';
import { runCICDEvals } from '../src/mastra/evals/ci-setup';

/**
 * Comprehensive Example: Using Evals with AI Storyboard Generator
 *
 * This example demonstrates how to:
 * 1. Run basic evaluation tests
 * 2. Evaluate actual agent outputs
 * 3. Set up CI/CD evaluation pipelines
 * 4. Monitor agent quality over time
 */

async function main() {
  console.log('🎬 AI Storyboard Generator - Evaluation Examples\n');

  // Example 1: Basic Evaluation Tests
  console.log('='.repeat(60));
  console.log('EXAMPLE 1: Basic Evaluation Tests');
  console.log('='.repeat(60));

  await runStoryboardEvals();

  // Example 2: Evaluate Actual Agent Output
  console.log('\n' + '='.repeat(60));
  console.log('EXAMPLE 2: Evaluate Actual Agent Output');
  console.log('='.repeat(60));

  const testInput = `
    A brave knight named Sir Lancelot enters a dark forest to rescue
    a princess who has been captured by an evil sorcerer. The forest
    is filled with magical creatures and dangerous traps. Lancelot
    must use his sword and wit to overcome these challenges and save
    the princess.
  `;

  try {
    const agentResult = await evaluateStoryboardAgent(testInput);

    console.log('\n📋 Agent Output Preview:');
    console.log(agentResult.output.substring(0, 500) + '...');

    console.log('\n📊 Evaluation Scores:');
    Object.entries(agentResult.scores).forEach(([metric, score]) => {
      console.log(`  ${metric}: ${(score as number).toFixed(3)}`);
    });

    // Quality assessment
    const quality = agentResult.scores.average >= 0.8 ? 'Excellent' :
                   agentResult.scores.average >= 0.7 ? 'Good' :
                   agentResult.scores.average >= 0.6 ? 'Acceptable' : 'Needs Improvement';

    console.log(`\n🎯 Overall Quality: ${quality}`);

  } catch (error) {
    console.error('❌ Error evaluating agent:', error);
  }

  // Example 3: CI/CD Evaluation Pipeline
  console.log('\n' + '='.repeat(60));
  console.log('EXAMPLE 3: CI/CD Evaluation Pipeline');
  console.log('='.repeat(60));

  try {
    const ciResult = await runCICDEvals();

    if (ciResult.success) {
      console.log(`\n✅ CI/CD Pipeline PASSED with ${(ciResult.passRate * 100).toFixed(1)}% pass rate`);
    } else {
      console.log(`\n❌ CI/CD Pipeline FAILED with ${(ciResult.passRate * 100).toFixed(1)}% pass rate`);
    }
  } catch (error) {
    console.error('❌ Error running CI/CD evals:', error);
  }

  // Example 4: Custom Evaluation Workflow
  console.log('\n' + '='.repeat(60));
  console.log('EXAMPLE 4: Custom Evaluation Workflow');
  console.log('='.repeat(60));

  await runCustomEvaluationWorkflow();

  console.log('\n🎉 All evaluation examples completed!');
}

async function runCustomEvaluationWorkflow() {
  const { evaluate } = await import('@mastra/evals');
  const { storyboardSpecificEvals } = await import('../src/mastra/evals/storyboard-evals');
  const { llmEvals } = await import('../src/mastra/evals');

  const testCases = [
    {
      name: 'Simple Action',
      input: 'A superhero flies through the city to stop a robbery.',
      focusAreas: ['structure', 'visualPromptQuality', 'answerRelevancy']
    },
    {
      name: 'Emotional Drama',
      input: 'A father and daughter have a heartfelt conversation about growing up.',
      focusAreas: ['storyContentCompleteness', 'characterConsistency', 'toneConsistency']
    },
    {
      name: 'Fantasy Adventure',
      input: 'A young mage discovers ancient ruins and must solve magical puzzles.',
      focusAreas: ['narrativeFlow', 'faithfulness', 'completeness']
    }
  ];

  for (const testCase of testCases) {
    console.log(`\n📝 Testing: ${testCase.name}`);

    try {
      const storyboardAgent = mastra.getAgent('storyboard-creator');

      const response = await storyboardAgent.generate([
        {
          role: 'user',
          content: `Create a storyboard for this script: ${testCase.input}`
        }
      ]);

      const output = response.text;
      const results = {};

      // Run focused evaluations
      for (const area of testCase.focusAreas) {
        let metric;

        switch (area) {
          case 'structure':
            metric = storyboardSpecificEvals.structure;
            break;
          case 'visualPromptQuality':
            metric = storyboardSpecificEvals.visualPromptQuality;
            break;
          case 'storyContentCompleteness':
            metric = storyboardSpecificEvals.storyContentCompleteness;
            break;
          case 'characterConsistency':
            metric = storyboardSpecificEvals.characterConsistency;
            break;
          case 'narrativeFlow':
            metric = storyboardSpecificEvals.narrativeFlow;
            break;
          case 'answerRelevancy':
            metric = llmEvals.answerRelevancy;
            break;
          case 'faithfulness':
            metric = llmEvals.faithfulness;
            break;
          case 'completeness':
            metric = llmEvals.completeness;
            break;
          case 'toneConsistency':
            metric = llmEvals.toneConsistency;
            break;
          default:
            continue;
        }

        const result = await evaluate(testCase.input, output, metric);
        results[area] = result.score;
      }

      // Calculate focused score
      const scores = Object.values(results) as number[];
      const focusedScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;

      console.log(`  Focused Score: ${focusedScore.toFixed(3)}`);
      Object.entries(results).forEach(([area, score]) => {
        console.log(`    ${area}: ${(score as number).toFixed(3)}`);
      });

    } catch (error) {
      console.error(`  ❌ Error testing ${testCase.name}:`, error);
    }
  }
}

// Run the examples if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { main, runCustomEvaluationWorkflow };