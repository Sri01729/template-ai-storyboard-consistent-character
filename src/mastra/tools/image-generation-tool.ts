import { createTool } from '@mastra/core/tools';
import { GoogleGenAI } from '@google/genai';
import { z } from 'zod';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Style prompts for different visual styles
const stylePrompts: { [key: string]: { prefix: string; suffix: string } } = {
  'Cinematic': {
    prefix: 'Cinematic film still, photorealistic,',
    suffix: ', 4k, hyper-detailed, professional color grading, sharp focus'
  },
  'Photographic': {
    prefix: 'Professional photograph, photorealistic,',
    suffix: ', 85mm lens, sharp focus, high quality photo'
  },
  'Anime': {
    prefix: 'Vibrant anime style, key visual,',
    suffix: ', cel-shaded, detailed characters, trending on Pixiv, by Makoto Shinkai'
  },
  'Manga': {
    prefix: 'Black and white manga panel,',
    suffix: ', screentones, sharp lines, detailed ink work, dynamic action'
  },
  'Ghibli-esque': {
    prefix: 'Ghibli-esque animation style,',
    suffix: ', beautiful hand-drawn background, whimsical, soft color palette'
  },
  'Disney-esque': {
    prefix: 'Classic Disney animation style,',
    suffix: ', expressive characters, vibrant colors, storybook illustration'
  },
  'Comic Book': {
    prefix: 'American comic book art style,',
    suffix: ', bold outlines, vibrant colors, halftone dots, action-packed'
  },
  'Graphic Novel': {
    prefix: 'Mature graphic novel art style,',
    suffix: ', detailed inks, atmospheric lighting, moody colors'
  },
  'Watercolor': {
    prefix: 'Beautiful watercolor painting,',
    suffix: ', soft edges, vibrant washes of color, on textured paper'
  },
  'Low Poly': {
    prefix: 'Low poly 3D render,',
    suffix: ', geometric shapes, simple color palette, isometric view'
  },
  'Pixel Art': {
    prefix: 'Detailed pixel art, 16-bit,',
    suffix: ', vibrant color palette, nostalgic retro video game style'
  },
  'Steampunk': {
    prefix: 'Steampunk style illustration,',
    suffix: ', intricate gears and cogs, brass and copper details, Victorian aesthetic'
  },
  'Cyberpunk': {
    prefix: 'Cyberpunk cityscape,',
    suffix: ', neon-drenched, high-tech low-life, Blade Runner aesthetic, moody lighting'
  },
  'Fantasy Art': {
    prefix: 'Epic fantasy art, D&D style,',
    suffix: ', dramatic lighting, detailed armor and landscapes, magical atmosphere'
  },
  'Film Noir': {
    prefix: 'Black and white film noir style,',
    suffix: ', high contrast, dramatic shadows, 1940s detective movie aesthetic'
  },
  'Photorealistic': {
    prefix: 'Photorealistic style, highly detailed,',
    suffix: ', realistic photography, lifelike quality'
  }
};

