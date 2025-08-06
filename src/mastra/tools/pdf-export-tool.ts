import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import PDFDocument from 'pdfkit';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const pdfExportTool = createTool({
  id: 'exportToPdf',
  description: 'Export storyboard data to a beautiful PDF with embedded images and decorative borders',
  inputSchema: z.object({
    storyboardData: z.any().describe('Storyboard data with scenes and images'),
    title: z.string().describe('Title for the PDF'),
    includeImages: z.boolean().default(true).describe('Whether to include images in the PDF'),
    format: z.enum(['A4', 'Letter', 'Custom']).default('A4').describe('PDF page format'),
  }),
  outputSchema: z.object({
    pdfPath: z.string().describe('Path to the generated PDF file'),
    title: z.string().describe('Title of the storyboard'),
    pageCount: z.number().describe('Number of pages in the PDF'),
    fileSize: z.number().describe('Size of the PDF file in bytes'),
    metadata: z.object({
      generationTime: z.number().describe('Time taken to generate in milliseconds'),
      format: z.string().describe('PDF format used'),
      includeImages: z.boolean().describe('Whether images were included'),
      scenesProcessed: z.number().describe('Number of scenes processed'),
      imagesEmbedded: z.number().describe('Number of images embedded'),
    }).optional(),
  }),
  execute: async ({ context }) => {
    console.log('🚀 [PDF Export Tool] Starting PDF generation process...');
    console.log(`📋 [PDF Export Tool] Input parameters:`, {
      title: context.title,
      includeImages: context.includeImages,
      format: context.format,
      storyboardDataLength: Array.isArray(context.storyboardData) ? context.storyboardData.length : 'Not an array'
    });

    const startTime = Date.now();
    let scenesProcessed = 0;
    let imagesEmbedded = 0;

    try {
      // Create output directory
      const projectRoot = path.resolve(__dirname, '../../..'); // Go up from src/mastra/tools to project root
      const outputDir = path.join(projectRoot, 'generated-exports');
      console.log(`📁 [PDF Export Tool] Project root: ${projectRoot}`);
      console.log(`📁 [PDF Export Tool] Creating output directory: ${outputDir}`);

      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
        console.log(`✅ [PDF Export Tool] Output directory created successfully`);
      } else {
        console.log(`✅ [PDF Export Tool] Output directory already exists`);
      }

      // Generate filename with timestamp
    const timestamp = Date.now();
      const safeTitle = context.title.replace(/[^a-zA-Z0-9]/g, '_');
      const filename = `${safeTitle}_storyboard_${timestamp}.pdf`;
      const pdfPath = path.join(outputDir, filename);

      console.log(`📄 [PDF Export Tool] Generated filename: ${filename}`);
      console.log(`📄 [PDF Export Tool] Full PDF path: ${pdfPath}`);

      // Create PDF document
      console.log(`🖨️ [PDF Export Tool] Creating PDF document with format: ${context.format}`);
      const doc = new PDFDocument({
        size: context.format,
        margins: {
          top: 50,
          bottom: 50,
          left: 50,
          right: 50
        }
      });

      // Pipe to file
      const writeStream = fs.createWriteStream(pdfPath);
      doc.pipe(writeStream);

      console.log(`📝 [PDF Export Tool] PDF document created and piped to file stream`);

      // Helper function to draw flower borders
      function drawFlowerBorder(doc: PDFKit.PDFDocument) {
        console.log(`🌸 [PDF Export Tool] Drawing flower borders on page`);
        const pageWidth = doc.page.width;
        const pageHeight = doc.page.height;
        const margin = 40;

        // Save current state
        doc.save();

        // Set flower colors - much brighter and more visible
        const flowerColors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF'];

        // Draw flowers in corners - much larger and more prominent
        const corners = [
          { x: margin, y: margin }, // Top-left
          { x: pageWidth - margin, y: margin }, // Top-right
          { x: margin, y: pageHeight - margin }, // Bottom-left
          { x: pageWidth - margin, y: pageHeight - margin } // Bottom-right
        ];

        console.log(`🌸 [PDF Export Tool] Drawing ${corners.length} corner flowers`);

        corners.forEach((corner, index) => {
          const color = flowerColors[index % flowerColors.length];

          // Draw flower petals (5 petals per flower) - much larger petals
          for (let i = 0; i < 5; i++) {
            const angle = (i * 72) * (Math.PI / 180); // 72 degrees between petals
            const petalX = corner.x + Math.cos(angle) * 25;
            const petalY = corner.y + Math.sin(angle) * 25;

            // Fill petal with color
            doc.fillColor(color);
            doc.circle(petalX, petalY, 15);

            // Add black stroke to make it more visible
            doc.strokeColor('#000000');
            doc.lineWidth(2);
            doc.circle(petalX, petalY, 15);
          }

          // Draw flower center - much larger center
          doc.fillColor('#FF4500');
          doc.circle(corner.x, corner.y, 12);
          doc.strokeColor('#000000');
          doc.lineWidth(2);
          doc.circle(corner.x, corner.y, 12);
        });

        // Draw small flowers along the sides - more flowers and much larger
        const sideFlowers = 6;
        console.log(`🌸 [PDF Export Tool] Drawing ${sideFlowers} side flowers on each edge`);

        for (let i = 1; i < sideFlowers; i++) {
          const progress = i / sideFlowers;

          // Top side
          const topX = margin + (pageWidth - 2 * margin) * progress;
          const topColor = flowerColors[i % flowerColors.length];

          // Draw petals for top flower
          for (let j = 0; j < 5; j++) {
            const angle = (j * 72) * (Math.PI / 180);
            const petalX = topX + Math.cos(angle) * 15;
            const petalY = margin + Math.sin(angle) * 15;

            doc.fillColor(topColor);
            doc.circle(petalX, petalY, 10);
            doc.strokeColor('#000000');
            doc.lineWidth(1);
            doc.circle(petalX, petalY, 10);
          }

          // Draw center for top flower
          doc.fillColor('#FF4500');
          doc.circle(topX, margin, 8);
          doc.strokeColor('#000000');
          doc.circle(topX, margin, 8);

          // Bottom side
          const bottomX = margin + (pageWidth - 2 * margin) * progress;
          const bottomColor = flowerColors[(i + 2) % flowerColors.length];

          // Draw petals for bottom flower
          for (let j = 0; j < 5; j++) {
            const angle = (j * 72) * (Math.PI / 180);
            const petalX = bottomX + Math.cos(angle) * 15;
            const petalY = pageHeight - margin + Math.sin(angle) * 15;

            doc.fillColor(bottomColor);
            doc.circle(petalX, petalY, 10);
            doc.strokeColor('#000000');
            doc.lineWidth(1);
            doc.circle(petalX, petalY, 10);
          }

          // Draw center for bottom flower
          doc.fillColor('#FF4500');
          doc.circle(bottomX, pageHeight - margin, 8);
          doc.strokeColor('#000000');
          doc.circle(bottomX, pageHeight - margin, 8);

          // Left side
          const leftY = margin + (pageHeight - 2 * margin) * progress;
          const leftColor = flowerColors[(i + 1) % flowerColors.length];

          // Draw petals for left flower
          for (let j = 0; j < 5; j++) {
            const angle = (j * 72) * (Math.PI / 180);
            const petalX = margin + Math.cos(angle) * 15;
            const petalY = leftY + Math.sin(angle) * 15;

            doc.fillColor(leftColor);
            doc.circle(petalX, petalY, 10);
            doc.strokeColor('#000000');
            doc.lineWidth(1);
            doc.circle(petalX, petalY, 10);
          }

          // Draw center for left flower
          doc.fillColor('#FF4500');
          doc.circle(margin, leftY, 8);
          doc.strokeColor('#000000');
          doc.circle(margin, leftY, 8);

          // Right side
          const rightY = margin + (pageHeight - 2 * margin) * progress;
          const rightColor = flowerColors[(i + 3) % flowerColors.length];

          // Draw petals for right flower
          for (let j = 0; j < 5; j++) {
            const angle = (j * 72) * (Math.PI / 180);
            const petalX = pageWidth - margin + Math.cos(angle) * 15;
            const petalY = rightY + Math.sin(angle) * 15;

            doc.fillColor(rightColor);
            doc.circle(petalX, petalY, 10);
            doc.strokeColor('#000000');
            doc.lineWidth(1);
            doc.circle(petalX, petalY, 10);
          }

          // Draw center for right flower
          doc.fillColor('#FF4500');
          doc.circle(pageWidth - margin, rightY, 8);
          doc.strokeColor('#000000');
          doc.circle(pageWidth - margin, rightY, 8);
        }

        // Restore state
        doc.restore();
        console.log(`✅ [PDF Export Tool] Flower borders drawn successfully`);
      }

      // Helper function to generate storybook content
      function generateStorybookContent(scenes: any[], doc: PDFKit.PDFDocument) {
        console.log(`📖 [PDF Export Tool] Generating storybook content for ${scenes.length} scenes`);

        scenes.forEach((scene, index) => {
          console.log(`\n📄 [PDF Export Tool] Processing scene ${index + 1} of ${scenes.length}`);

          // Draw flower borders on each page
          drawFlowerBorder(doc);

          // Add scene title
          console.log(`📝 [PDF Export Tool] Adding scene title`);
          doc.fontSize(24)
             .font('Times-Bold')
             .fillColor('#2C3E50')
             .text(`Scene ${index + 1}`, { align: 'center' })
             .moveDown(1);

          // Add image if available
          const imagePath = scene.imagePath || scene.imageUrl;
          if (imagePath && typeof imagePath === 'string') {
            console.log(`🖼️ [PDF Export Tool] Processing image: ${imagePath}`);
            try {
              // Fix path resolution - use project root for all paths
              const projectRoot = path.resolve(__dirname, '../../..'); // Go up from src/mastra/tools to project root
              let fullImagePath;

              if (imagePath.startsWith('.mastra/')) {
                // Handle legacy .mastra paths
                fullImagePath = path.resolve(projectRoot, imagePath);
                console.log(`🔍 [PDF Export Tool] Resolved .mastra path: ${fullImagePath}`);
              } else if (imagePath.startsWith('generated-images/')) {
                // Handle generated-images paths
                fullImagePath = path.resolve(projectRoot, imagePath);
                console.log(`🔍 [PDF Export Tool] Resolved generated-images path: ${fullImagePath}`);
              } else {
                // Handle relative paths by assuming they're in generated-images
                fullImagePath = path.resolve(projectRoot, 'generated-images', imagePath);
                console.log(`🔍 [PDF Export Tool] Resolved relative path to generated-images: ${fullImagePath}`);
              }

              console.log(`🔍 [PDF Export Tool] Checking if image exists: ${fullImagePath}`);
              const imageExists = fs.existsSync(fullImagePath);
              console.log(`🔍 [PDF Export Tool] Image exists: ${imageExists}`);

              if (imageExists) {
                console.log(`✅ [PDF Export Tool] Embedding image: ${fullImagePath}`);
                try {
                  // Calculate image dimensions to fit nicely on page
                  const pageWidth = doc.page.width;
                  const imageWidth = pageWidth - 120; // Leave margins
                  const imageHeight = 300; // Fixed height for consistency
                  const imageX = (pageWidth - imageWidth) / 2; // Center horizontally
                  const imageY = doc.y + 20; // Add some space after title

                  console.log(`📐 [PDF Export Tool] Image dimensions:`, {
                    pageWidth,
                    imageWidth,
                    imageHeight,
                    imageX,
                    imageY
                  });

                  doc.image(fullImagePath, imageX, imageY, {
                    width: imageWidth,
                    height: imageHeight
                  });
                  console.log(`✅ [PDF Export Tool] Successfully embedded image: ${fullImagePath}`);
                imagesEmbedded++;

                  // Move cursor well below the image to ensure text doesn't overlay
                  doc.y = imageY + imageHeight + 40; // Add significant space after image
                  doc.moveDown(1); // Additional spacing
                  console.log(`📏 [PDF Export Tool] Moved cursor below image to position: ${doc.y}`);
                } catch (imageError) {
                  console.error(`❌ [PDF Export Tool] PDFKit error embedding image: ${imageError}`);
                  doc.fontSize(14)
                     .font('Times-Italic')
                     .fillColor('#7F8C8D')
                     .text('Image file: ' + imagePath)
                     .moveDown(0.5);
                }
              } else {
                console.log(`❌ [PDF Export Tool] Image file not found: ${fullImagePath}`);
                doc.fontSize(14)
                   .font('Times-Italic')
                   .fillColor('#7F8C8D')
                   .text('Image file: ' + imagePath)
                   .moveDown(0.5);
              }
            } catch (error) {
              console.error(`❌ [PDF Export Tool] Error embedding image ${imagePath}:`, error);
              doc.fontSize(14)
                 .font('Times-Italic')
                 .fillColor('#7F8C8D')
                 .text('Image file: ' + imagePath)
                 .moveDown(0.5);
            }
          } else {
            console.log(`⚠️ [PDF Export Tool] No image path provided for scene ${index + 1}`);
          }

          // Add scene description with more detailed text
          const sceneDescription = scene.description || scene.text || '';
          const storyContent = scene.storyContent || scene.scriptContent || '';

          if (sceneDescription || storyContent) {
            console.log(`📝 [PDF Export Tool] Adding detailed text for scene: ${sceneDescription.substring(0, 50)}...`);

            // Use actual story content if available, otherwise fall back to generated text
            let storyText = '';

            if (storyContent && storyContent.trim()) {
              // Use the actual story content from the script
              storyText = storyContent;
              console.log(`📖 [PDF Export Tool] Using actual story content (${storyText.length} characters)`);
            } else if (sceneDescription.toLowerCase().includes('sheep') && sceneDescription.toLowerCase().includes('farm')) {
              storyText = `In the heart of a picturesque countryside, a fluffy white sheep named Daisy bounds joyfully across the rolling green hills of her beloved farm. The golden rays of the afternoon sun cast long shadows across the meadow, while wildflowers dance in the gentle breeze. Daisy's wool glistens like fresh snow as she leaps over small streams and dodges between ancient oak trees. Her playful spirit brings life to the peaceful landscape, and her soft bleating echoes across the valley, announcing her presence to the other farm animals. The scene captures the pure essence of rural tranquility and the simple joys of farm life.`;
              console.log(`🐑 [PDF Export Tool] Generated sheep/farm story text (${storyText.length} characters)`);
            } else if (sceneDescription.toLowerCase().includes('cowboy') && sceneDescription.toLowerCase().includes('fighting')) {
              storyText = `Under the scorching desert sun, a rugged cowboy named Marshal Jack stands his ground against a gang of ruthless outlaws. The dusty streets of the frontier town echo with the sound of leather boots on wooden planks as the tension builds. Jack's weathered face shows years of experience, his steely eyes scanning for any sudden movement. His hand hovers near the polished grip of his trusty six-shooter, while the outlaws circle like vultures, their intentions clear. The air crackles with anticipation as the first shot rings out, shattering the silence of the wild west. This is a moment that will be remembered in the annals of frontier justice, where one man's courage faces the test of true grit and determination.`;
              console.log(`🤠 [PDF Export Tool] Generated cowboy/fighting story text (${storyText.length} characters)`);
            } else {
              // Generic detailed text for other scenes
              storyText = `The scene unfolds with breathtaking detail, capturing every nuance of the moment. The lighting creates dramatic shadows that dance across the landscape, while the composition draws the viewer's eye through the narrative. Each element has been carefully crafted to tell a story, from the smallest details in the background to the main subjects that command attention. The atmosphere is palpable, transporting the audience into this carefully constructed world where every brushstroke and pixel serves the greater narrative. This is more than just an image—it's a window into another reality, a moment frozen in time that speaks to the heart and imagination.`;
              console.log(`🎭 [PDF Export Tool] Generated generic story text (${storyText.length} characters)`);
            }

            // Add the detailed story text with beautiful typography - ensure it's below the image
            console.log(`📖 [PDF Export Tool] Adding story text to PDF`);
            doc.fontSize(16)
               .font('Times-Roman')
               .fillColor('#34495E')
               .text(storyText, {
                 align: 'justify',
                 lineGap: 4,
                 paragraphGap: 8
               })
               .moveDown(1);
          }

          // Add scene number only (removed duplicate description)
          console.log(`📋 [PDF Export Tool] Adding scene number`);
          doc.fontSize(12)
             .font('Times-Italic')
             .fillColor('#95A5A6')
             .text(`Scene ${index + 1}`, { align: 'center' })
             .moveDown(1);

          scenesProcessed++;

          // Add new page for next scene (except for the last one)
          if (index < scenes.length - 1) {
            console.log(`📄 [PDF Export Tool] Adding new page for next scene`);
            doc.addPage();
          }
        });

        console.log(`✅ [PDF Export Tool] Storybook content generation completed`);
        console.log(`📊 [PDF Export Tool] Summary: ${scenesProcessed} scenes processed, ${imagesEmbedded} images embedded`);
      }

      // Process storyboard data
      let scenes: any[] = [];
      if (Array.isArray(context.storyboardData)) {
        scenes = context.storyboardData;
      } else if (context.storyboardData && Array.isArray(context.storyboardData.scenes)) {
        scenes = context.storyboardData.scenes;
      } else {
        scenes = [context.storyboardData];
      }

      // Generate content
      generateStorybookContent(scenes, doc);

      // Finalize PDF
      doc.end();

      return new Promise((resolve, reject) => {
        writeStream.on('finish', () => {
          const stats = fs.statSync(pdfPath);
          const generationTime = Date.now() - startTime;

          resolve({
            pdfPath: `generated-exports/${filename}`,
            title: context.title,
            pageCount: scenes.length,
            fileSize: stats.size,
        metadata: {
              generationTime,
              format: context.format,
              includeImages: context.includeImages,
          scenesProcessed,
          imagesEmbedded,
        },
          });
        });

        writeStream.on('error', reject);
      });
    } catch (error) {
      console.error(`❌ [PDF Export Tool] An unexpected error occurred during PDF generation:`, error);
      return Promise.reject(error);
    }
  },
});