# Mastra Evaluation System

## Overview

The AI Story Board Generator project includes a comprehensive evaluation system built on Mastra Evals to measure the quality and effectiveness of AI agent outputs. The system uses heuristic-based metrics to evaluate different aspects of generated content without requiring additional LLM calls.

## Available Evaluation Metrics

### Storyboard-Specific Metrics (`src/mastra/evals/storyboard-evals.ts`)

- **StoryboardStructureMetric**: Validates JSON structure and required fields
- **VisualPromptQualityMetric**: Assesses visual description quality and detail
- **StoryContentCompletenessMetric**: Checks for complete story elements
- **CharacterConsistencyMetric**: Evaluates character development consistency
- **NarrativeFlowMetric**: Measures story flow and pacing

### Script Generator Metrics (`src/mastra/evals/script-evals.ts`)

- **ScriptStructureMetric**: Validates script format and scene structure
- **DialogueQualityMetric**: Assesses dialogue naturalness and character voice
- **CharacterDevelopmentMetric**: Evaluates character arc and development
- **PlotCoherenceMetric**: Measures story logic and plot consistency
- **GenreAlignmentMetric**: Checks genre-specific elements and themes

### Image Generator Metrics (`src/mastra/evals/image-evals.ts`)

- **ImagePromptQualityMetric**: Evaluates prompt specificity and detail
- **VisualConsistencyMetric**: Assesses visual style consistency
- **TechnicalSpecsMetric**: Validates technical specifications
- **CreativeElementsMetric**: Measures creative and artistic elements
- **CharacterFocusMetric**: Evaluates character portrayal accuracy

### Export Metrics (`src/mastra/evals/export-evals.ts`)

- **ExportFormatMetric**: Validates export format compliance
- **ExportCompletenessMetric**: Checks data completeness
- **ExportStructureMetric**: Evaluates structural organization
- **ExportQualityMetric**: Assesses overall export quality
- **ExportReadinessMetric**: Measures production readiness

### PDF Upload Metrics (`src/mastra/evals/pdf-evals.ts`)

- **PDFUploadValidationMetric**: Validates PDF upload process
- **PDFContentExtractionMetric**: Evaluates content extraction quality
- **PDFStructureAnalysisMetric**: Assesses structure analysis accuracy
- **PDFProcessingQualityMetric**: Measures processing efficiency
- **PDFDataConversionMetric**: Evaluates data conversion accuracy

## Technical Implementation

### JSON Extraction Helper

All evaluation metrics include a helper function to handle JSON wrapped in markdown code blocks:

```typescript
function extractJSON(output: string): string {
  // Remove markdown code block markers
  let cleaned = output.replace(/```json\s*/gi, '').replace(/```\s*$/gi, '').trim();
  return cleaned;
}
```

### Detailed Logging

Each metric includes comprehensive logging for debugging and transparency:

```typescript
console.log('🔍 [MetricName] Starting evaluation...');
console.log('🔍 [MetricName] Input:', input.substring(0, 100) + '...');
console.log('🔍 [MetricName] Output length:', output.length);
console.log('🔍 [MetricName] Parsed data:', parsed);
```

### Heuristic-Based Evaluation

Metrics use rule-based logic instead of LLM-as-judge for efficiency:

- **Structure Validation**: Checks JSON format and required fields
- **Content Analysis**: Uses regex patterns and keyword matching
- **Quality Scoring**: Implements scoring algorithms based on content characteristics
- **Consistency Checks**: Validates patterns across multiple elements

## Integration

### Agent Configuration

Each agent includes evaluation metrics in its configuration:

```typescript
import { storyboardSpecificEvals } from '../evals/storyboard-evals';

export const storyboardAgent = createAgent({
  name: 'storyboard-creator',
  evals: storyboardSpecificEvals,
  // ... other configuration
});
```

### Available Agents with Evals

1. **Storyboard Creator Agent** (`storyboard-agent.ts`)
   - Uses: `storyboardSpecificEvals`
   - Evaluates: Storyboard structure, visual prompts, content completeness

2. **Script Generator Agent** (`script-generator-agent.ts`)
   - Uses: `scriptSpecificEvals`
   - Evaluates: Script structure, dialogue quality, character development

3. **Image Generator Agent** (`image-generator-agent.ts`)
   - Uses: `imageSpecificEvals`
   - Evaluates: Image prompts, visual consistency, technical specs

4. **Export Specialist Agent** (`export-agent.ts`)
   - Uses: `exportSpecificEvals`
   - Evaluates: Export formats, completeness, quality

5. **PDF Upload Agent** (`pdf-upload-agent.ts`)
   - Uses: `pdfSpecificEvals`
   - Evaluates: PDF processing, content extraction, data conversion

## Usage

### Running Individual Metrics

```typescript
import { storyboardSpecificEvals } from './src/mastra/evals/storyboard-evals';

const metric = storyboardSpecificEvals.storyboardStructure;
const result = await metric.measure(input, output);
console.log('Score:', result.score);
```

### Testing Evaluation System

```typescript
// Test file: test-evals-demo.ts
import { storyboardSpecificEvals, scriptSpecificEvals } from './src/mastra/evals';

// Test with sample data
const sampleOutput = `\`\`\`json
{
  "scenes": [
    {
      "sceneNumber": "1",
      "description": "A young woman stands at a crossroads",
      "visualElements": ["road", "forest", "sunset"]
    }
  ]
}
\`\`\``;

const result = await storyboardSpecificEvals.storyboardStructure.measure(
  "Create a storyboard for a drama",
  sampleOutput
);
```

### CI/CD Integration

The evaluation system is designed to integrate with CI/CD pipelines:

```typescript
// ci-setup.ts provides automated evaluation
import { runCICDEvals } from './src/mastra/evals/ci-setup';

// Run evaluations in CI environment
const results = await runCICDEvals();
```

## Metric Scoring

All metrics return scores between 0.0 and 1.0:

- **0.0-0.3**: Poor quality, needs significant improvement
- **0.4-0.6**: Acceptable quality, minor improvements needed
- **0.7-0.8**: Good quality, meets most requirements
- **0.9-1.0**: Excellent quality, exceeds expectations

## Debugging

### Common Issues

1. **JSON Parsing Errors**: Usually caused by markdown code blocks
   - Solution: Use `extractJSON()` helper function

2. **Zero Scores**: Often due to strict validation rules
   - Check: Field names, data types, required properties

3. **Inconsistent Results**: May indicate data format variations
   - Enable: Detailed logging for investigation

### Logging Levels

The evaluation system provides detailed logging:

- **Input/Output Preview**: Shows first 100 characters
- **Parsing Status**: Confirms JSON parsing success
- **Field Validation**: Logs individual field checks
- **Score Calculation**: Shows scoring breakdown

## Future Enhancements

- **Custom Metric Creation**: Framework for adding new metrics
- **Performance Optimization**: Caching and batch processing
- **Advanced Analytics**: Trend analysis and quality tracking
- **Integration Testing**: Automated test suites for metrics