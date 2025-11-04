/**
 * Scheme Bridge for DANL MCP Server
 *
 * Executes DANL Scheme code and parses results
 */

import { spawn, ChildProcess } from 'child_process';
import { promises as fs } from 'fs';
import * as path from 'path';
import { DANLConfig } from '../config';

export interface LatticeLevel {
  level: 'bottom' | 'potential' | 'active' | 'confident' | 'top';
  index: number;
}

export interface DANLNode {
  name: string;
  state: string;
  tauCoefficient: number;
  observable: number;
  neighbors: string[];
  attributes: Record<string, any>;
}

export interface SimulationResult {
  history: DANLNode[][];
  final: DANLNode[];
  iterations: number;
  converged: boolean;
  trace: Array<{
    step: number;
    states: Record<string, string>;
    observables: Record<string, number>;
  }>;
}

export class SchemeBridge {
  private config: DANLConfig;
  private schemeProcess: ChildProcess | null = null;

  constructor(config: DANLConfig) {
    this.config = config;
  }

  /**
   * Execute Scheme code and return result
   */
  async executeScheme(code: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const interpreter = this.config.schemeInterpreter;
      const args: string[] = [];

      if (interpreter === 'guile') {
        args.push('-c', code);
      } else if (interpreter === 'racket') {
        args.push('-e', code);
      }

      const proc = spawn(interpreter, args, {
        cwd: path.dirname(this.config.schemePath),
      });

      let stdout = '';
      let stderr = '';

      proc.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      proc.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      proc.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`Scheme execution failed: ${stderr}`));
        } else {
          resolve(stdout.trim());
        }
      });

      proc.on('error', (err) => {
        reject(new Error(`Failed to spawn ${interpreter}: ${err.message}`));
      });
    });
  }

  /**
   * Load DANL Scheme implementation
   */
  async loadDANL(): Promise<void> {
    const schemeCode = await fs.readFile(this.config.schemePath, 'utf-8');
    await this.executeScheme(schemeCode);
  }

  /**
   * Simulate DANL network
   */
  async simulateNetwork(network: DANLNode[]): Promise<SimulationResult> {
    // Generate Scheme code to create network
    const networkScheme = this.generateNetworkScheme(network);

    // Execute simulation
    const schemeCode = `
      (load "${this.config.schemePath}")
      ${networkScheme}
      (define result (simulate-network network))
      (display (export-trace-json (cdr (assoc 'history result))))
    `;

    const output = await this.executeScheme(schemeCode);

    // Parse JSON output
    try {
      const trace = JSON.parse(output);
      return this.parseSimulationResult(trace);
    } catch (err) {
      throw new Error(`Failed to parse simulation result: ${err}`);
    }
  }

  /**
   * Compute lattice join
   */
  async latticeJoin(levels: string[]): Promise<string> {
    const schemeCode = `
      (load "${this.config.schemePath}")
      (define levels '(${levels.map(l => `'${l}`).join(' ')}))
      (display (symbol->string (list-join levels)))
    `;

    return await this.executeScheme(schemeCode);
  }

  /**
   * Compute lattice meet
   */
  async latticeMeet(levels: string[]): Promise<string> {
    const schemeCode = `
      (load "${this.config.schemePath}")
      (define levels '(${levels.map(l => `'${l}`).join(' ')}))
      (display (symbol->string (list-meet levels)))
    `;

    return await this.executeScheme(schemeCode);
  }

  /**
   * Evaluate M/S-expression
   */
  async evaluateMSExpression(meta: any, structural: string, context: any): Promise<any> {
    const schemeCode = `
      (load "${this.config.schemePath}")
      (define ms-expr (make-ms '${JSON.stringify(meta)} ${structural}))
      (display (ms->description ms-expr))
    `;

    const result = await this.executeScheme(schemeCode);
    return JSON.parse(result);
  }

  /**
   * Get lattice level index
   */
  async getLevelIndex(level: string): Promise<number> {
    const schemeCode = `
      (load "${this.config.schemePath}")
      (display (level-index '${level}))
    `;

    const result = await this.executeScheme(schemeCode);
    return parseInt(result, 10);
  }

  /**
   * Generate Scheme code for network definition
   */
  private generateNetworkScheme(nodes: DANLNode[]): string {
    const nodeDefinitions = nodes.map((node, idx) => {
      const transitionName = node.attributes?.transition || 'propagate-belief-ms';
      const neighbors = node.neighbors.map(n => `'${n}`).join(' ');

      return `
        (make-node '${node.name}
                   '${node.state}
                   ${transitionName}
                   '(${neighbors})
                   ${node.tauCoefficient}
                   '${JSON.stringify(node.attributes || {}).replace(/"/g, '\\"')})
      `;
    });

    return `(define network (list ${nodeDefinitions.join(' ')}))`;
  }

  /**
   * Parse simulation result from JSON trace
   */
  private parseSimulationResult(trace: any[]): SimulationResult {
    if (!Array.isArray(trace) || trace.length === 0) {
      throw new Error('Invalid trace format');
    }

    const history: DANLNode[][] = [];
    const traceSteps: SimulationResult['trace'] = [];

    for (const step of trace) {
      const states: Record<string, string> = {};
      const observables: Record<string, number> = {};
      const nodes: DANLNode[] = [];

      for (const nodeData of step.states) {
        states[nodeData.name] = nodeData.state;
        observables[nodeData.name] = nodeData.observable || 0;

        nodes.push({
          name: nodeData.name,
          state: nodeData.state,
          tauCoefficient: nodeData.tauCoefficient || 1.0,
          observable: nodeData.observable || 0,
          neighbors: nodeData.neighbors || [],
          attributes: nodeData.attributes || {},
        });
      }

      history.push(nodes);
      traceSteps.push({
        step: step.step,
        states,
        observables,
      });
    }

    const final = history[history.length - 1];
    const iterations = trace.length - 1;
    const converged = trace.length > 1; // If we have more than initial state

    return {
      history,
      final,
      iterations,
      converged,
      trace: traceSteps,
    };
  }

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    if (this.schemeProcess) {
      this.schemeProcess.kill();
      this.schemeProcess = null;
    }
  }
}
