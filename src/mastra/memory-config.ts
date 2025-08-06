import { Memory } from '@mastra/memory';
import { LibSQLStore, LibSQLVector } from '@mastra/libsql';
import { openai } from '@ai-sdk/openai';

/**
 * Create memory instance for individual agents
 * Each agent gets its own memory instance with conversation history and semantic recall
 * Now configured for resource-scoped memory to persist across all user threads
 */
export const createAgentMemory = () => {
  return new Memory({
    // Storage for conversation history
    storage: new LibSQLStore({
      url: "file:mastra-memory.db",
    }),

    // Vector store for semantic search
    vector: new LibSQLVector({
      connectionUrl: "file:mastra-memory.db",
    }),

    // Use OpenAI embedding for semantic search
    embedder: openai.embedding('text-embedding-3-small'),

    options: {
      // Number of recent messages to include in context
      lastMessages: 15,

      // Semantic search configuration - now resource-scoped
      semanticRecall: {
        topK: 5, // Number of similar messages to retrieve
        messageRange: {
          before: 2, // Messages to include before each result
          after: 1,  // Messages to include after each result
        },
        scope: 'resource', // Search across all threads for the same user
      },

      // Working memory configuration - simplified to match docs
      workingMemory: {
        enabled: true,
        template: `# User Profile

## Personal Information
- **Name**:
- **Location**:
- **Timezone**:
- **Communication Style**: [Formal/Casual]

## Project Context
- **Current Goal**:
- **Project Type**:
- **Preferred Style**:
- **Target Audience**:

## Session State
- **Last Task**:
- **Current Progress**:
- **Open Questions**:
- **Next Steps**:

## Preferences
- **Art Style**:
- **Story Genre**:
- **Character Focus**:
- **Visual Elements**:

## Technical Details
- **Export Format**:
- **Image Quality**:
- **Number of Scenes**:
- **Special Requirements**:

## Long-term Memory
- **Completed Projects**:
- **Learning Preferences**:
- **Feedback History**:
- **Collaboration Style**: `,
      },

      // Thread configuration
      threads: {
        generateTitle: true, // Enable automatic thread title generation
      },
    },
  });
};

/**
 * Create memory instance for the master agent (AgentNetwork)
 * This memory is used by the NewAgentNetwork for task history and coordination
 * Now configured for resource-scoped memory to persist across all user threads
 */
export const createMasterMemory = () => {
  return new Memory({
    // Storage for conversation history
    storage: new LibSQLStore({
      url: "file:mastra-memory.db",
    }),

    // Vector store for semantic search
    vector: new LibSQLVector({
      connectionUrl: "file:mastra-memory.db",
    }),

    // Use OpenAI embedding for semantic search
    embedder: openai.embedding('text-embedding-3-small'),

    options: {
      // Number of recent messages to include in context
      lastMessages: 20,

      // Semantic search configuration - now resource-scoped
      semanticRecall: {
        topK: 8, // Number of similar messages to retrieve
        messageRange: {
          before: 3, // Messages to include before each result
          after: 2,  // Messages to include after each result
        },
        scope: 'resource', // Search across all threads for the same user
      },

      // Working memory configuration - simplified to match docs
      workingMemory: {
        enabled: true,
        template: `# Master Agent Memory

## Current Project
- **Project Type**: Storyboard Generation
- **User Request**:
- **Current Phase**: [Script/Storyboard/Images/Export]
- **Progress**: [0-100%]

## Agent Coordination
- **Active Agents**:
- **Completed Tasks**:
- **Pending Tasks**:
- **Error Handling**:

## User Context
- **Preferred Styles**:
- **Story Preferences**:
- **Technical Requirements**:
- **Export Format**:

## Workflow State
- **Script Generated**: [Yes/No]
- **Storyboard Created**: [Yes/No]
- **Images Generated**: [Yes/No]
- **Export Ready**: [Yes/No]

## Quality Control
- **Style Consistency**:
- **Character Continuity**:
- **Narrative Flow**:
- **Technical Issues**: `,
      },

      // Thread configuration
      threads: {
        generateTitle: true, // Enable automatic thread title generation
      },
    },
  });
};

/**
 * Create resource-scoped memory instance
 * This memory persists across all conversation threads for the same user
 * Useful for maintaining user preferences and project context
 */
export const createResourceScopedMemory = () => {
  return new Memory({
    // Storage for conversation history
    storage: new LibSQLStore({
      url: "file:mastra-memory.db",
    }),

    // Vector store for semantic search
    vector: new LibSQLVector({
      connectionUrl: "file:mastra-memory.db",
    }),

    // Use OpenAI embedding for semantic search
    embedder: openai.embedding('text-embedding-3-small'),

    options: {
      // Number of recent messages to include in context
      lastMessages: 25,

      // Semantic search configuration - resource-scoped
      semanticRecall: {
        topK: 10, // Number of similar messages to retrieve
        messageRange: {
          before: 4, // Messages to include before each result
          after: 3,  // Messages to include after each result
        },
        scope: 'resource', // Search across all threads for the same user
      },

      // Working memory configuration - comprehensive user profile
      workingMemory: {
        enabled: true,
        template: `# User Profile & Project History

## Personal Information
- **Name**:
- **Location**:
- **Timezone**:
- **Communication Style**: [Formal/Casual]
- **Technical Level**: [Beginner/Intermediate/Expert]

## Project Portfolio
- **Completed Projects**:
- **Current Projects**:
- **Preferred Genres**:
- **Style Preferences**:
- **Common Requirements**:

## Workflow Patterns
- **Typical Project Size**:
- **Preferred Export Formats**:
- **Image Quality Preferences**:
- **Revision Patterns**:
- **Collaboration Style**:

## Technical Preferences
- **Art Styles**: [List of preferred styles]
- **Story Genres**: [List of preferred genres]
- **Character Focus**: [Yes/No/Depends]
- **Visual Elements**: [List of preferred elements]
- **Export Formats**: [PDF/JSON/HTML/Markdown]

## Quality Standards
- **Style Consistency**: [High/Medium/Low]
- **Character Continuity**: [High/Medium/Low]
- **Narrative Flow**: [High/Medium/Low]
- **Technical Quality**: [High/Medium/Low]

## Session Management
- **Current Session**:
- **Last Activity**:
- **Open Questions**:
- **Next Steps**:
- **Pending Feedback**: `,
      },

      // Thread configuration
      threads: {
        generateTitle: true, // Enable automatic thread title generation
      },
    },
  });
};

// Convenience function for shared memory
export const createSharedMemory = () => createResourceScopedMemory();