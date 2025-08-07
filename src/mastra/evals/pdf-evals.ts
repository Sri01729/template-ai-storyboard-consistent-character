import { z } from 'zod';

// Define the metric result interface
interface MetricResult {
  score: number;
  info: Record<string, any>;
}

// Helper function to extract JSON from markdown code blocks
function extractJSON(output: string): string {
  console.log('🔍 [JSON Extraction] Original output starts with:', output.substring(0, 100));

  // Remove markdown code block markers
  let cleaned = output;

  // Remove ```json and ``` markers
  cleaned = cleaned.replace(/```json\s*/gi, '');
  cleaned = cleaned.replace(/```\s*$/gi, '');

  // Remove any leading/trailing whitespace
  cleaned = cleaned.trim();

  console.log('🔍 [JSON Extraction] Cleaned output starts with:', cleaned.substring(0, 100));

  return cleaned;
}

// Custom eval for PDF upload validation
export class PDFUploadValidationMetric {
  async measure(input: string, output: string): Promise<MetricResult> {
    console.log('🔍 [PDFUploadValidationMetric] Starting evaluation...');
    console.log('🔍 [PDFUploadValidationMetric] Input:', input.substring(0, 100) + '...');
    console.log('🔍 [PDFUploadValidationMetric] Output length:', output.length);

    try {
      // Extract JSON from markdown if needed
      const jsonOutput = extractJSON(output);

      // Parse the output to check if it's valid JSON
      console.log('🔍 [PDFUploadValidationMetric] Attempting to parse JSON...');
      const parsed = JSON.parse(jsonOutput);
      console.log('🔍 [PDFUploadValidationMetric] JSON parsed successfully');
      console.log('🔍 [PDFUploadValidationMetric] Parsed keys:', Object.keys(parsed));

      if (!parsed.valid || typeof parsed.valid !== 'boolean') {
        console.log('❌ [PDFUploadValidationMetric] No validation result found in output');
        return { score: 0, info: { reason: 'No validation result found in output' } };
      }

      const isValid = parsed.valid;
      console.log('🔍 [PDFUploadValidationMetric] Is valid:', isValid);

      // Check for additional validation details
      const hasErrorDetails = parsed.errors && Array.isArray(parsed.errors);
      const hasFileInfo = parsed.fileInfo && typeof parsed.fileInfo === 'object';

      console.log('🔍 [PDFUploadValidationMetric] Has error details:', hasErrorDetails);
      console.log('🔍 [PDFUploadValidationMetric] Has file info:', hasFileInfo);

      return {
        score: isValid ? 1 : 0,
        info: {
          reason: `PDF upload validation: ${isValid ? 'Valid' : 'Invalid'} file`,
          isValid,
          hasErrorDetails,
          hasFileInfo,
          errors: parsed.errors || []
        }
      };
    } catch (error) {
      console.log('❌ [PDFUploadValidationMetric] Error parsing JSON:', error);
      return {
        score: 0,
        info: {
          reason: 'Error evaluating PDF upload validation',
          error: error instanceof Error ? error.message : 'Unknown error',
          outputPreview: output.substring(0, 200) + '...'
        }
      };
    }
  }
}

