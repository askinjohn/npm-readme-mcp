#!/usr/bin/env node
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { NpmClient } from './npm-client.js'; // Added .js extension
import { z } from 'zod';

async function main() {
  // Create the npm client
  const npmClient = new NpmClient();
  
  // Create the MCP server
  const server = new McpServer({ 
    name: 'npm-readme-server',
    version: '1.0.0'
  });
  
  // Tool to fetch README from an npm package
  server.tool('fetchReadme', {
    packageName: z.string().min(1).describe('Name of the npm package'),
    includeMetadata: z.boolean().optional().default(false).describe('Whether to include package metadata in the response')
  }, async ({ packageName, includeMetadata = false }) => {
    try {
      const result = await npmClient.getPackageReadme(packageName, includeMetadata);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result)
          }
        ]
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Error fetching README: ${error.message}`);
      }
      throw new Error('Unknown error occurred while fetching README');
    }
  });

  // Tool to search for packages by keyword
  server.tool('searchPackages', {
    query: z.string().min(1).describe('Search query for npm packages'),
    limit: z.number().optional().default(10).describe('Maximum number of results to return')
  }, async ({ query, limit = 10 }) => {
    try {
      if (!query.trim()) {
        throw new Error('Search query cannot be empty');
      }
      
      const searchResults = await npmClient.searchPackages(query, limit);
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              packages: searchResults,
              total: searchResults.length,
              query
            })
          }
        ]
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Error searching packages: ${error.message}`);
      }
      throw new Error('Unknown error occurred while searching packages');
    }
  });

  // Connect to StdioServerTransport
  const transport = new StdioServerTransport();
  
  // Handle graceful shutdown
  process.on('SIGINT', async () => {
    console.log('Shutting down server...');
    await server.close();
    process.exit(0);
  });
  
  process.on('SIGTERM', async () => {
    console.log('Shutting down server...');
    await server.close();
    process.exit(0);
  });
  
  try {
    await server.connect(transport);
    console.log('Server started successfully');
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
