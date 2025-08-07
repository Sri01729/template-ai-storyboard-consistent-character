import { storyboardSpecificEvals } from './storyboard-evals';
import { scriptSpecificEvals } from './script-evals';
import { imageSpecificEvals } from './image-evals';
import { exportSpecificEvals } from './export-evals';
import { pdfSpecificEvals } from './pdf-evals';

// Export all evaluation metrics
export const evals = {
  // Storyboard-specific evaluations
  ...storyboardSpecificEvals,
  // Script-specific evaluations
  ...scriptSpecificEvals,
  // Image-specific evaluations
  ...imageSpecificEvals,
  // Export-specific evaluations
  ...exportSpecificEvals,
  // PDF-specific evaluations
  ...pdfSpecificEvals,
};

// Export individual evals for convenience
export const {
  // Storyboard evals
  structure,
  visualPromptQuality,
  storyContentCompleteness,
  characterConsistency,
  narrativeFlow,
  // Script evals
  dialogueQuality,
  characterDevelopment,
  plotCoherence,
  genreAlignment,
  // Image evals
  promptQuality,
  visualConsistency,
  technicalSpecs,
  creativeElements,
  characterFocus,
  // Export evals
  format,
  completeness,
  quality,
  readiness,
  // PDF evals
  uploadValidation,
  contentExtraction,
  structureAnalysis,
  processingQuality,
  dataConversion,
} = evals;

// Export the main evals object as default
export default evals;