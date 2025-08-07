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

// Custom eval for export format validation
export class ExportFormatMetric {
  async measure(input: string, output: string): Promise<MetricResult> {
    console.log('🔍 [ExportFormatMetric] Starting evaluation...');
    console.log('🔍 [ExportFormatMetric] Input:', input.substring(0, 100) + '...');
    console.log('🔍 [ExportFormatMetric] Output length:', output.length);
    
    try {
      // Extract JSON from markdown if needed
      const jsonOutput = extractJSON(output);
      
      // Parse the output to check if it's valid JSON
      console.log('🔍 [ExportFormatMetric] Attempting to parse JSON...');
      const parsed = JSON.parse(jsonOutput);
      console.log('🔍 [ExportFormatMetric] JSON parsed successfully');
      console.log('🔍 [ExportFormatMetric] Parsed keys:', Object.keys(parsed));

      if (!parsed.format || typeof parsed.format !== 'string') {
        console.log('❌ [ExportFormatMetric] No format specified in output');
        return { score: 0, info: { reason: 'No format specified in output' } };
      }

      const format = parsed.format.toLowerCase();
      console.log('🔍 [ExportFormatMetric] Format:', format);
      
      // Check for valid export formats
      const validFormats = ['pdf', 'png', 'jpg', 'jpeg', 'svg', 'html', 'json', 'xml'];
      const isValidFormat = validFormats.includes(format);
      
      console.log('🔍 [ExportFormatMetric] Is valid format:', isValidFormat);

      return {
        score: isValidFormat ? 1 : 0,
        info: {
          reason: `Export format validation: ${isValidFormat ? 'Valid' : 'Invalid'} format (${format})`,
          format,
          isValidFormat,
          validFormats
        }
      };
    } catch (error) {
      console.log('❌ [ExportFormatMetric] Error parsing JSON:', error);
      return {
        score: 0,
        info: {
          reason: 'Error evaluating export format',
          error: error instanceof Error ? error.message : 'Unknown error',
          outputPreview: output.substring(0, 200) + '...'
        }
      };
    }
  }
}