// Helper function to generate image using AI SDK
export async function generateSceneImage(prompt: string, style: string): Promise<string> {
  console.log('🎨 [Image Generation] Starting image generation process...');
  console.log(`📝 [Image Generation] Input parameters:`, {
    prompt: prompt.substring(0, 50) + '...',
    style: style
  });

  const styleConfig = stylePrompts[style] || stylePrompts['Cinematic'];
  const fullPrompt = `${styleConfig.prefix} ${prompt}${styleConfig.suffix}`;

  console.log(`🎭 [Image Generation] Applied style config:`, {
    prefix: styleConfig.prefix,
    suffix: styleConfig.suffix
  });
  console.log(`📝 [Image Generation] Full prompt: ${fullPrompt.substring(0, 100)}...`);

  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) {
    console.error('❌ [Image Generation] GOOGLE_GENERATIVE_AI_API_KEY not found in environment variables');
    throw new Error('GOOGLE_GENERATIVE_AI_API_KEY not found in environment variables');
  }

  console.log('🔑 [Image Generation] API key found, initializing Google GenAI...');

  const ai = new GoogleGenAI({ apiKey });
  console.log('🤖 [Image Generation] Google GenAI initialized successfully');

  console.log('🚀 [Image Generation] Calling Google Imagen API...');
  const startTime = Date.now();

  try {
    const response = await ai.models.generateImages({
      model: 'imagen-3.0-generate-002',
      prompt: fullPrompt,
      config: { numberOfImages: 1, outputMimeType: 'image/jpeg' },
    });

    const generationTime = Date.now() - startTime;
    console.log(`✅ [Image Generation] API call completed in ${generationTime}ms`);

    if (response.generatedImages && response.generatedImages.length > 0) {
      console.log(`🖼️ [Image Generation] Received ${response.generatedImages.length} generated images`);

      const image = response.generatedImages[0].image;
      if (!image || !image.imageBytes) {
        console.error('❌ [Image Generation] Image generation failed to return valid image data');
        throw new Error("Image generation failed to return valid image data.");
      }

      const base64ImageBytes: string = image.imageBytes;
      console.log(`📊 [Image Generation] Image data size: ${base64ImageBytes.length} characters`);
      console.log(`✅ [Image Generation] Successfully generated image with style: ${style}`);

      return `data:image/jpeg;base64,${base64ImageBytes}`;
    } else {
      console.error('❌ [Image Generation] Image generation failed to return an image');
      throw new Error("Image generation failed to return an image.");
    }
  } catch (error) {
    console.error('❌ [Image Generation] Error during API call:', error);
    throw error;
  }
}

