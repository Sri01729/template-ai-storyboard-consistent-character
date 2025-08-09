import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';
import fs from 'fs';
import path from 'path';

// Load environment variables from .env file
const envPath = path.resolve(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
      process.env[key] = value;
    }
  });
}

/**
 * Direct character consistency test using AI SDK without Mastra wrapper
 */
async function testDirectCharacterConsistency() {
  console.log('🧪 [Direct Character Consistency Test] Starting evaluation of 5 forest scene images...\n');

  // Define the test images (relative paths from project root)
  const testImages = [
    'generated-images/scene_1_A_lush__ancient_fore_1754661496556_2025-08-08T13-58-16-556Z.png',
    'generated-images/scene_1_A_lush__ancient_fore_1754661503232_2025-08-08T13-58-23-232Z.png',
    'generated-images/scene_1_A_lush__ancient_fore_1754661510124_2025-08-08T13-58-30-125Z.png',
    'generated-images/scene_1_A_lush__ancient_fore_1754661516226_2025-08-08T13-58-36-226Z.png',
    'generated-images/scene_1_A_lush__ancient_fore_1754661522659_2025-08-08T13-58-42-659Z.png'
  ];

  // Convert to absolute paths for the test
  const absoluteImagePaths = testImages.map(img => path.resolve(process.cwd(), img));

  console.log('📸 [Test Images] Processing the following images:');
  absoluteImagePaths.forEach((imgPath, index) => {
    console.log(`   ${index + 1}. ${path.basename(imgPath)}`);
  });
  console.log();

  try {
    console.log('🖼️ [Image Processing] Converting images to base64 data URIs...');

    // Convert all images to data URIs
    const imageDataUris = absoluteImagePaths.map((imgPath, index) => {
      const imageBuffer = fs.readFileSync(imgPath);
      const base64 = imageBuffer.toString('base64');
      const dataUri = `data:image/png;base64,${base64}`;
      console.log(`📷 [Image ${index + 1}] Converted to data URI (${dataUri.length} chars)`);
      return dataUri;
    });

    console.log('\n🤖 [LLM Judge] Sending images to GPT-4o-mini for character consistency analysis...');
    console.log('📊 [Evaluation] This may take a moment as the LLM analyzes all 5 images...\n');

    const startTime = Date.now();

    // Create message content with all images
    const content = [
      ...imageDataUris.map((dataUri, index) => ({
        type: 'image' as const,
        image: dataUri,
      })),
      {
        type: 'text' as const,
        text: `I'm showing you 5 generated images from a storyboard featuring a young boy explorer and his crow companion.

Analyze these images for CHARACTER VISUAL CONSISTENCY:

1) Identify all characters that appear across multiple images
2) For each recurring character, evaluate visual consistency across images:
   - Facial features (eyes, nose, mouth, face shape)
   - Hair (color, style, length)
   - Clothing/attire (colors, style, accessories)
   - Body type and proportions
   - Distinctive marks or features
   - Overall art style consistency

3) Look for identity drift - where the same character appears different across scenes
4) Small pose/angle differences are acceptable, but identity changes are not

Important grading rubric:
- 1.0: Perfect visual consistency - same characters look identical across images
- 0.8-0.9: Minor variations but clearly the same characters
- 0.5-0.7: Noticeable inconsistencies in some character features
- 0.1-0.4: Major visual drift - characters look different across images
- 0.0: Complete inconsistency - characters unrecognizable between images

Focus on the main characters:
- Young Explorer: blonde hair, yellow raincoat, blue boots, backpack
- Crow Companion: black feathers, dark eyes, consistent size/shape`
      }
    ];

    // Define response schema
    const responseSchema = z.object({
      score: z.number().min(0).max(1),
      info: z.object({
        reason: z.string(),
        perCharacter: z.array(z.object({
          name: z.string(),
          consistent: z.boolean(),
          issues: z.array(z.string()).default([]),
          appearsInImages: z.array(z.number()).default([])
        })).default([]),
        perImageAnalysis: z.array(z.object({
          imageIndex: z.number(),
          charactersFound: z.array(z.string()).default([]),
          visualNotes: z.string()
        })).default([]),
        totalImages: z.number().default(0),
        totalCharacters: z.number().default(0),
        consistencyIssues: z.array(z.string()).default([])
      })
    });

    const result = await generateObject({
      model: openai('gpt-4o-mini'),
      messages: [
        {
          role: 'user',
          content,
        },
      ],
      schema: responseSchema,
    });

    const evaluationTime = Date.now() - startTime;

    console.log('✅ [Evaluation Complete] Character consistency analysis finished!\n');
    console.log('⏱️ [Performance] Evaluation completed in:', `${evaluationTime}ms (${(evaluationTime/1000).toFixed(2)}s)\n`);

    // Display detailed results
    console.log('🎯 [CONSISTENCY SCORE]');
    console.log('=' .repeat(50));
    console.log(`Overall Score: ${result.object.score.toFixed(3)} / 1.000`);
    console.log(`Percentage: ${(result.object.score * 100).toFixed(1)}%`);
    console.log(`Reason: ${result.object.info.reason}\n`);

    if (result.object.info.perCharacter && result.object.info.perCharacter.length > 0) {
      console.log('👤 [CHARACTER ANALYSIS]');
      console.log('=' .repeat(50));
      result.object.info.perCharacter.forEach((character: any, index: number) => {
        console.log(`${index + 1}. ${character.name}`);
        console.log(`   ✓ Consistent: ${character.consistent ? '✅ YES' : '❌ NO'}`);
        if (character.appearsInImages && character.appearsInImages.length > 0) {
          console.log(`   📸 Appears in images: [${character.appearsInImages.join(', ')}]`);
        }
        if (character.issues && character.issues.length > 0) {
          console.log(`   ⚠️  Issues: ${character.issues.join(', ')}`);
        }
        console.log();
      });
    }

    if (result.object.info.perImageAnalysis && result.object.info.perImageAnalysis.length > 0) {
      console.log('🖼️ [PER-IMAGE ANALYSIS]');
      console.log('=' .repeat(50));
      result.object.info.perImageAnalysis.forEach((imageAnalysis: any) => {
        console.log(`Image ${imageAnalysis.imageIndex + 1}:`);
        console.log(`   Characters found: ${imageAnalysis.charactersFound.join(', ') || 'None detected'}`);
        console.log(`   Visual notes: ${imageAnalysis.visualNotes}`);
        console.log();
      });
    }

    if (result.object.info.consistencyIssues && result.object.info.consistencyIssues.length > 0) {
      console.log('⚠️ [CONSISTENCY ISSUES]');
      console.log('=' .repeat(50));
      result.object.info.consistencyIssues.forEach((issue: string, index: number) => {
        console.log(`${index + 1}. ${issue}`);
      });
      console.log();
    }

    console.log('📈 [SUMMARY STATISTICS]');
    console.log('=' .repeat(50));
    console.log(`Total Images Analyzed: ${result.object.info.totalImages || testImages.length}`);
    console.log(`Total Characters: ${result.object.info.totalCharacters || 2}`);
    console.log(`Evaluation Model: GPT-4o-mini (Vision)`);
    console.log(`Processing Time: ${(evaluationTime/1000).toFixed(2)}s`);

    // Provide interpretation
    console.log('\n🎓 [INTERPRETATION]');
    console.log('=' .repeat(50));
    if (result.object.score >= 0.9) {
      console.log('🌟 EXCELLENT: Characters show outstanding visual consistency across all images!');
    } else if (result.object.score >= 0.7) {
      console.log('👍 GOOD: Characters are mostly consistent with minor variations.');
    } else if (result.object.score >= 0.5) {
      console.log('⚠️  MODERATE: Some consistency issues detected that should be addressed.');
    } else {
      console.log('❌ POOR: Significant character consistency problems found.');
    }

    return result.object;

  } catch (error) {
    console.error('❌ [Error] Character consistency evaluation failed:');
    console.error(error);
    throw error;
  }
}

// Run the test if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testDirectCharacterConsistency()
    .then(() => {
      console.log('\n✅ [Test Complete] Character consistency evaluation finished successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 [Test Failed] Character consistency evaluation encountered an error:');
      console.error(error);
      process.exit(1);
    });
}

export { testDirectCharacterConsistency };