// Custom eval for PDF content extraction
export class PDFContentExtractionMetric {
  async measure(input: string, output: string): Promise<MetricResult> {
    console.log('🔍 [PDFContentExtractionMetric] Starting evaluation...');

    try {
      const jsonOutput = extractJSON(output);
      const parsed = JSON.parse(jsonOutput);
      console.log('🔍 [PDFContentExtractionMetric] JSON parsed successfully');

      if (!parsed.content || typeof parsed.content !== 'string') {
        console.log('❌ [PDFContentExtractionMetric] No content found in output');
        return { score: 0, info: { reason: 'No content found in output' } };
      }

      const content = parsed.content;
      console.log('🔍 [PDFContentExtractionMetric] Content length:', content.length);

      let score = 0;
      let totalChecks = 0;

      // Check for content quality indicators
      const hasText = content.trim().length > 0;
      if (hasText) score += 0.4;
      totalChecks++;
      console.log('🔍 [PDFContentExtractionMetric] Has text:', hasText);

      const hasStructuredContent = /title|chapter|section|paragraph|list|table/i.test(content);
      if (hasStructuredContent) score += 0.3;
      totalChecks++;
      console.log('🔍 [PDFContentExtractionMetric] Has structured content:', hasStructuredContent);

      const hasMetadata = parsed.metadata && typeof parsed.metadata === 'object';
      if (hasMetadata) score += 0.3;
      totalChecks++;
      console.log('🔍 [PDFContentExtractionMetric] Has metadata:', hasMetadata);

      const finalScore = totalChecks > 0 ? score / totalChecks : 0;
      console.log('🔍 [PDFContentExtractionMetric] Final score:', finalScore);

      return {
        score: finalScore,
        info: {
          reason: `PDF content extraction: ${(finalScore * 100).toFixed(1)}%`,
          contentLength: content.length,
          hasText,
          hasStructuredContent,
          hasMetadata,
          totalChecks
        }
      };
    } catch (error) {
      console.log('❌ [PDFContentExtractionMetric] Error:', error);
      return {
        score: 0,
        info: {
          reason: 'Error evaluating PDF content extraction',
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }
}

// Custom eval for PDF structure analysis
export class PDFStructureAnalysisMetric {
  async measure(input: string, output: string): Promise<MetricResult> {
    console.log('🔍 [PDFStructureAnalysisMetric] Starting evaluation...');

    try {
      const jsonOutput = extractJSON(output);
      const parsed = JSON.parse(jsonOutput);
      console.log('🔍 [PDFStructureAnalysisMetric] JSON parsed successfully');

      if (!parsed.structure || typeof parsed.structure !== 'object') {
        console.log('❌ [PDFStructureAnalysisMetric] No structure analysis found in output');
        return { score: 0, info: { reason: 'No structure analysis found in output' } };
      }

      const structure = parsed.structure;
      console.log('🔍 [PDFStructureAnalysisMetric] Structure keys:', Object.keys(structure));

      let score = 0;
      let totalChecks = 0;

      // Check for structure analysis quality
      const hasPages = structure.pages && Array.isArray(structure.pages);
      if (hasPages) score += 0.3;
      totalChecks++;
      console.log('🔍 [PDFStructureAnalysisMetric] Has pages:', hasPages);

      const hasSections = structure.sections && Array.isArray(structure.sections);
      if (hasSections) score += 0.3;
      totalChecks++;
      console.log('🔍 [PDFStructureAnalysisMetric] Has sections:', hasSections);

      const hasLayout = structure.layout && typeof structure.layout === 'object';
      if (hasLayout) score += 0.2;
      totalChecks++;
      console.log('🔍 [PDFStructureAnalysisMetric] Has layout:', hasLayout);

      const hasTextBlocks = structure.textBlocks && Array.isArray(structure.textBlocks);
      if (hasTextBlocks) score += 0.2;
      totalChecks++;
      console.log('🔍 [PDFStructureAnalysisMetric] Has text blocks:', hasTextBlocks);

      const finalScore = totalChecks > 0 ? score / totalChecks : 0;
      console.log('🔍 [PDFStructureAnalysisMetric] Final score:', finalScore);

      return {
        score: finalScore,
        info: {
          reason: `PDF structure analysis: ${(finalScore * 100).toFixed(1)}%`,
          hasPages,
          hasSections,
          hasLayout,
          hasTextBlocks,
          totalChecks
        }
      };
    } catch (error) {
      console.log('❌ [PDFStructureAnalysisMetric] Error:', error);
      return {
        score: 0,
        info: {
          reason: 'Error evaluating PDF structure analysis',
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }
}

// Custom eval for PDF processing quality
export class PDFProcessingQualityMetric {
  async measure(input: string, output: string): Promise<MetricResult> {
    console.log('🔍 [PDFProcessingQualityMetric] Starting evaluation...');

    try {
      const jsonOutput = extractJSON(output);
      const parsed = JSON.parse(jsonOutput);
      console.log('🔍 [PDFProcessingQualityMetric] JSON parsed successfully');

      if (!parsed.quality || typeof parsed.quality !== 'object') {
        console.log('❌ [PDFProcessingQualityMetric] No quality metrics found in output');
        return { score: 0, info: { reason: 'No quality metrics found in output' } };
      }

      const quality = parsed.quality;
      console.log('🔍 [PDFProcessingQualityMetric] Quality keys:', Object.keys(quality));

      let score = 0;
      let totalChecks = 0;

      // Check for processing quality indicators
      const hasConfidence = typeof quality.confidence === 'number' && quality.confidence >= 0 && quality.confidence <= 1;
      if (hasConfidence) score += 0.4;
      totalChecks++;
      console.log('🔍 [PDFProcessingQualityMetric] Has confidence:', hasConfidence);

      const hasAccuracy = typeof quality.accuracy === 'number' && quality.accuracy >= 0 && quality.accuracy <= 1;
      if (hasAccuracy) score += 0.3;
      totalChecks++;
      console.log('🔍 [PDFProcessingQualityMetric] Has accuracy:', hasAccuracy);

      const hasCompleteness = typeof quality.completeness === 'number' && quality.completeness >= 0 && quality.completeness <= 1;
      if (hasCompleteness) score += 0.3;
      totalChecks++;
      console.log('🔍 [PDFProcessingQualityMetric] Has completeness:', hasCompleteness);

      const finalScore = totalChecks > 0 ? score / totalChecks : 0;
      console.log('🔍 [PDFProcessingQualityMetric] Final score:', finalScore);

      return {
        score: finalScore,
        info: {
          reason: `PDF processing quality: ${(finalScore * 100).toFixed(1)}%`,
          hasConfidence,
          hasAccuracy,
          hasCompleteness,
          totalChecks
        }
      };
    } catch (error) {
      console.log('❌ [PDFProcessingQualityMetric] Error:', error);
      return {
        score: 0,
        info: {
          reason: 'Error evaluating PDF processing quality',
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }
}

// Custom eval for PDF data conversion
export class PDFDataConversionMetric {
  async measure(input: string, output: string): Promise<MetricResult> {
    console.log('🔍 [PDFDataConversionMetric] Starting evaluation...');

    try {
      const jsonOutput = extractJSON(output);
      const parsed = JSON.parse(jsonOutput);
      console.log('🔍 [PDFDataConversionMetric] JSON parsed successfully');

      if (!parsed.convertedData || typeof parsed.convertedData !== 'object') {
        console.log('❌ [PDFDataConversionMetric] No converted data found in output');
        return { score: 0, info: { reason: 'No converted data found in output' } };
      }

      const convertedData = parsed.convertedData;
      console.log('🔍 [PDFDataConversionMetric] Converted data keys:', Object.keys(convertedData));

      let score = 0;
      let totalChecks = 0;

      // Check for data conversion quality
      const hasStructuredData = convertedData.scenes || convertedData.characters || convertedData.storyboard;
      if (hasStructuredData) score += 0.4;
      totalChecks++;
      console.log('🔍 [PDFDataConversionMetric] Has structured data:', hasStructuredData);

      const hasFormattedContent = convertedData.formattedContent || convertedData.processedText;
      if (hasFormattedContent) score += 0.3;
      totalChecks++;
      console.log('🔍 [PDFDataConversionMetric] Has formatted content:', hasFormattedContent);

      const hasMetadata = convertedData.metadata && typeof convertedData.metadata === 'object';
      if (hasMetadata) score += 0.3;
      totalChecks++;
      console.log('🔍 [PDFDataConversionMetric] Has metadata:', hasMetadata);

      const finalScore = totalChecks > 0 ? score / totalChecks : 0;
      console.log('🔍 [PDFDataConversionMetric] Final score:', finalScore);

      return {
        score: finalScore,
        info: {
          reason: `PDF data conversion: ${(finalScore * 100).toFixed(1)}%`,
          hasStructuredData,
          hasFormattedContent,
          hasMetadata,
          totalChecks
        }
      };
    } catch (error) {
      console.log('❌ [PDFDataConversionMetric] Error:', error);
      return {
        score: 0,
        info: {
          reason: 'Error evaluating PDF data conversion',
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }
}

// Export all PDF-specific evals
export const pdfSpecificEvals = {
  uploadValidation: new PDFUploadValidationMetric(),
  contentExtraction: new PDFContentExtractionMetric(),
  structureAnalysis: new PDFStructureAnalysisMetric(),
  processingQuality: new PDFProcessingQualityMetric(),
  dataConversion: new PDFDataConversionMetric(),
};