import { createWorkflow, createStep } from '@mastra/core/workflows';
import { z } from 'zod';
import { RuntimeContext } from '@mastra/core/runtime-context';
import { imageGenerationTool } from '../tools/image-generation-tool';
import { pdfExportTool } from '../tools/pdf-export-tool';
import { pdfUploadTool } from '../tools/pdf-upload-tool.js';
import { characterConsistencyTool } from '../tools/character-consistency-tool';

// Step 1: Generate Script from Story Idea
const generateScriptStep = createStep({
  id: 'generate-script',
  description: 'Generate a screenplay from a story idea using the script generator agent',
  inputSchema: z.object({
    storyIdea: z.string().describe('The initial story idea or concept'),
    style: z.string().default('Cinematic').describe('Visual style for image generation'),
    title: z.string().optional().describe('Title for the story'),
    genre: z.string().optional().describe('Genre of the story'),
    tone: z.string().optional().describe('Tone of the story'),
  }),
  outputSchema: z.object({
    script: z.string().describe('Generated screenplay in standard format'),
    title: z.string().describe('Title of the story'),
    genre: z.string().describe('Genre of the story'),
    tone: z.string().describe('Tone of the story'),
    style: z.string().describe('Visual style for image generation'),
  }),
  execute: async ({ inputData, mastra }) => {
    console.log('📝 [Automated Workflow] Step 1: Generating script from story idea...');
    console.log(`📋 Input: ${inputData.storyIdea.substring(0, 100)}...`);

    // Call the script generator agent
    const scriptAgent = mastra.getAgent('scriptGeneratorAgent');
    const { text: script } = await scriptAgent.generate([
      {
        role: 'user',
        content: `Generate a screenplay for this story idea: "${inputData.storyIdea}".
        Genre: ${inputData.genre || 'drama'}.
        Tone: ${inputData.tone || 'dramatic'}.
        Title: ${inputData.title || 'Untitled'}.
        striclty make it 5 scenes with clear scene descriptions.`
      }
    ]);

    console.log(`✅ Script generated successfully (${script.length} characters)`);

    return {
      script,
      title: inputData.title || 'Untitled',
      genre: inputData.genre || 'drama',
      tone: inputData.tone || 'dramatic',
      style: inputData.style,
    };
  },
});

