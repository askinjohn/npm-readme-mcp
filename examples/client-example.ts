import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

async function demonstrateNpmReadmeMcp() {
  console.log('Starting NPM README MCP client demo...');
  
  // Create a client transport connected to the server process
  const transport = new StdioClientTransport({
    command: 'bun',
    args: ['src/index.ts']
  });
  
  // Create the client
  const client = new Client({
    name: 'npm-readme-client',
    version: '1.0.0'
  });
  
  try {
    // Connect to the server
    await client.connect(transport);
    console.log('Connected to MCP server!');
    
    // Fetch README for a package
    console.log('\nFetching README for "express"...');
    const readmeResult = await client.callTool({
      name: 'fetchReadme',
      arguments: {
        packageName: 'express',
        includeMetadata: true
      }
    });
    
    // Extract data from result
    const rawText = readmeResult.content?.[0]?.text;
    if (!rawText) {
      throw new Error('Invalid response format from server');
    }
    
    const readmeData = JSON.parse(rawText);
    console.log(`\nPackage: ${readmeData.name}`);
    if (readmeData.metadata) {
      console.log(`Description: ${readmeData.metadata.description}`);
      console.log(`Version: ${readmeData.metadata.version}`);
    }
    console.log(`\nREADME Preview (first 300 characters):`);
    console.log(readmeData.readme.substring(0, 300) + '...');
    
    // Search for packages
    console.log('\n\nSearching for TypeScript utilities...');
    const searchResult = await client.callTool({
      name: 'searchPackages',
      arguments: {
        query: 'typescript utility',
        limit: 3
      }
    });
    
    // Extract search data
    const rawSearchText = searchResult.content?.[0]?.text;
    if (!rawSearchText) {
      throw new Error('Invalid search response format from server');
    }
    
    const searchData = JSON.parse(rawSearchText);
    console.log(`\nFound ${searchData.total} packages matching "${searchData.query}":`);
    
    searchData.packages.forEach((pkg, index) => {
      console.log(`\n${index + 1}. ${pkg.name}@${pkg.version}`);
      if (pkg.description) {
        console.log(`   Description: ${pkg.description}`);
      }
      if (pkg.score?.final) {
        console.log(`   Score: ${(pkg.score.final * 100).toFixed(1)}%`);
      }
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    // Disconnect and clean up
    console.log('\nDisconnecting from MCP server...');
    await client.close();
    console.log('Demo completed!');
  }
}

// Run the demo
demonstrateNpmReadmeMcp().catch(console.error);