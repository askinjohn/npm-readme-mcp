import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { NpmClient } from './npm-client';
import { 
  ReadmeQueryInput, 
  ReadmeOutput, 
  SearchQueryInput, 
  SearchOutput 
} from './types';
import { z } from 'zod';

export class NpmReadmeMcpServer {
  private readonly mcp: McpServer;
  private readonly npmClient: NpmClient;

  constructor() {
    this.npmClient = new NpmClient();
    this.mcp = new McpServer({ 
      name: 'npm-readme-server',
      version: '1.0.0'
    });
    
    this.registerTools();
  }

  private registerTools(): void {
    // Tool to fetch README from an npm package
    this.mcp.tool('fetchReadme', {
      packageName: z.string().min(1).describe('Name of the npm package'),
      includeMetadata: z.boolean().optional().default(false).describe('Whether to include package metadata in the response')
    }, async ({ packageName, includeMetadata = false }) => {
      try {
        const result = await this.npmClient.getPackageReadme(packageName, includeMetadata);
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
    this.mcp.tool('searchPackages', {
      query: z.string().min(1).describe('Search query for npm packages'),
      limit: z.number().optional().default(10).describe('Maximum number of results to return')
    }, async ({ query, limit = 10 }) => {
      try {
        // Validate input
        if (!query.trim()) {
          throw new Error('Search query cannot be empty');
        }
        
        // Perform the search
        const searchResults = await this.npmClient.searchPackages(query, limit);
        
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
  }

  async start(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.mcp.connect(transport);
    console.log('NPM README MCP server running with stdio transport');
  }

  async stop(): Promise<void> {
    await this.mcp.close();
    console.log('NPM README MCP server stopped');
  }
}