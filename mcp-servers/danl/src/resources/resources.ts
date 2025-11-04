/**
 * DANL MCP Server Resources
 *
 * Provides access to DANL state and data via URIs
 */

import { promises as fs } from 'fs';
import * as path from 'path';
import { DANLConfig } from '../config';

export interface MCPResource {
  uri: string;
  name: string;
  description: string;
  mimeType: string;
}

export class DANLResources {
  private config: DANLConfig;

  constructor(config: DANLConfig) {
    this.config = config;
  }

  /**
   * Get list of available resources
   */
  getResourceList(): MCPResource[] {
    return [
      {
        uri: 'danl://lattice/spec',
        name: 'Lattice Specification',
        description: 'Five-level epistemic certainty lattice specification with join/meet operations',
        mimeType: 'application/json',
      },
      {
        uri: 'danl://transitions/all',
        name: 'Transition Rules',
        description: 'M/S-expression pairs for all transition rules (propagate-belief, interpret-evidence, safeguard-consensus)',
        mimeType: 'application/json',
      },
      {
        uri: 'danl://simulations/recent',
        name: 'Recent Simulations',
        description: 'Most recent network simulation results with traces',
        mimeType: 'application/json',
      },
      {
        uri: 'danl://observables/formula',
        name: 'Observable Parameterization',
        description: 'τ-coefficient observable parameterization formula and examples',
        mimeType: 'application/json',
      },
      {
        uri: 'danl://address/info',
        name: 'HD Address Information',
        description: 'Hierarchical Deterministic addressing information for this DANL service',
        mimeType: 'application/json',
      },
    ];
  }

  /**
   * Read resource by URI
   */
  async readResource(uri: string): Promise<string> {
    switch (uri) {
      case 'danl://lattice/spec':
        return this.getLatticeSpec();

      case 'danl://transitions/all':
        return this.getTransitions();

      case 'danl://simulations/recent':
        return this.getRecentSimulations();

      case 'danl://observables/formula':
        return this.getObservableFormula();

      case 'danl://address/info':
        return this.getAddressInfo();

      default:
        throw new Error(`Unknown resource URI: ${uri}`);
    }
  }

  /**
   * Get lattice specification
   */
  private async getLatticeSpec(): Promise<string> {
    const spec = {
      levels: [
        { name: 'bottom', index: 0, description: 'No information/certainty' },
        { name: 'potential', index: 1, description: 'Potential evidence observed' },
        { name: 'active', index: 2, description: 'Active processing/inference' },
        { name: 'confident', index: 3, description: 'High confidence in state' },
        { name: 'top', index: 4, description: 'Maximum certainty' },
      ],
      operations: {
        join: {
          symbol: '∨',
          description: 'Maximum (most confident)',
          formula: 'join(a, b) = max(a, b)',
          properties: ['commutative', 'associative', 'idempotent'],
        },
        meet: {
          symbol: '∧',
          description: 'Minimum (conservative consensus)',
          formula: 'meet(a, b) = min(a, b)',
          properties: ['commutative', 'associative', 'idempotent'],
        },
        blend: {
          description: 'Weighted average for evidence interpretation',
          formula: 'blend(self, neighbor, weight) = (self + weight × neighbor) / (1 + weight)',
          use_case: 'Incorporating neighbor evidence with confidence weighting',
        },
      },
      algebra: {
        type: 'max-plus rig (tropical semiring)',
        purpose: 'Irreversible causal flow (time only moves forward)',
        join_distributes_over_delay: true,
      },
      hdAddress: this.config.hdAddress,
    };

    return JSON.stringify(spec, null, 2);
  }

