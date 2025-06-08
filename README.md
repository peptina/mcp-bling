# Bling MCP Server

This project implements a Model Context Protocol (MCP) server that acts as a bridge to interact with the [Bling](https://bling.com.br) API. It allows an MCP client (like an AI assistant) to perform actions on commercial proposals.

<a href="https://glama.ai/mcp/servers/@orellazri/coda-mcp">
  <img width="380" height="200" src="https://glama.ai/mcp/servers/@orellazri/coda-mcp/badge" alt="Coda Server MCP server" />
</a>

## Features

The server exposes the following tools to the MCP client:

- **`bling_list_propostas`**: Lists or searches available commercial proposals with optional filters for status, contact, date range, and pagination.
- **`bling_create_proposta`**: Creates a new commercial proposal with detailed information including items, payment installments, and transport details.
- **`bling_get_proposta`**: Retrieves a specific commercial proposal by its ID.
- **`bling_update_proposta`**: Updates an existing commercial proposal with new information.
- **`bling_update_proposta_situacao`**: Updates the status of a commercial proposal (Pendente, Aguardando, Não aprovado, Aprovado, Concluído, Rascunho).
- **`bling_delete_proposta`**: Deletes a commercial proposal by its ID.

## Usage

Add the MCP server to Cursor/Claude Desktop/etc. like so:

```json
{
  "mcpServers": {
    "bling": {
      "command": "npx",
      "args": ["-y", "mcp-bling@latest"],
      "env": {
        "API_KEY": "..."
      }
    }
  }
}
```

Required environment variables:

- `API_KEY`: Your Bling API key. You can generate one from your Bling account settings.

This MCP server is also available with Docker, like so:

```json
{
  "mcpServers": {
    "bling": {
      "command": "docker",
      "args": ["run", "-i", "--rm", "-e", "API_KEY", "reaperberri/mcp-bling:latest"],
      "env": {
        "API_KEY": "..."
      }
    }
  }
}
```

## Local Setup

1. **Prerequisites:**
   - Node.js 23.x
   - pnpm 10.x

2. **Clone the repository:**
   ```bash
   git clone https://github.com/peptina/mcp-bling.git
   cd mcp-bling
   ```

3. **Install dependencies:**
   ```bash
   pnpm install
   ```

4. **Build the project:**
   ```bash
   pnpm build
   ```
   This compiles the TypeScript code to JavaScript in the `dist/` directory.

## Running the Server

The MCP server communicates over standard input/output (stdio). To run it, set the environment variables and run the compiled JavaScript file - `dist/index.js`.

## Development

- **Linting:** `pnpm lint`
- **Formatting:** `pnpm format`
- **Testing:** `pnpm test`
- **Watch Tests:** `pnpm test:watch`
- **Generate API Types:** `pnpm openapi-ts`
- **Inspect MCP Server:** `pnpm inspect`

## License

MIT License - see [LICENSE](LICENSE) for details.