// Custom eval for export completeness
export class ExportCompletenessMetric {
  async measure(input: string, output: string): Promise<MetricResult> {
    console.log('🔍 [ExportCompletenessMetric] Starting evaluation...');
    
    try {
      const jsonOutput = extractJSON(output);
      const parsed = JSON.parse(jsonOutput);
      console.log('🔍 [ExportCompletenessMetric] JSON parsed successfully');
      
      if (!parsed.data || typeof parsed.data !== 'object') {
        console.log('❌ [ExportCompletenessMetric] No data found in output');
        return { score: 0, info: { reason: 'No data found in output' } };
      }

      const data = parsed.data;
      console.log('🔍 [ExportCompletenessMetric] Data keys:', Object.keys(data));
      
      let score = 0;
      let totalChecks = 0;

      // Check for required export data fields
      const hasContent = data.content && typeof data.content === 'string' && data.content.trim().length > 0;
      if (hasContent) score += 0.4;
      totalChecks++;
      console.log('🔍 [ExportCompletenessMetric] Has content:', hasContent);

      const hasMetadata = data.metadata && typeof data.metadata === 'object';
      if (hasMetadata) score += 0.3;
      totalChecks++;
      console.log('🔍 [ExportCompletenessMetric] Has metadata:', hasMetadata);

      const hasTimestamp = data.timestamp || data.createdAt || data.exportedAt;
      if (hasTimestamp) score += 0.3;
      totalChecks++;
      console.log('🔍 [ExportCompletenessMetric] Has timestamp:', hasTimestamp);

      const finalScore = totalChecks > 0 ? score / totalChecks : 0;
      console.log('🔍 [ExportCompletenessMetric] Final score:', finalScore);

      return {
        score: finalScore,
        info: {
          reason: `Export completeness: ${(finalScore * 100).toFixed(1)}%`,
          hasContent,
          hasMetadata,
          hasTimestamp,
          totalChecks
        }
      };
    } catch (error) {
      console.log('❌ [ExportCompletenessMetric] Error:', error);
      return {
        score: 0,
        info: {
          reason: 'Error evaluating export completeness',
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }
}

// Custom eval for export structure
export class ExportStructureMetric {
  async measure(input: string, output: string): Promise<MetricResult> {
    console.log('🔍 [ExportStructureMetric] Starting evaluation...');
    
    try {
      const jsonOutput = extractJSON(output);
      const parsed = JSON.parse(jsonOutput);
      console.log('🔍 [ExportStructureMetric] JSON parsed successfully');
      
      if (!parsed.data || typeof parsed.data !== 'object') {
        console.log('❌ [ExportStructureMetric] No data found in output');
        return { score: 0, info: { reason: 'No data found in output' } };
      }

      const data = parsed.data;
      console.log('🔍 [ExportStructureMetric] Data structure:', Object.keys(data));
      
      let score = 0;
      let totalChecks = 0;

      // Check for proper export structure
      const hasValidStructure = typeof data === 'object' && data !== null;
      if (hasValidStructure) score += 0.5;
      totalChecks++;
      console.log('🔍 [ExportStructureMetric] Has valid structure:', hasValidStructure);

      const hasRequiredFields = data.content || data.scenes || data.characters || data.storyboard;
      if (hasRequiredFields) score += 0.5;
      totalChecks++;
      console.log('🔍 [ExportStructureMetric] Has required fields:', hasRequiredFields);

      const finalScore = totalChecks > 0 ? score / totalChecks : 0;
      console.log('🔍 [ExportStructureMetric] Final score:', finalScore);

      return {
        score: finalScore,
        info: {
          reason: `Export structure: ${(finalScore * 100).toFixed(1)}%`,
          hasValidStructure,
          hasRequiredFields,
          totalChecks
        }
      };
    } catch (error) {
      console.log('❌ [ExportStructureMetric] Error:', error);
      return {
        score: 0,
        info: {
          reason: 'Error evaluating export structure',
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }
}

// Custom eval for export quality
export class ExportQualityMetric {
  async measure(input: string, output: string): Promise<MetricResult> {
    console.log('🔍 [ExportQualityMetric] Starting evaluation...');
    
    try {
      const jsonOutput = extractJSON(output);
      const parsed = JSON.parse(jsonOutput);
      console.log('🔍 [ExportQualityMetric] JSON parsed successfully');
      
      if (!parsed.data || typeof parsed.data !== 'object') {
        console.log('❌ [ExportQualityMetric] No data found in output');
        return { score: 0, info: { reason: 'No data found in output' } };
      }

      const data = parsed.data;
      console.log('🔍 [ExportQualityMetric] Data keys:', Object.keys(data));
      
      let score = 0;
      let totalChecks = 0;

      // Check for export quality indicators
      const hasHighQuality = data.quality === 'high' || data.resolution === 'high' || data.dpi >= 300;
      if (hasHighQuality) score += 0.4;
      totalChecks++;
      console.log('🔍 [ExportQualityMetric] Has high quality:', hasHighQuality);

      const hasOptimization = data.optimized || data.compressed || data.optimization;
      if (hasOptimization) score += 0.3;
      totalChecks++;
      console.log('🔍 [ExportQualityMetric] Has optimization:', hasOptimization);

      const hasErrorHandling = data.errorHandling || data.validation || data.checksum;
      if (hasErrorHandling) score += 0.3;
      totalChecks++;
      console.log('🔍 [ExportQualityMetric] Has error handling:', hasErrorHandling);

      const finalScore = totalChecks > 0 ? score / totalChecks : 0;
      console.log('🔍 [ExportQualityMetric] Final score:', finalScore);

      return {
        score: finalScore,
        info: {
          reason: `Export quality: ${(finalScore * 100).toFixed(1)}%`,
          hasHighQuality,
          hasOptimization,
          hasErrorHandling,
          totalChecks
        }
      };
    } catch (error) {
      console.log('❌ [ExportQualityMetric] Error:', error);
      return {
        score: 0,
        info: {
          reason: 'Error evaluating export quality',
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }
}

// Custom eval for export readiness
export class ExportReadinessMetric {
  async measure(input: string, output: string): Promise<MetricResult> {
    console.log('🔍 [ExportReadinessMetric] Starting evaluation...');
    
    try {
      const jsonOutput = extractJSON(output);
      const parsed = JSON.parse(jsonOutput);
      console.log('🔍 [ExportReadinessMetric] JSON parsed successfully');
      
      if (!parsed.data || typeof parsed.data !== 'object') {
        console.log('❌ [ExportReadinessMetric] No data found in output');
        return { score: 0, info: { reason: 'No data found in output' } };
      }

      const data = parsed.data;
      console.log('🔍 [ExportReadinessMetric] Data keys:', Object.keys(data));
      
      let score = 0;
      let totalChecks = 0;

      // Check for export readiness indicators
      const isReady = data.ready === true || data.status === 'ready' || data.complete === true;
      if (isReady) score += 0.5;
      totalChecks++;
      console.log('🔍 [ExportReadinessMetric] Is ready:', isReady);

      const hasUrl = data.url || data.downloadUrl || data.fileUrl;
      if (hasUrl) score += 0.3;
      totalChecks++;
      console.log('🔍 [ExportReadinessMetric] Has URL:', hasUrl);

      const hasSize = data.size || data.fileSize || data.bytes;
      if (hasSize) score += 0.2;
      totalChecks++;
      console.log('🔍 [ExportReadinessMetric] Has size info:', hasSize);

      const finalScore = totalChecks > 0 ? score / totalChecks : 0;
      console.log('🔍 [ExportReadinessMetric] Final score:', finalScore);

      return {
        score: finalScore,
        info: {
          reason: `Export readiness: ${(finalScore * 100).toFixed(1)}%`,
          isReady,
          hasUrl,
          hasSize,
          totalChecks
        }
      };
    } catch (error) {
      console.log('❌ [ExportReadinessMetric] Error:', error);
      return {
        score: 0,
        info: {
          reason: 'Error evaluating export readiness',
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }
}

// Export all export-specific evals
export const exportSpecificEvals = {
  format: new ExportFormatMetric(),
  completeness: new ExportCompletenessMetric(),
  structure: new ExportStructureMetric(),
  quality: new ExportQualityMetric(),
  readiness: new ExportReadinessMetric(),
};