  /**
   * Get transition rules
   */
  private async getTransitions(): Promise<string> {
    const transitions = {
      'propagate-belief': {
        meta: 'propagate-belief self neighbors -> join self (fold join neighbors)',
        structural: '(lambda (self neighbors context) (level-join self (assoc-ref context \'neighbor-join \'bottom)))',
        description: 'Propagate epistemic belief by joining with neighbors',
        use_case: 'Information diffusion in network',
      },
      'interpret-evidence': {
        meta: 'interpret-evidence self neighbors tau -> blend self neighbor-join',
        structural: '(lambda (self neighbors context) (blend-level self (assoc-ref context \'neighbor-join \'bottom) (/ (+ tau neighbor-count) neighbor-count)))',
        description: 'Interpret evidence with tau-coefficient weighting',
        use_case: 'Inference with observation confidence',
      },
      'safeguard-consensus': {
        meta: 'safeguard-consensus self neighbors -> meet ceiling (join self neighbor-join)',
        structural: '(lambda (self neighbors context) (level-join floor (level-meet candidate ceiling)))',
        description: 'Ensure consensus within ceiling/floor bounds',
        use_case: 'Bounded rational consensus',
      },
      hdAddress: this.config.hdAddress,
    };

    return JSON.stringify(transitions, null, 2);
  }

  /**
   * Get recent simulations
   */
  private async getRecentSimulations(): Promise<string> {
    // Try to load from persistence
    if (this.config.enablePersistence) {
      try {
        const tracesDir = path.join(this.config.persistencePath, 'traces');
        const files = await fs.readdir(tracesDir);
        const recentFiles = files
          .filter(f => f.startsWith('trace_') && f.endsWith('.json'))
          .sort()
          .reverse()
          .slice(0, 5);

        const traces = await Promise.all(
          recentFiles.map(async (file) => {
            const content = await fs.readFile(path.join(tracesDir, file), 'utf-8');
            return JSON.parse(content);
          })
        );

        return JSON.stringify({
          traces,
          count: traces.length,
          hdAddress: this.config.hdAddress,
        }, null, 2);
      } catch (err) {
        // Persistence not available, return empty
      }
    }

    return JSON.stringify({
      traces: [],
      count: 0,
      message: 'No recent simulations available',
      hdAddress: this.config.hdAddress,
    }, null, 2);
  }

  /**
   * Get observable parameterization formula
   */
  private async getObservableFormula(): Promise<string> {
    const formula = {
      name: 'Observable Parameterization (τ-products)',
      formula: 'observable = τ × level_index',
      description: 'Pairs latent state with geometry-dependent coefficient',
      analogy: 'Computer vision tZ·β encoding (depth × intensity)',
      purpose: 'Track implicit knowledge (UK) in distributed system',
      examples: [
        {
          node: 'perceptual-array',
          tau: 1.25,
          state: 'potential',
          level_index: 1,
          observable: 1.25,
        },
        {
          node: 'inference-engine',
          tau: 1.5,
          state: 'active',
          level_index: 2,
          observable: 3.0,
        },
        {
          node: 'consensus-forum',
          tau: 0.9,
          state: 'confident',
          level_index: 3,
          observable: 2.7,
        },
      ],
      interpretation: 'Higher τ indicates stronger evidence/observation capability',
      hdAddress: this.config.hdAddress,
    };

    return JSON.stringify(formula, null, 2);
  }

  /**
   * Get HD address info
   */
  private async getAddressInfo(): Promise<string> {
    const info = {
      hdAddress: this.config.hdAddress,
      rpcEndpoint: this.config.rpcEndpoint,
      hyperbolicCoordinates: this.config.hyperbolicCoordinates,
      curvature: this.config.curvature,
      transport: this.config.transport,
      host: this.config.host,
      port: this.config.port,
      derivation: {
        purpose: '0x44414E4C (DANL - Decentralized Automaton Network Lattice)',
        version: '0x00000001 (v1)',
        network: '0 (local/testnet)',
        serviceType: '0 (base implementation)',
        instance: '0',
      },
      geometric_position: {
        model: 'Poincaré ball',
        coordinates: this.config.hyperbolicCoordinates,
        distance_from_origin: Math.sqrt(
          this.config.hyperbolicCoordinates[0] ** 2 +
          this.config.hyperbolicCoordinates[1] ** 2
        ).toFixed(4),
        interpretation: 'Base services near origin, specialized services at periphery',
      },
    };

    return JSON.stringify(info, null, 2);
  }
}
