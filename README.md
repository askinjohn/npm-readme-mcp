# npm-readme-mcp

[![npm version](https://badge.fury.io/js/npm-readme-mcp.svg)](https://badge.fury.io/js/npm-readme-mcp) <!-- Optional: Add after first publish -->

An MCP (Model Context Protocol) server that provides tools to fetch README files and search for packages on npm. Built with Bun and TypeScript.

## Features

*   Provides MCP tools to interact with the npm registry.
*   `fetchReadme`: Fetches the README content and optionally metadata for a given npm package.
*   `searchPackages`: Searches for npm packages based on a query string.

## Installation (as an MCP Server)

Once published, you can add this server to your MCP client configuration. The exact method depends on your client, but typically involves specifying the command to run the server.

**Example MCP Client Configuration:**

```json
{
  "mcpServers": {
    "npm-readme": {
      // Use npx to run the installed package
      "command": "npx",
      "args": ["npm-readme-mcp"],
      // Or, if installed globally:
      // "command": "npm-readme-mcp",
      // "args": [],
      "disabled": false
    }
    // ... other servers
  }
}
```

*Note: Ensure `npx` can find the package or that `npm-readme-mcp` is in the PATH if installed globally.*

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
