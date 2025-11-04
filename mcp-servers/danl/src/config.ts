/**
 * DANL MCP Server Configuration
 *
 * Provides HD addressing, RPC endpoint mapping, and server settings
 */

export interface DANLConfig {
  // HD (Hierarchical Deterministic) addressing
  hdAddress: string;
  rpcEndpoint: string;
  hyperbolicCoordinates: [number, number];
  curvature: number;

  // Server settings
  port: number;
  host: string;
  transport: 'tcp' | 'stdio' | 'http';

  // Scheme interpreter path
  schemeInterpreter: 'guile' | 'racket';
  schemePath: string;

  // Persistence
  persistencePath: string;
  enablePersistence: boolean;

  // Performance
  maxConcurrentSimulations: number;
  simulationTimeout: number; // milliseconds
}

/**
 * Derive HD address for DANL service
 *
 * Format: m/purpose'/version'/network'/service_type/instance
 *
 * Purpose: 0x44414E4C ("DANL")
 * Version: 0x00000001 (v1)
 * Network: 0 (local)
 * Service Type: 0 (base)
 * Instance: 0
 */
function deriveHDAddress(): string {
  return "m/0x44414E4C'/0x00000001'/0'/0/0";
}

/**
 * Map HD address to hyperbolic coordinates in Poincaré ball
 *
 * DANL positioned at mid-radius, distinct angle from H²GNN and CST
 */
function deriveHyperbolicCoordinates(hdAddress: string): [number, number] {
  // For DANL: purpose=0x44414E4C, version=1, network=0, type=0, instance=0
  // Angle from purpose/version hash
  const purposeHash = 0x44414E4C;
  const theta = (2 * Math.PI * purposeHash) / 0x100000000;

  // Radius from hierarchy depth
  // type=0 (base) → lower radius than enhanced variants
  const depth = 0 + 0 / 10 + 0 / 100; // network + type/10 + instance/100
  const r = Math.tanh(depth / 2); // ≈ 0 for base service

  // Polar to Cartesian
  const x = r * Math.cos(theta);
  const y = r * Math.sin(theta);

  return [Number(x.toFixed(4)), Number(y.toFixed(4))];
}

/**
 * Map HD address to RPC endpoint
 *
 * Format: tcp://localhost:{3000 + service_type}/danl/{variant}/{instance}
 */
function deriveRPCEndpoint(hdAddress: string): string {
  // Parse HD address to extract service_type
  const serviceType = 0; // Base DANL = type 0
  const port = 3000 + serviceType;

  return `tcp://localhost:${port}/danl/base/0`;
}

/**
 * Default DANL MCP Server configuration
 */
export const defaultConfig: DANLConfig = {
  // HD addressing
  hdAddress: deriveHDAddress(),
  rpcEndpoint: deriveRPCEndpoint(deriveHDAddress()),
  hyperbolicCoordinates: deriveHyperbolicCoordinates(deriveHDAddress()),
  curvature: -1, // Hyperbolic space

  // Server settings
  port: 3000,
  host: 'localhost',
  transport: 'tcp',

  // Scheme interpreter
  schemeInterpreter: 'guile',
  schemePath: './decentralized_automaton_network/scheme/danl.scm',

  // Persistence
  persistencePath: './persistence/danl',
  enablePersistence: true,

  // Performance
  maxConcurrentSimulations: 5,
  simulationTimeout: 30000, // 30 seconds
};

/**
 * Load configuration from environment or defaults
 */
export function loadConfig(): DANLConfig {
  return {
    ...defaultConfig,
    port: parseInt(process.env.DANL_PORT || '3000', 10),
    host: process.env.DANL_HOST || defaultConfig.host,
    schemeInterpreter: (process.env.SCHEME_INTERPRETER as 'guile' | 'racket') || defaultConfig.schemeInterpreter,
    schemePath: process.env.DANL_SCHEME_PATH || defaultConfig.schemePath,
    persistencePath: process.env.DANL_PERSISTENCE_PATH || defaultConfig.persistencePath,
  };
}