// Helper function to save image locally
async function saveImageLocally(imageData: string, filename: string): Promise<string> {
  console.log('💾 [Image Save] Starting local image save process...');
  console.log(`📁 [Image Save] Filename: ${filename}`);

  try {
    // Ensure the filename has proper extension
    if (!filename.endsWith('.png') && !filename.endsWith('.jpg') && !filename.endsWith('.jpeg')) {
      filename += '.png';
      console.log(`📝 [Image Save] Added .png extension: ${filename}`);
    }

    // Add timestamp to avoid conflicts
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const nameWithoutExt = path.parse(filename).name;
    const ext = path.parse(filename).ext;
    const finalFilename = `${nameWithoutExt}_${timestamp}${ext}`;

    console.log(`⏰ [Image Save] Generated timestamp: ${timestamp}`);
    console.log(`📄 [Image Save] Final filename: ${finalFilename}`);

    // Convert base64 data to buffer
    console.log('🔄 [Image Save] Converting base64 data to buffer...');
    const base64Data = imageData.replace(/^data:image\/[a-z]+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    console.log(`📊 [Image Save] Buffer size: ${buffer.length} bytes`);

    // Save to generated-images directory at project root
    const projectRoot = path.resolve(__dirname, '../../..'); // Go up from src/mastra/tools to project root
    const outputDir = path.join(projectRoot, 'generated-images');
    console.log(`📁 [Image Save] Project root: ${projectRoot}`);
    console.log(`📁 [Image Save] Output directory: ${outputDir}`);

    if (!fs.existsSync(outputDir)) {
      console.log(`📁 [Image Save] Creating output directory...`);
      fs.mkdirSync(outputDir, { recursive: true });
      console.log(`✅ [Image Save] Output directory created successfully`);
    } else {
      console.log(`✅ [Image Save] Output directory already exists`);
    }

    const filePath = path.join(outputDir, finalFilename);
    console.log(`📄 [Image Save] Full file path: ${filePath}`);

    console.log('💾 [Image Save] Writing file to disk...');
    fs.writeFileSync(filePath, buffer);

    console.log(`✅ [Image Save] Image saved successfully: ${finalFilename}`);
    console.log(`📊 [Image Save] File size: ${buffer.length} bytes`);

    return finalFilename;
  } catch (error) {
    console.error('❌ [Image Save] Error saving image locally:', error);
    throw new Error(`Failed to save image: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export const imageGenerationTool = createTool({
  id: 'generateImage',
  description: 'Generates storyboard images using Google Imagen with various art styles and saves them locally',
  inputSchema: z.object({
    prompt: z.string().describe('The base image generation prompt'),
    style: z.string().describe('The visual style to apply (e.g., Cinematic, Anime, Comic Book)'),
    quality: z.enum(['standard', 'high']).default('standard').describe('Image quality setting'),
    aspectRatio: z.enum(['1:1', '16:9', '4:3', '3:2']).default('16:9').describe('Image aspect ratio'),
    numImages: z.number().default(1).describe('Number of images to generate (default: 1)'),
  }),
  outputSchema: z.object({
    images: z.array(z.object({
      imageUrl: z.string().describe('Local file path of the generated image'),
      prompt: z.string().describe('The final prompt used for generation'),
      style: z.string().describe('The style that was applied'),
      metadata: z.object({
        generationTime: z.number().describe('Time taken to generate in milliseconds'),
        model: z.string().describe('AI model used for generation'),
        quality: z.string().describe('Quality setting used'),
        aspectRatio: z.string().describe('Aspect ratio used'),
      }).optional(),
    })).describe('Array of generated images with local file paths'),
    totalImages: z.number().describe('Total number of images generated'),
    style: z.string().describe('The style that was applied'),
  }),
  execute: async ({ context }) => {
    console.log('🛠️ [Image Generation Tool] Tool execution started...');
    console.log(`📋 [Image Generation Tool] Input context:`, {
      prompt: context.prompt.substring(0, 50) + '...',
      style: context.style,
      quality: context.quality,
      aspectRatio: context.aspectRatio,
      numImages: context.numImages
    });

    const { prompt, style, quality, aspectRatio, numImages = 1 } = context;

    // Validate style
    if (!stylePrompts[style]) {
      console.error(`❌ [Image Generation Tool] Invalid style: ${style}`);
      console.log(`📋 [Image Generation Tool] Available styles: ${Object.keys(stylePrompts).join(', ')}`);
      throw new Error(`Invalid style: ${style}. Available styles: ${Object.keys(stylePrompts).join(', ')}`);
    }

    console.log(`✅ [Image Generation Tool] Style validation passed: ${style}`);

    // Apply style to prompt
    const styleConfig = stylePrompts[style];
    const enhancedPrompt = `${styleConfig.prefix} ${prompt} ${styleConfig.suffix}`;

    console.log(`🎭 [Image Generation Tool] Enhanced prompt: ${enhancedPrompt.substring(0, 100)}...`);

    try {
      const startTime = Date.now();
      const images = [];

      console.log(`🔄 [Image Generation Tool] Starting generation of ${numImages} image(s)...`);

      // Generate the specified number of images
      for (let i = 1; i <= numImages; i++) {
        console.log(`\n🖼️ [Image Generation Tool] Generating image ${i} of ${numImages}...`);

        // Create a unique prompt variation for each image
        const imagePrompt = `${enhancedPrompt} - Image ${i} of ${numImages}`;
        console.log(`📝 [Image Generation Tool] Image prompt: ${imagePrompt.substring(0, 80)}...`);

        // Use Google Imagen API for actual image generation
        console.log(`🚀 [Image Generation Tool] Calling generateSceneImage...`);
        const imageData = await generateSceneImage(imagePrompt, style);
        console.log(`✅ [Image Generation Tool] Image data received (${imageData.length} characters)`);

        // Save image locally
        const filename = `scene_${i}_${prompt.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 20)}_${Date.now()}`;
        console.log(`💾 [Image Generation Tool] Saving image with filename: ${filename}`);
        const localImagePath = await saveImageLocally(imageData, filename);
        console.log(`✅ [Image Generation Tool] Image saved locally: ${localImagePath}`);

        const imageMetadata = {
          generationTime: Date.now() - startTime,
          model: 'imagen-3.0-generate-002',
          quality,
          aspectRatio,
        };

        console.log(`📊 [Image Generation Tool] Image metadata:`, imageMetadata);

        images.push({
          imageUrl: localImagePath,
          prompt: imagePrompt,
          style,
          metadata: imageMetadata,
        });

        console.log(`✅ [Image Generation Tool] Image ${i} completed successfully`);
      }

      const totalTime = Date.now() - startTime;
      console.log(`\n🎉 [Image Generation Tool] All images generated successfully!`);
      console.log(`📊 [Image Generation Tool] Summary:`, {
        totalImages: numImages,
        style: style,
        totalTime: `${totalTime}ms`,
        averageTimePerImage: `${Math.round(totalTime / numImages)}ms`
      });

      return {
        images,
        totalImages: numImages,
        style,
      };
    } catch (error) {
      console.error(`❌ [Image Generation Tool] Image generation failed:`, error);
      throw new Error(`Image generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
});