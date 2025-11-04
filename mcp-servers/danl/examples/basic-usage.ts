/**
 * DANL MCP Server - Basic Usage Examples
 *
 * Demonstrates how to use the DANL MCP server tools
 */

// NOTE: These examples assume you're using the MCP client SDK
// In Claude Code, tools are called via the mcp.callTool interface

export async function exampleSimulation(mcp: any) {
  console.log('\n=== Example 1: Basic Network Simulation ===\n');

  const result = await mcp.callTool('mcp__danl__simulate_network', {
    nodes: [
      {
        name: 'perceptual-array',
        state: 'potential',
        tauCoefficient: 1.25,
        neighbors: ['inference-engine'],
        attributes: { ceiling: 'confident' },
      },
      {
        name: 'inference-engine',
        state: 'active',
        tauCoefficient: 1.5,
        neighbors: ['perceptual-array', 'consensus-forum'],
        attributes: { floor: 'potential' },
      },
      {
        name: 'consensus-forum',
        state: 'potential',
        tauCoefficient: 0.9,
        neighbors: ['inference-engine'],
        attributes: { ceiling: 'confident', floor: 'potential' },
      },
    ],
  });

  console.log(`Converged: ${result.converged}`);
  console.log(`Iterations: ${result.iterations}`);
  console.log(`Final states:`, result.final.map((n: any) => `${n.name}: ${n.state}`));

  return result;
}

export async function exampleLatticeOperations(mcp: any) {
  console.log('\n=== Example 2: Lattice Operations ===\n');

  // Join (maximum/optimistic)
  const joinResult = await mcp.callTool('mcp__danl__lattice_join', {
    levels: ['potential', 'active', 'potential'],
  });
  console.log(`Join result: ${joinResult.result}`);  // 'active'

  // Meet (minimum/conservative)
  const meetResult = await mcp.callTool('mcp__danl__lattice_meet', {
    levels: ['active', 'confident', 'potential'],
  });
  console.log(`Meet result: ${meetResult.result}`);  // 'potential'

  // Blend (weighted average)
  const blendResult = await mcp.callTool('mcp__danl__blend_level', {
    self: 'potential',
    neighbor: 'confident',
    weight: 1.5,
  });
  console.log(`Blend result: ${blendResult.result}`);
}

export async function exampleObservableParameterization(mcp: any) {
  console.log('\n=== Example 3: Observable Parameterization ===\n');

  const nodes = [
    { name: 'perceptual-array', state: 'potential', tau: 1.25 },
    { name: 'inference-engine', state: 'active', tau: 1.5 },
    { name: 'consensus-forum', state: 'confident', tau: 0.9 },
  ];

  for (const node of nodes) {
    const result = await mcp.callTool('mcp__danl__compute_observable', {
      state: node.state,
      tauCoefficient: node.tau,
    });

    console.log(`${node.name}:`);
    console.log(`  State: ${result.state} (index: ${result.levelIndex})`);
    console.log(`  τ: ${result.tauCoefficient}`);
    console.log(`  Observable: ${result.observable}`);
  }
}

export async function exampleConvergenceValidation(mcp: any) {
  console.log('\n=== Example 4: Convergence Validation ===\n');

  // Simulate network first
  const simulation = await mcp.callTool('mcp__danl__simulate_network', {
    nodes: [
      { name: 'node1', state: 'potential', tauCoefficient: 1.0, neighbors: ['node2'] },
      { name: 'node2', state: 'active', tauCoefficient: 1.0, neighbors: ['node1'] },
    ],
  });

  // Extract trace (state snapshots)
  const trace = simulation.trace.map((t: any) => t.states);

  // Validate convergence
  const validation = await mcp.callTool('mcp__danl__validate_convergence', {
    trace,
  });

  console.log(`Converged: ${validation.converged}`);
  console.log(`Reason: ${validation.reason}`);
  console.log(`Iterations: ${validation.iterations}`);
  console.log(`Final state:`, validation.finalState);
}

