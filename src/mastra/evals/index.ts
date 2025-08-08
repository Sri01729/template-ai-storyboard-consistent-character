import { storyboardSpecificEvals } from './storyboard-evals';
import { scriptSpecificEvals } from './script-evals';
import { imageSpecificEvals } from './image-evals';

// Export all evaluation metrics (only for creative content agents)
export const evals = {
  // Storyboard-specific evaluations
  ...storyboardSpecificEvals,
  // Script-specific evaluations
  ...scriptSpecificEvals,
  // Image-specific evaluations
  ...imageSpecificEvals,
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
} = evals;

// Export the main evals object as default
export default evals;