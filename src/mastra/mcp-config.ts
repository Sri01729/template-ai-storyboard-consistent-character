import { MCPClient } from '@mastra/mcp';

// MCP Client configuration for file system operations and Zapier integration
const servers: any = {};

// Add Zapier server only if URL is provided
if (process.env.ZAPIER_MCP_URL) {
  servers.zapier = {
    url: new URL(process.env.ZAPIER_MCP_URL),
  };
}

export const mcp = new MCPClient({ servers });

// Helper function to get MCP tools
export const getMcpTools = async () => {
  try {
    return await mcp.getTools();
  } catch (error) {
    console.error('Failed to get MCP tools:', error);
    return {};
  }
};

// Helper function to get MCP toolsets for dynamic usage
export const getMcpToolsets = async () => {
  try {
    return await mcp.getToolsets();
  } catch (error) {
    console.error('Failed to get MCP toolsets:', error);
    return {};
  }
};

// Helper function to disconnect MCP client
export const disconnectMcp = async () => {
  try {
    await mcp.disconnect();
  } catch (error) {
    console.error('Failed to disconnect from MCP servers:', error);
  }
};