export async function exampleResources(mcp: any) {
  console.log('\n=== Example 5: Reading Resources ===\n');

  // Read lattice specification
  const latticeSpec = await mcp.readResource('danl://lattice/spec');
  console.log('Lattice specification:');
  console.log(JSON.parse(latticeSpec).levels);

  // Read transition rules
  const transitions = await mcp.readResource('danl://transitions/all');
  console.log('\nTransition rules:');
  console.log(Object.keys(JSON.parse(transitions)));

  // Read observable formula
  const observableFormula = await mcp.readResource('danl://observables/formula');
  console.log('\nObservable formula:');
  console.log(JSON.parse(observableFormula).formula);

  // Read HD address info
  const hdInfo = await mcp.readResource('danl://address/info');
  console.log('\nHD Address information:');
  console.log(JSON.parse(hdInfo).hdAddress);
}

export async function exampleHDAddressing(mcp: any) {
  console.log('\n=== Example 6: HD Addressing ===\n');

  const info = await mcp.callTool('mcp__danl__get_hd_address_info', {});

  console.log(`HD Address: ${info.hdAddress}`);
  console.log(`RPC Endpoint: ${info.rpcEndpoint}`);
  console.log(`Hyperbolic Coordinates: [${info.hyperbolicCoordinates.join(', ')}]`);
  console.log(`Curvature: ${info.curvature}`);
  console.log(`Purpose: ${info.purpose}`);
  console.log(`Service Type: ${info.serviceType}`);
}

export async function exampleComplexNetwork(mcp: any) {
  console.log('\n=== Example 7: Complex Network (5 nodes) ===\n');

  const result = await mcp.callTool('mcp__danl__simulate_network', {
    nodes: [
      {
        name: 'sensor1',
        state: 'potential',
        tauCoefficient: 1.0,
        neighbors: ['aggregator'],
        transition: 'propagate-belief-ms',
      },
      {
        name: 'sensor2',
        state: 'potential',
        tauCoefficient: 1.1,
        neighbors: ['aggregator'],
        transition: 'propagate-belief-ms',
      },
      {
        name: 'aggregator',
        state: 'bottom',
        tauCoefficient: 1.5,
        neighbors: ['sensor1', 'sensor2', 'decider'],
        transition: 'interpret-evidence-ms',
      },
      {
        name: 'decider',
        state: 'potential',
        tauCoefficient: 1.3,
        neighbors: ['aggregator', 'executor'],
        transition: 'interpret-evidence-ms',
      },
      {
        name: 'executor',
        state: 'bottom',
        tauCoefficient: 0.9,
        neighbors: ['decider'],
        transition: 'safeguard-consensus-ms',
        attributes: { ceiling: 'confident', floor: 'potential' },
      },
    ],
  });

  console.log(`Converged in ${result.iterations} iterations`);
  console.log('\nEvolution:');
  result.trace.forEach((step: any, i: number) => {
    console.log(`Step ${i}:`, step.states);
  });
}

// Run all examples
async function main() {
  // Note: In real usage, you'd get the mcp client from Claude Code context
  const mcp = {
    callTool: async (name: string, args: any) => {
      console.log(`[Mock] Calling ${name} with args:`, args);
      return { result: 'mock-result' };
    },
    readResource: async (uri: string) => {
      console.log(`[Mock] Reading resource ${uri}`);
      return '{"result": "mock-resource"}';
    },
  };

  console.log('='.repeat(60));
  console.log('DANL MCP Server - Usage Examples');
  console.log('='.repeat(60));

  await exampleSimulation(mcp);
  await exampleLatticeOperations(mcp);
  await exampleObservableParameterization(mcp);
  await exampleConvergenceValidation(mcp);
  await exampleResources(mcp);
  await exampleHDAddressing(mcp);
  await exampleComplexNetwork(mcp);

  console.log('\n=== Examples Complete ===\n');
}

// Only run if executed directly (not imported)
if (require.main === module) {
  main().catch(console.error);
}
