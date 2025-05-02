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

  // Tool to search for packages by keyword, author, or keywords, with optional popularity sorting
  server.tool('searchPackages', {
    query: z.string().optional().describe('General search query for npm packages'),
    author: z.string().optional().describe('Filter packages by author name'),
    keywords: z.array(z.string()).optional().default([]).describe('Filter packages by keywords'),
    limit: z.number().optional().default(10).describe('Maximum number of results to return'),
    sortByPopularity: z.boolean().optional().default(true).describe('Sort results primarily by download count (default: true)'),
    popularityWeight: z.number().min(0).max(1).optional().default(0.8).describe('Weight for the popularity factor (0-1) when sorting')
  }, async ({ 
    query = "", 
    author = "", 
    keywords = [], 
    limit = 10, 
    sortByPopularity = true, // Default changed to true
    popularityWeight = 0.8 
  }) => {
    try {
      // Validation: Ensure at least one search criterion is provided
      if (!query && !author && keywords.length === 0) {
        throw new Error('At least one search parameter (query, author, or keywords) must be provided');
      }
      
      // Special case for "X for Y" queries (only if keywords aren't explicitly provided)
      let effectiveKeywords = keywords;
      if (query && query.includes(" for ") && keywords.length === 0) {
        const parts = query.split(" for ");
        if (parts.length === 2) {
          const what = parts[0].trim();
          const framework = parts[1].trim();
          if (what && framework) {
            effectiveKeywords = [what, framework];
            // Keep original query for text matching as well
          }
        }
      }
      
      const searchResults = await npmClient.searchPackages({
        query,
        author,
        keywords: effectiveKeywords,
        limit,
        sortByPopularity,
        popularityWeight
      });
      
      // Construct the query description for the output
      const queryDescriptionParts = [];
      if (query) queryDescriptionParts.push(query);
      if (author) queryDescriptionParts.push(`author:${author}`);
      if (effectiveKeywords.length > 0) queryDescriptionParts.push(`keywords:[${effectiveKeywords.join(', ')}]`);
      const queryDescription = queryDescriptionParts.join(' + ');

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              packages: searchResults,
              total: searchResults.length,
              query: queryDescription,
              sortedByPopularity: sortByPopularity
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
