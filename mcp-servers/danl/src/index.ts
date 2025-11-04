/**
 * DANL MCP Server
 *
 * Model Context Protocol server for Decentralized Automaton Network Lattice
 * Provides lattice operations, network simulation, and HD addressing
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

import { loadConfig, DANLConfig } from './config';
import { DANLTools, toolDefinitions } from './tools/tools';
import { DANLResources } from './resources/resources';

class DANLMCPServer {
  private server: Server;
  private config: DANLConfig;
  private tools: DANLTools;
  private resources: DANLResources;

  constructor() {
    this.config = loadConfig();
    this.tools = new DANLTools(this.config);
    this.resources = new DANLResources(this.config);

    this.server = new Server(
      {
        name: 'danl-mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
          resources: {},
        },
      }
    );

    this.setupHandlers();
  }

  private setupHandlers() {
    // List tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: toolDefinitions.map(tool => ({
        name: tool.name,
        description: tool.description,
        inputSchema: {
          type: 'object',
          properties: tool.inputSchema.shape,
          required: Object.keys(tool.inputSchema.shape).filter(
            key => !tool.inputSchema.shape[key].isOptional()
          ),
        },
      })),
    }));

    // Call tool
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'mcp__danl__simulate_network':
            return {
              content: [{
                type: 'text',
                text: JSON.stringify(await this.tools.simulateNetwork(args), null, 2),
              }],
            };

          case 'mcp__danl__lattice_join':
            return {
              content: [{
                type: 'text',
                text: JSON.stringify(await this.tools.latticeJoin(args), null, 2),
              }],
            };

          case 'mcp__danl__lattice_meet':
            return {
              content: [{
                type: 'text',
                text: JSON.stringify(await this.tools.latticeMeet(args), null, 2),
              }],
            };

          case 'mcp__danl__get_level_index':
            return {
              content: [{
                type: 'text',
                text: JSON.stringify(await this.tools.getLevelIndex(args), null, 2),
              }],
            };

          case 'mcp__danl__blend_level':
            return {
              content: [{
                type: 'text',
                text: JSON.stringify(await this.tools.blendLevel(args), null, 2),
              }],
            };

          case 'mcp__danl__compute_observable':
            return {
              content: [{
                type: 'text',
                text: JSON.stringify(await this.tools.computeObservable(args), null, 2),
              }],
            };

          case 'mcp__danl__validate_convergence':
            return {
              content: [{
                type: 'text',
                text: JSON.stringify(await this.tools.validateConvergence(args), null, 2),
              }],
            };

          case 'mcp__danl__get_hd_address_info':
            return {
              content: [{
                type: 'text',
                text: JSON.stringify(await this.tools.getHDAddressInfo(args), null, 2),
              }],
            };

          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({ error: errorMessage }, null, 2),
          }],
          isError: true,
        };
      }
    });

    // List resources
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => ({
      resources: this.resources.getResourceList(),
    }));

    // Read resource
    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      const { uri } = request.params;

      try {
        const content = await this.resources.readResource(uri);

        return {
          contents: [{
            uri,
            mimeType: 'application/json',
            text: content,
          }],
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        throw new Error(`Failed to read resource ${uri}: ${errorMessage}`);
      }
    });
  }

  async run() {
    console.error('Starting DANL MCP Server...');
    console.error(`HD Address: ${this.config.hdAddress}`);
    console.error(`RPC Endpoint: ${this.config.rpcEndpoint}`);
    console.error(`Hyperbolic Coordinates: [${this.config.hyperbolicCoordinates.join(', ')}]`);
    console.error(`Scheme Interpreter: ${this.config.schemeInterpreter}`);
    console.error('');

    const transport = new StdioServerTransport();
    await this.server.connect(transport);

    console.error('DANL MCP Server running on stdio');
  }

  async shutdown() {
    console.error('Shutting down DANL MCP Server...');
    await this.tools.cleanup();
    process.exit(0);
  }
}

// Main entry point
async function main() {
  const server = new DANLMCPServer();

  // Handle graceful shutdown
  process.on('SIGINT', () => server.shutdown());
  process.on('SIGTERM', () => server.shutdown());

  await server.run();
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
