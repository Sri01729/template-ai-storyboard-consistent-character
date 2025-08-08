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

      // Disable working memory temporarily to avoid missing tool error
      workingMemory: {
        enabled: false,
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

      // Disable working memory temporarily to avoid missing tool error
      workingMemory: {
        enabled: false,
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

      // Disable working memory temporarily to avoid missing tool error
      workingMemory: {
        enabled: false,
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