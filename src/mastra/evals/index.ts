import { storyboardSpecificEvals } from './storyboard-evals';
import { scriptSpecificEvals } from './script-evals';

// Export all evaluation metrics
export const evals = {
  // Storyboard-specific evaluations
  ...storyboardSpecificEvals,
  // Script-specific evaluations
  ...scriptSpecificEvals,
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
} = evals;

// Export the main evals object as default
export default evals;