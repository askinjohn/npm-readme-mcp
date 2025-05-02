# npm-readme-mcp

[![npm version](https://badge.fury.io/js/npm-readme-mcp.svg)](https://badge.fury.io/js/npm-readme-mcp) <!-- Optional: Add after first publish -->

An MCP (Model Context Protocol) server that provides tools to fetch README files and search for packages on npm. Built with Bun and TypeScript.

## Features

*   Provides MCP tools to interact with the npm registry.
*   `fetchReadme`: Fetches the README content and optionally metadata for a given npm package.
*   `searchPackages`: Searches for npm packages based on a query string.

## MCP Client Configuration

There are two main ways to configure your MCP client to use this server:

**1. Local Development Configuration:**

When running the server directly from the source code during development (e.g., using `bun run dev` or `bun run start`), configure your MCP client to execute the source file with the `bun` runtime. You'll need the full path to your `bun` executable and the project's `src/index.ts` file.

*Example (paths may vary):*
```json
{
  "mcpServers": {
    "npm-readme-dev": { // Use a different name to avoid conflicts
      "command": "/Users/your_user/.bun/bin/bun", // Full path to bun executable
      "args": ["/path/to/your/project/npm-readme-mcp/src/index.ts"], // Full path to source file
      "disabled": false
    }
    // ... other servers
  }
}
```

**2. Published Package Configuration:**

After installing the package from npm, configure your MCP client to execute the command provided by the package. There are two common ways depending on how you installed it:

*Example A: Using `npx` (Recommended for local project installations or without global install):*

```json
{
  "mcpServers": {
    "npm-readme": {
      "command": "npx",
      "args": ["npm-readme-mcp"], // Tell npx which package command to run
      "disabled": false
    }
    // ... other servers
  }
}
```
*Note: `npx` will find the command if `npm-readme-mcp` is installed in the local project's `node_modules` or if it needs to download it.*

*Example B: Using Global Installation (`npm install -g npm-readme-mcp`):*
```json
{
  "mcpServers": {
    "npm-readme": {
      "command": "npm-readme-mcp", // The command is directly available in PATH
      "args": [], // No arguments needed for the command itself
      "disabled": false
    }
    // ... other servers
  }
}
```

*Important: Both configurations rely on the package being built correctly (using `tsc`) before publishing.*

## Provided Tools

This server exposes the following tools for use by an MCP client:

### 1. `fetchReadme`

Fetches the README and optionally metadata for a specific npm package.

**Input Schema:**

```json
{
  "packageName": {
    "type": "string",
    "description": "Name of the npm package (e.g., 'react', '@angular/core')"
  },
  "includeMetadata": {
    "type": "boolean",
    "default": false,
    "description": "Whether to include package metadata (version, description, author, etc.) in the response"
  }
}
```

**Output:**

Returns a JSON string containing the `readme` (string), `readmeHtml` (string), and optionally `metadata` (object).

### 2. `searchPackages`

Searches the npm registry for packages matching a query.

**Input Schema:**

```json
{
  "query": {
    "type": "string",
    "description": "Search query for npm packages (e.g., 'react state management')"
  },
  "limit": {
    "type": "number",
    "default": 10,
    "description": "Maximum number of search results to return"
  }
}
```

**Output:**

Returns a JSON string containing an object with `packages` (array of search results), `total` (number of results returned), and the original `query`.

## Development

This project uses [Bun](https://bun.sh) as the JavaScript runtime.

**1. Clone the repository:**

```bash
git clone https://github.com/askinjohn/npm-readme-mcp.git
cd npm-readme-mcp
```

**2. Install dependencies:**

```bash
bun install
```

**3. Run the server locally (for development):**

This command will run the server and watch for file changes.

```bash
bun run dev
```

Alternatively, run without watching:

```bash
bun run start
```

**4. Build for production:**

This compiles the TypeScript code to JavaScript in the `dist` directory.

```bash
bun run build
```

**5. Run tests:**

```bash
bun test
```

## License

This project is licensed under the ISC License. See the LICENSE file for details (or specify license directly if no file).

## Contributing

Contributions are welcome! Please feel free to open an issue or submit a pull request on the [GitHub repository](https://github.com/askinjohn/npm-readme-mcp).