// Step 2: Convert Script to Storyboard
const convertToStoryboardStep = createStep({
  id: 'convert-to-storyboard',
  description: 'Convert the generated script into a visual storyboard using the storyboard agent',
  inputSchema: z.object({
    script: z.string().describe('Generated screenplay in standard format'),
    title: z.string().describe('Title of the story'),
    genre: z.string().describe('Genre of the story'),
    tone: z.string().describe('Tone of the story'),
    style: z.string().describe('Visual style for image generation'),
  }),
  outputSchema: z.object({
    storyboard: z.object({
      title: z.string(),
      scenes: z.array(z.object({
        sceneNumber: z.number(),
        storyContent: z.string(),
        imagePrompt: z.string(),
        characters: z.array(z.string()).optional(),
        location: z.string().optional(),
        timeOfDay: z.string().optional(),
      })),
      characters: z.array(z.object({
        name: z.string(),
        description: z.string(),
        role: z.string(),
      })).optional(),
    }).describe('Visual storyboard with scenes and character descriptions'),
    style: z.string().describe('Visual style for image generation'),
  }),
  execute: async ({ inputData, mastra }) => {
    console.log('🎬 [Automated Workflow] Step 2: Converting script to storyboard...');
    console.log(`📝 Script length: ${inputData.script.length} characters`);

    // Call the storyboard agent
    const storyboardAgent = mastra.getAgent('storyboardAgent');
    const { text: storyboardText } = await storyboardAgent.generate([
      {
        role: 'user',
        content: `Convert this screenplay into a visual storyboard with detailed scene descriptions and image prompts. Return your response in the exact JSON format specified in your instructions. Here's the script: ${inputData.script}`
      }
    ]);

    console.log(`📋 Storyboard agent response length: ${storyboardText.length} characters`);
    console.log(`📋 Storyboard response preview: ${storyboardText.substring(0, 200)}...`);

    // Parse the JSON response from the storyboard agent
    let storyboardData;
    try {
      // Extract JSON from the response (in case there's any extra text)
      const jsonMatch = storyboardText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        storyboardData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (error) {
      console.error('❌ Failed to parse storyboard JSON:', error);
      console.error('📋 Raw response:', storyboardText);

      // Fallback: create a simple storyboard from the script
      console.log('⚠️ Using fallback storyboard creation');
      const scriptLines = inputData.script.split('\n');
      const scenes = [];
      let sceneNumber = 1;

      // Simple parsing of script scenes
      for (const line of scriptLines) {
        const trimmedLine = line.trim();
        if (!trimmedLine) continue;

        // Look for scene indicators
        const isSceneStart =
          trimmedLine.toLowerCase().includes('int.') ||
          trimmedLine.toLowerCase().includes('ext.') ||
          /^\d+\./.test(trimmedLine) ||
          /^scene\s+\d+/i.test(trimmedLine);

        if (isSceneStart) {
          scenes.push({
            sceneNumber,
            description: trimmedLine,
            imagePrompt: `Cinematic scene: ${trimmedLine}`,
            location: trimmedLine,
            timeOfDay: 'day',
          });
          sceneNumber++;
        }
      }

      // If no scenes found, create a single scene
      if (scenes.length === 0) {
        scenes.push({
          sceneNumber: 1,
          description: inputData.script.substring(0, 200),
          imagePrompt: `Cinematic scene: ${inputData.script.substring(0, 200)}`,
          location: 'Unknown',
          timeOfDay: 'day',
        });
      }

      storyboardData = { scenes };
    }

    console.log(`✅ Storyboard created with ${storyboardData.scenes.length} scenes`);
    storyboardData.scenes.forEach((scene: any, index: number) => {
      console.log(`   Scene ${index + 1}: ${scene.storyContent.substring(0, 100)}...`);
    });

    return {
      storyboard: {
        title: inputData.title,
        scenes: storyboardData.scenes,
        characters: storyboardData.characters || [],
      },
      style: inputData.style,
    };
  },
});

// Step 3: Generate Images for Each Scene
const generateImagesStep = createStep({
  id: 'generate-images',
  description: 'Generate images for each scene using the image generation tool',
  inputSchema: z.object({
    storyboard: z.object({
      title: z.string(),
      scenes: z.array(z.object({
        sceneNumber: z.number(),
        storyContent: z.string(),
        imagePrompt: z.string(),
        characters: z.array(z.string()).optional(),
        location: z.string().optional(),
        timeOfDay: z.string().optional(),
      })),
      characters: z.array(z.object({
        name: z.string(),
        description: z.string(),
        role: z.string(),
      })).optional(),
    }),
    style: z.string().describe('Visual style for image generation'),
  }),
  outputSchema: z.object({
    scenesWithImages: z.array(z.object({
      sceneNumber: z.number(),
      description: z.string(),
      imagePrompt: z.string(),
      storyContent: z.string().optional(), // Add storyContent to preserve it
      imagePath: z.string(),
      style: z.string(),
    })).describe('Scenes with generated image paths'),
    title: z.string().describe('Title of the storyboard'),
  }),
  execute: async ({ inputData, runtimeContext }) => {
    console.log('🖼️ [Automated Workflow] Step 3: Generating images for scenes...');
    console.log(`📊 Generating 1 image(s) per scene with style: ${inputData.style}`);

    const scenesWithImages = [];

    for (const scene of inputData.storyboard.scenes) {
      console.log(`🖼️ Generating image for Scene ${scene.sceneNumber}: ${scene.storyContent.substring(0, 50)}...`);

      try {
        // Create a better image prompt from the story content
        const cleanStoryContent = scene.storyContent;
        const imagePrompt = cleanStoryContent
          .replace(/\*\*[^*]+\*\*/g, '') // Remove markdown headers like **INT. KITCHEN - DAY**
          .replace(/---\s*\*\*SCENE\s+\d+\*\*/g, '') // Remove scene transitions
          .replace(/\s+/g, ' ') // Clean up extra whitespace
          .trim()
          .substring(0, 200); // Limit length for better image generation

        // ALWAYS enforce character consistency using the tool
        const characterList = Array.isArray(inputData.storyboard.characters)
          ? inputData.storyboard.characters.map((c: any) => ({ name: c.name, description: c.description }))
          : [];

        let finalPrompt = imagePrompt;

        // CRITICAL: Always apply character consistency, even if no characters found
        try {
          const consistencyResult = await characterConsistencyTool.execute({
            context: {
              characters: characterList,
              scenePrompt: imagePrompt,
              style: inputData.style,
            },
            runtimeContext,
          });

          if (consistencyResult?.consistentPrompt) {
            finalPrompt = consistencyResult.consistentPrompt;
            console.log(`🧩 [Character Consistency] Applied consistent prompt for Scene ${scene.sceneNumber}`);
            if (Array.isArray(consistencyResult.characterAnchors) && consistencyResult.characterAnchors.length) {
              console.log(`🔗 [Character Anchors]`, consistencyResult.characterAnchors);
            }
          } else {
            console.log(`⚠️ [Character Consistency] No consistent prompt returned for Scene ${scene.sceneNumber}, using original prompt`);
          }
        } catch (ccError) {
          console.error(`❌ [Character Consistency] Failed to apply consistency for Scene ${scene.sceneNumber}:`, ccError);
          throw new Error(`Character consistency failed for Scene ${scene.sceneNumber}: ${ccError instanceof Error ? ccError.message : 'Unknown error'}`);
        }

        console.log(`🎨 [Automated Workflow] Using cleaned image prompt: ${finalPrompt.substring(0, 80)}...`);

        // Generate image using the image generation tool directly
        const result = await imageGenerationTool.execute({
          context: {
            prompt: finalPrompt,
            style: inputData.style,
            quality: 'standard',
            aspectRatio: '16:9',
            numImages: 1,
          },
          runtimeContext,
        });

        // Use the first generated image
        const imagePath = result.images[0]?.imageUrl
          ? `generated-images/${result.images[0].imageUrl}`
          : `generated-images/scene_${scene.sceneNumber}_${Date.now()}.png`;

        console.log(`🔍 [Workflow] Image generation result:`, {
          sceneNumber: scene.sceneNumber,
          imageUrl: result.images[0]?.imageUrl,
          finalImagePath: imagePath
        });

        // Clean up story content for PDF display
        const cleanStoryContentForPDF = cleanStoryContent
          .replace(/\*\*[^*]+\*\*/g, '') // Remove markdown headers
          .replace(/---\s*\*\*SCENE\s+\d+\*\*/g, '') // Remove scene transitions
          .replace(/\s+/g, ' ') // Clean up extra whitespace
          .trim();

        const sceneData = {
          sceneNumber: scene.sceneNumber,
          description: cleanStoryContentForPDF, // Use cleaned content for PDF
          imagePrompt: finalPrompt, // Keep the final (possibly consistency-adjusted) prompt
          storyContent: cleanStoryContentForPDF, // Use cleaned content
          imagePath,
          style: inputData.style,
        };

        scenesWithImages.push(sceneData);

        console.log(`✅ Image generated for Scene ${scene.sceneNumber}: ${imagePath}`);
        console.log(`📊 Scene data for PDF:`, sceneData);
      } catch (error) {
        console.error(`❌ Failed to generate image for Scene ${scene.sceneNumber}:`, error);
        // Add scene without image path as fallback
        scenesWithImages.push({
          sceneNumber: scene.sceneNumber,
          description: scene.storyContent,
          imagePrompt: scene.imagePrompt,
          storyContent: scene.storyContent,
          imagePath: '',
          style: inputData.style,
        });
      }
    }

    console.log(`✅ Images generated for ${scenesWithImages.length} scenes`);

    console.log(`🔍 [Workflow] Final scenesWithImages data:`, scenesWithImages.map(scene => ({
      sceneNumber: scene.sceneNumber,
      hasImagePath: !!scene.imagePath,
      imagePath: scene.imagePath,
      storyContentLength: scene.storyContent?.length || 0
    })));

    return {
      scenesWithImages,
      title: inputData.storyboard.title,
    };
  },
});

// Step 4: Export to PDF
const exportToPdfStep = createStep({
  id: 'export-to-pdf',
  description: 'Export the storyboard with images to PDF using the pdfExportTool directly',
  inputSchema: z.object({
    scenesWithImages: z.array(z.object({
      sceneNumber: z.number(),
      description: z.string(),
      imagePrompt: z.string(),
      storyContent: z.string().optional(), // Add storyContent to match the input
      imagePath: z.string(),
      style: z.string(),
    })),
    title: z.string(),
  }),
  outputSchema: z.object({
    pdfPath: z.string().describe('Path to the generated PDF file'),
    title: z.string().describe('Title of the storyboard'),
    summary: z.object({
      totalScenes: z.number(),
      totalImages: z.number(),
      pdfSize: z.number(),
    }).describe('Summary of the exported storyboard'),
  }),
  execute: async ({ inputData, runtimeContext }) => {
    console.log('📄 [Automated Workflow] Step 4: Exporting to PDF...');
    console.log(`📊 Exporting ${inputData.scenesWithImages.length} scenes with images to PDF`);

    // Debug: Log the scenes data being passed to PDF export
    console.log(`🔍 [Workflow] Scenes data for PDF export:`, inputData.scenesWithImages.map(scene => ({
      sceneNumber: scene.sceneNumber,
      hasImagePath: !!scene.imagePath,
      imagePath: scene.imagePath,
      descriptionLength: scene.description?.length || 0
    })));

    try {
            // Debug: Log what we're passing to PDF export
      console.log(`🔍 [Workflow] About to call PDF export with:`, {
        scenesWithImagesLength: inputData.scenesWithImages.length,
        firstScene: inputData.scenesWithImages[0],
        title: inputData.title
      });

      // Clean the data to ensure no unwanted fields
      const cleanScenesWithImages = inputData.scenesWithImages.map(scene => ({
        sceneNumber: scene.sceneNumber,
        description: scene.description,
        imagePrompt: scene.imagePrompt,
        storyContent: scene.storyContent,
        imagePath: scene.imagePath,
        style: scene.style,
      }));

      console.log(`🧹 [Workflow] Cleaned data for PDF export:`, cleanScenesWithImages.map(scene => ({
        sceneNumber: scene.sceneNumber,
        hasImagePath: !!scene.imagePath,
        imagePath: scene.imagePath
      })));

      // Use the pdfExportTool directly
      const result = await pdfExportTool.execute({
        context: {
          storyboardData: cleanScenesWithImages,
          title: inputData.title,
          includeImages: true,
          format: 'A4',
        },
        runtimeContext,
      });

      console.log(`✅ PDF exported successfully: ${result.pdfPath}`);
      console.log(`📊 PDF size: ${result.fileSize} bytes`);

      return {
        pdfPath: result.pdfPath,
        title: inputData.title,
        summary: {
          totalScenes: inputData.scenesWithImages.length,
          totalImages: inputData.scenesWithImages.filter(s => s.imagePath).length,
          pdfSize: result.fileSize,
        },
      };
    } catch (error) {
      console.error('❌ [Automated Workflow] PDF export failed:', error);

      // Fallback: create a simple PDF path
      const fallbackPath = `generated-exports/${inputData.title.replace(/\s+/g, '_')}_storyboard_${Date.now()}.pdf`;
      console.log(`⚠️ Using fallback PDF path: ${fallbackPath}`);

      return {
        pdfPath: fallbackPath,
        title: inputData.title,
        summary: {
          totalScenes: inputData.scenesWithImages.length,
          totalImages: inputData.scenesWithImages.filter(s => s.imagePath).length,
          pdfSize: 0,
        },
      };
    }
  },
});

// Step 5: Upload PDF to Cloud Storage
const uploadPdfStep = createStep({
  id: 'upload-pdf',
  description: 'Upload the generated PDF to S3 and Google Drive using the PDF upload agent',
  inputSchema: z.object({
    pdfPath: z.string().describe('Path to the generated PDF file'),
    title: z.string().describe('Title of the storyboard'),
    summary: z.object({
      totalScenes: z.number(),
      totalImages: z.number(),
      pdfSize: z.number(),
    }).describe('Summary of the exported storyboard'),
    storyIdea: z.string().describe('The initial story idea'),
    style: z.string().describe('Visual style'),
    genre: z.string().describe('Genre of the story'),
    tone: z.string().describe('Tone of the story'),
    desiredFilename: z.string().optional().describe('Desired filename for the uploaded PDF'),
    s3Bucket: z.string().optional().describe('S3 bucket name'),
    zapierWebhookUrl: z.string().optional().describe('Zapier webhook URL'),
  }),
  outputSchema: z.object({
    pdfPath: z.string().describe('Path to the generated PDF file'),
    title: z.string().describe('Title of the storyboard'),
    summary: z.object({
      totalScenes: z.number(),
      totalImages: z.number(),
      pdfSize: z.number(),
    }).describe('Summary of the exported storyboard'),
    s3Url: z.string().optional().describe('S3 URL of the uploaded PDF'),
    googleDriveUrl: z.string().optional().describe('Google Drive URL of the uploaded PDF'),
    uploadSuccess: z.boolean().describe('Whether upload was successful'),
    uploadError: z.string().optional().describe('Upload error message if failed'),
  }),
  execute: async ({ inputData, runtimeContext }) => {
    console.log('☁️ [Automated Workflow] Step 5: Uploading PDF to cloud storage...');
    console.log(`📄 Uploading PDF: ${inputData.pdfPath}`);
    console.log(`🔍 [Workflow] PDF path being passed to upload tool: ${inputData.pdfPath}`);

    try {
      // Use the PDF upload tool directly
      const result = await pdfUploadTool.execute({
        context: {
          filePath: inputData.pdfPath,
          desiredFilename: inputData.desiredFilename || `${inputData.title.replace(/\s+/g, '_')}.pdf`,
          s3Bucket: inputData.s3Bucket,
        },
        runtimeContext,
      });

      console.log(`✅ PDF upload result:`, result);

      return {
        pdfPath: inputData.pdfPath,
        title: inputData.title,
        summary: inputData.summary,
        s3Url: result.s3Url,
        googleDriveUrl: result.googleDriveUrl,
        uploadSuccess: result.success,
        uploadError: result.error,
      };
    } catch (error) {
      console.error('❌ [Automated Workflow] PDF upload failed:', error);

      return {
        pdfPath: inputData.pdfPath,
        title: inputData.title,
        summary: inputData.summary,
        uploadSuccess: false,
        uploadError: error instanceof Error ? error.message : 'Unknown upload error',
      };
    }
  },
});

// Create the automated workflow
export const automatedAgentNetworkWorkflow = createWorkflow({
  id: 'automated-agent-network',
  description: 'Complete pipeline from story idea to PDF with all agents working sequentially',
  inputSchema: z.object({
    storyIdea: z.string().describe('The initial story idea or concept'),
    style: z.string().default('Cinematic').describe('Visual style for image generation'),
    title: z.string().optional().describe('Title for the story'),
    genre: z.string().optional().describe('Genre of the story'),
    tone: z.string().optional().describe('Tone of the story'),
  }),
  outputSchema: z.object({
    script: z.string().describe('Generated screenplay'),
    storyboard: z.object({
      title: z.string(),
      scenes: z.array(z.object({
        sceneNumber: z.number(),
        description: z.string(),
        imagePrompt: z.string(),
        imagePath: z.string(),
        style: z.string(),
      })),
    }).describe('Visual storyboard with scenes'),
    pdfPath: z.string().describe('Path to the generated PDF file'),
    title: z.string().describe('Title of the storyboard'),
    summary: z.object({
      totalScenes: z.number(),
      totalImages: z.number(),
      pdfSize: z.number(),
    }).describe('Summary of the exported storyboard'),
    s3Url: z.string().optional().describe('S3 URL of the uploaded PDF'),
    googleDriveUrl: z.string().optional().describe('Google Drive URL of the uploaded PDF'),
    uploadSuccess: z.boolean().describe('Whether upload was successful'),
    uploadError: z.string().optional().describe('Upload error message if failed'),
  }),
  steps: [generateScriptStep, convertToStoryboardStep, generateImagesStep, exportToPdfStep, uploadPdfStep],
})
  .then(generateScriptStep)
  .then(convertToStoryboardStep)
  .then(generateImagesStep)
  .then(exportToPdfStep)
  .then(uploadPdfStep)
  .commit();

// Helper function to run the automated workflow
export async function runAutomatedAgentNetwork(
  storyIdea: string,
  options?: {
    style?: string;
    title?: string;
    genre?: string;
    tone?: string;
    desiredFilename?: string;
    s3Bucket?: string;
    zapierWebhookUrl?: string;
  }
) {
  console.log('🚀 [Agent Network] Starting automated pipeline...');

  try {
    // Create a run instance
    const run = await automatedAgentNetworkWorkflow.createRunAsync();

    // Start the workflow with input data
    const result = await run.start({
      inputData: {
        storyIdea,
        style: options?.style || 'Cinematic',
        title: options?.title || 'Untitled Story',
        genre: options?.genre || 'drama',
        tone: options?.tone || 'dramatic',
      },
    });

    if (result.status === 'success') {
      console.log('🎉 [Agent Network] Automated pipeline completed successfully!');
      console.log(`📄 Final PDF: ${result.result.pdfPath}`);
      console.log(`📊 Summary: ${result.result.summary.totalScenes} scenes, ${result.result.summary.totalImages} images`);

      if (result.result.uploadSuccess) {
        console.log(`☁️ S3 URL: ${result.result.s3Url}`);
        console.log(`📁 Google Drive URL: ${result.result.googleDriveUrl}`);
      } else {
        console.log(`⚠️ Upload failed: ${result.result.uploadError}`);
      }

      return result.result;
    } else {
      throw new Error(`Workflow failed with status: ${result.status}`);
    }
  } catch (error) {
    console.error('❌ [Agent Network] Automated pipeline failed:', error);
    throw error;
  }
}