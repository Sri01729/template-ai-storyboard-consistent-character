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

      // Enhanced semantic search configuration - resource-scoped with agent-specific optimization
      semanticRecall: {
        topK: 8, // Increased number of similar messages to retrieve for better context
        messageRange: {
          before: 3, // More context before each result
          after: 2,  // More context after each result
        },
        scope: 'resource', // Search across all threads for the same user
      },

      // Enhanced working memory configuration with semantic recall optimization
      workingMemory: {
        enabled: true,
        scope: 'resource', // CRITICAL: This makes working memory persist across all threads for the same user
        template: `# User Profile & Semantic Context

## Personal Information
- **Name**:
- **Location**:
- **Timezone**:
- **Communication Style**: [Formal/Casual]
- **Technical Level**: [Beginner/Intermediate/Expert]

## Project Context & History
- **Current Goal**:
- **Project Type**:
- **Preferred Style**:
- **Target Audience**:
- **Previous Projects**: [List of completed projects]
- **Common Patterns**: [Recurring themes, styles, or requirements]

## Session State & Workflow
- **Last Task**:
- **Current Progress**:
- **Open Questions**:
- **Next Steps**:
- **Current Workflow Phase**: [Script/Storyboard/Images/Export/Upload]

## Creative Preferences & Patterns
- **Art Style**: [List of preferred styles]
- **Story Genre**: [List of preferred genres]
- **Character Focus**: [Yes/No/Depends]
- **Visual Elements**: [List of preferred elements]
- **Narrative Patterns**: [Common story structures or themes]

## Technical Preferences & Requirements
- **Export Format**: [PDF/JSON/HTML/Markdown]
- **Image Quality**: [Standard/High/Ultra]
- **Number of Scenes**: [Typical range]
- **Special Requirements**: [Any specific needs]
- **File Organization**: [Preferences for file naming, structure]

## Semantic Search Keywords
- **Common Topics**: [Frequently discussed subjects]
- **Technical Terms**: [Domain-specific vocabulary]
- **Project Keywords**: [Important terms for this user's projects]
- **Style Keywords**: [Visual and narrative style terms]

## Long-term Memory & Patterns
- **Completed Projects**: [History of finished work]
- **Learning Preferences**: [How user likes to receive information]
- **Feedback History**: [Past feedback and improvements]
- **Collaboration Style**: [How user works with AI agents]
- **Error Patterns**: [Common issues and solutions]`,
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
        scope: 'resource', // CRITICAL: This makes working memory persist across all threads for the same user
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
        scope: 'resource', // CRITICAL: This makes working memory persist across all threads for the same user
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

/**
 * Debug function to test memory functionality
 * This helps verify that resource-scoped memory is working correctly
 */
export const debugMemory = async (memory: Memory, resourceId: string, threadId: string) => {
  try {
    console.log(`🔍 [Memory Debug] Testing memory for resourceId: ${resourceId}, threadId: ${threadId}`);

    // Test 1: Get all threads for this resource
    const threads = await memory.getThreadsByResourceId({ resourceId });
    console.log(`📋 [Memory Debug] Found ${threads.length} threads for resource ${resourceId}`);

    // Test 2: Query recent messages to check if memory is working
    const queryResult = await memory.query({
      threadId,
      resourceId,
      selectBy: { last: 5 }
    });
    console.log(`💬 [Memory Debug] Recent messages: ${queryResult.messages.length} found`);

    // Test 3: Check if semantic recall is working by searching for similar messages
    const semanticResult = await memory.query({
      threadId,
      resourceId,
      selectBy: {
        vectorSearchString: "storyboard script generation"
      },
      threadConfig: {
        semanticRecall: true
      }
    });
    console.log(`🔍 [Memory Debug] Semantic search results: ${semanticResult.messages.length} found`);

    return {
      threadsCount: threads.length,
      recentMessagesCount: queryResult.messages.length,
      semanticResultsCount: semanticResult.messages.length
    };
  } catch (error) {
    console.error(`❌ [Memory Debug] Error testing memory:`, error);
    throw error;
  }
};