# npm-readme-mcp

![npm-readme-mcp Logo](https://raw.githubusercontent.com/askinjohn/npm-readme-mcp/main/src/assets/npm_mcp.png)

[![npm version](https://badge.fury.io/js/npm-readme-mcp.svg)](https://badge.fury.io/js/npm-readme-mcp) <!-- Optional: Add after first publish -->

An MCP (Model Context Protocol) server that provides tools to fetch README files and search for packages on npm. Built with Bun and TypeScript.

## Features

*   Provides MCP tools to interact with the npm registry.
*   `fetchReadme`: Fetches the README content (Markdown and HTML) and optionally metadata for a given npm package.
*   `searchPackages`: Searches for npm packages based on query text, author, and/or keywords. Results are sorted by popularity by default, but this can be customized.

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

Searches the npm registry for packages. Allows filtering by query text, author, and keywords. Results are sorted by a combination of popularity and quality by default.

**Input Schema:**

```json
{
  "query": {
    "type": "string",
    "optional": true,
    "description": "General search query text (e.g., 'react state management')."
  },
  "author": {
    "type": "string",
    "optional": true,
    "description": "Filter packages by author username (e.g., 'gaearon')."
  },
  "keywords": {
    "type": "array",
    "items": { "type": "string" },
    "optional": true,
    "default": [],
    "description": "Filter packages by keywords (e.g., ['react', 'state']). Requires exact keyword match."
  },
  "limit": {
    "type": "number",
    "optional": true,
    "default": 10,
    "description": "Maximum number of search results to return."
  },
  "sortByPopularity": {
    "type": "boolean",
    "optional": true,
    "default": true,
    "description": "Sort results primarily by download count/popularity. Set to false for default npm relevance sorting."
  },
  "popularityWeight": {
    "type": "number",
    "minimum": 0,
    "maximum": 1,
    "optional": true,
    "default": 0.8,
    "description": "Weight (0-1) for the popularity factor when sortByPopularity is true. Higher value prioritizes downloads more."
  }
}
```
*Note: At least one of `query`, `author`, or `keywords` must be provided.*

**Output:**

Returns a JSON string containing an object with:
*   `packages`: An array of search result objects, each containing details like `name`, `version`, `description`, `author`, `keywords`, `links`, `score`, etc.
*   `total`: The number of results returned (limited by the `limit` parameter).
*   `query`: A string describing the effective search criteria used.
*   `sortedByPopularity`: A boolean indicating if popularity sorting was applied.

**Usage Examples:**

*   **Simple query (sorted by popularity by default):**
    ```json
    { "query": "react state management" }
    ```
*   **Search by author:**
    ```json
    { "author": "angular" }
    ```
*   **Search by keywords:**
    ```json
    { "keywords": ["react", "chart"] }
    ```
*   **Combined search:**
    ```json
    { "query": "data grid", "keywords": ["react"] }
    ```
*   **"Charts for Angular" (special handling):**
    ```json
    { "query": "charts for angular" }
    ```
    *(Server treats this like `keywords: ["charts", "angular"]`)*
*   **Prioritize popularity heavily:**
    ```json
    { "query": "web framework", "sortByPopularity": true, "popularityWeight": 0.95, "limit": 5 }
    ```
*   **Disable popularity sorting (use npm default relevance):**
    ```json
    { "query": "web framework", "sortByPopularity": false }
    ```

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



## License

This project is licensed under the ISC License. See the LICENSE file for details (or specify license directly if no file).

## Contributing

Contributions are welcome! Please feel free to open an issue or submit a pull request on the [GitHub repository](https://github.com/askinjohn/npm-readme-mcp).
