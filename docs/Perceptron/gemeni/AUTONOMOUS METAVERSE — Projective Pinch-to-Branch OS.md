<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>AUTONOMOUS METAVERSE — Projective Pinch-to-Branch OS</title>
  <style>
    :root {
      --bg: #000;
      --fg: #0f0;
      --known: #48dbfb;
      --unknown: #feca57;
      --emergent: #ff6b6b;
      --branch: #4ecdc4;
      --pinch: #9966ff;
      --reality: #00ff88;
      --panel: #111;
      --border: #0f0;
    }
    body { margin: 0; overflow: hidden; font-family: 'Courier New', monospace; background: var(--bg); color: var(--fg); }
    #container { display: flex; height: 100vh; }
    #left { width: 35%; display: flex; flex-direction: column; padding: 15px; gap: 15px; overflow-y: auto; }
    #right { width: 65%; position: relative; }
    .panel { background: var(--panel); border: 1px solid var(--border); border-radius: 8px; padding: 15px; }
    .known { border-color: var(--known); }
    .unknown { border-color: var(--unknown); }
    .emergent { border-color: var(--emergent); }
    .branch { border-color: var(--branch); }
    .pinch { border-color: var(--pinch); }
    .reality { border-color: var(--reality); }
    h2 { margin: 0 0 10px; font-size: 1.2em; }
    .known h2 { color: var(--known); }
    .unknown h2 { color: var(--unknown); }
    .emergent h2 { color: var(--emergent); }
    .branch h2 { color: var(--branch); }
    .pinch h2 { color: var(--pinch); }
    .reality h2 { color: var(--reality); }
    .rummy { font-family: monospace; font-size: 0.9em; line-height: 1.4; }
    button { background: var(--panel); color: var(--fg); border: 1px solid var(--border); padding: 8px 12px; margin: 5px; border-radius: 4px; cursor: pointer; }
    button:hover { background: var(--fg); color: #000; }
    button.reality { border-color: var(--reality); }
    #output { height: 120px; overflow-y: auto; background: #000; padding: 10px; border-radius: 6px; font-size: 0.9em; }
    #metaverse { position: relative; height: 100%; width: 100%; }
    .universe { fill: var(--reality); stroke: var(--reality); stroke-width: 2; }
    .pinch-point { fill: var(--pinch); stroke: #fff; stroke-width: 2; }
    .branch-point { fill: var(--branch); stroke: #fff; stroke-width: 2; }
    .exceptional { stroke: var(--branch); stroke-dasharray: 5,5; stroke-width: 2; }
    .reality-label { fill: var(--reality); font-size: 10px; text-anchor: middle; }
    .animate-pulse { animation: pulse 2s infinite; }
    .animate-birth { animation: birth 1.5s forwards; }
    @keyframes pulse { 0% { r: 8; } 50% { r: 18; } 100% { r: 8; } }
    @keyframes birth { 0% { opacity: 0; transform: scale(0); } 100% { opacity: 1; transform: scale(1); } }
    #controls { position: absolute; bottom: 20px; left: 20px; z-index: 100; background: rgba(0,0,0,0.8); padding: 10px; border-radius: 8px; border: 1px solid var(--border); }
  </style>
</head>
<body>

<div id="container">
  <div id="left">
    <div class="panel reality">
      <h2>AUTONOMOUS METAVERSE</h2>
      <div class="rummy">
        <span style="color:var(--reality)">LIVE:</span><br>
        • Self-resolving singularities<br>
        • Ramified reality generation<br>
        • Fano-sync consensus<br>
        • Blowup-driven evolution<br>
        • No human in loop<br>
        • Infinite branching
      </div>
    </div>

    <div class="panel known">
      <h2>CORE SUBSTRATE</h2>
      <div class="rummy">
        • {s,p,o,m,r,e,p,l} triples<br>
        • Y/Z fixed points<br>
        • Datalog sheaf gluing<br>
        • W3C UI/I/O<br>
        • Fano plane sync
      </div>
    </div>

    <div class="panel emergent">
      <h2>EMERGENT LAWS</h2>
      <div class="rummy">
        • Pinch → Branch<br>
        • Recognition = Reality<br>
        • Blowup = Birth<br>
        • Ramification = Diversity
      </div>
    </div>

    <div class="panel branch">
      <h2>REALITY ENGINE</h2>
      <div class="rummy">
        <span style="color:var(--branch)">ACTIVE:</span><br>
        • Auto-pinch detection<br>
        • AI blowup resolution<br>
        • Branch universe spawning<br>
        • Transylvania lottery sync
      </div>
      <button id="spawn" class="reality">Spawn New Universe</button>
      <button id="evolve" class="reality">Evolve All</button>
    </div>

    <div class="panel" style="flex: 0 0 150px;">
      <h2>Metaverse Console</h2>
      <div id="output"></div>
    </div>
  </div>

  <div id="right">
    <div id="metaverse"></div>
    <div id="controls">
      <button id="detect">Detect Crisis</button>
      <button id="recognize" class="pinch">Recognize</button>
      <button id="blowup" class="pinch">Blow Up</button>
      <button id="branch" class="branch">Branch Reality</button>
      <button id="reset">Reset Cosmos</button>
    </div>
  </div>
</div>

<script type="module">
  import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7/+esm';

  const output = document.getElementById('output');
  const metaverseContainer = document.getElementById('metaverse');
  let width = metaverseContainer.clientWidth;
  let height = metaverseContainer.clientHeight;

  const metaverse = d3.select('#metaverse');

  const svg = metaverse.append('svg')
    .attr('width', width)
    .attr('height', height);

  let universes = [];
  let pinchPoints = [];
  let branchPoints = [];
  let universeId = 0;

  // Create a new universe
  const spawnUniverse = (parent = null) => {
    const u = {
      id: ++universeId,
      x: parent ? parent.x + (Math.random() - 0.5) * 100 : width / 2,
      y: parent ? parent.y + (Math.random() - 0.5) * 100 : height / 2,
      parent,
      ramification: parent ? parent.ramification + Math.floor(Math.random() * 2) : 1,
      generation: parent ? parent.generation + 1 : 0,
      fano: createFanoState()
    };
    universes.push(u);

    const group = svg.append('g')
      .attr('class', 'universe-group')
      .attr('transform', `translate(${u.x},${u.y})`);

    group.append('circle')
      .attr('class', 'universe')
      .attr('r', 20 + u.ramification * 10)
      .classed('animate-birth', true);

    group.append('text')
      .attr('class', 'reality-label')
      .attr('y', -30)
      .text(`U${u.id} [R${u.ramification}]`);

    if (parent) {
      svg.append('line')
        .attr('x1', parent.x)
        .attr('y1', parent.y)
        .attr('x2', u.x)
        .attr('y2', u.y)
        .attr('stroke', 'var(--branch)')
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '5,5');
    }

    output.innerHTML = `<div style="color:#00ff88">UNIVERSE U${u.id} SPAWNED [R${u.ramification}]</div>` + output.innerHTML;
    return u;
  };

  const createFanoState = () => ({
    points: Array.from({length: 7}, (_, i) => ({
      id: `P${i}`,
      value: Math.random(),
      modality: ['read','eval','print','loop','subject','predicate','object'][i]
    }))
  });

  // Initial universe
  let root = spawnUniverse();

  // Detect crisis
  document.getElementById('detect').onclick = () => {
    universes.forEach(u => {
      if (Math.random() > 0.7) {
        const p = {
          x: u.x + (Math.random() - 0.5) * 50,
          y: u.y + (Math.random() - 0.5) * 50,
          universe: u,
          type: ['Modality','Sheaf','Template','Combinator','Media','Correspondence'][Math.floor(Math.random()*6)]
        };
        pinchPoints.push(p);

        svg.append('circle')
          .datum(p) // Bind data
          .attr('class', 'pinch-point animate-pulse')
          .attr('cx', p.x)
          .attr('cy', p.y)
          .attr('r', 12);
      }
    });
    output.innerHTML = `<div style="color:#9966ff">CRISIS: ${pinchPoints.length} pinch points detected</div>` + output.innerHTML;
  };

  // Recognize
  document.getElementById('recognize').onclick = () => {
    pinchPoints.forEach(p => p.recognized = true);
    output.innerHTML = `<div style="color:#feca57">RECOGNITION: ${pinchPoints.filter(p => p.recognized).length} singularities classified</div>` + output.innerHTML;
  };

  // Blow up
  document.getElementById('blowup').onclick = () => {
    pinchPoints.filter(p => p.recognized).forEach(p => {
      const ex1 = { x: p.x - 30, y: p.y - 30 };
      const ex2 = { x: p.x + 30, y: p.y - 30 };

      svg.append('line')
        .attr('class', 'exceptional')
        .attr('x1', ex1.x)
        .attr('y1', ex1.y)
        .attr('x2', ex2.x)
        .attr('y2', ex2.y);

      p.blownUp = true;
    });
    output.innerHTML = `<div style="color:#9966ff">BLOWUP: Exceptional divisors computed</div>` + output.innerHTML;
  };

  // Branch into new reality
  document.getElementById('branch').onclick = () => {
    const newBranches = [];
    pinchPoints.filter(p => p.blownUp).forEach(p => {
      const newU = spawnUniverse(p.universe);
      newBranches.push(newU);
      svg.selectAll('.pinch-point').filter(d => d === p).remove();
    });
    branchPoints = branchPoints.concat(newBranches);
    pinchPoints = pinchPoints.filter(p => !p.blownUp);
    output.innerHTML = `<div style="color:#4ecdc4">BRANCH: ${newBranches.length} new realities born</div>` + output.innerHTML;
  };

  // Auto-spawn
  document.getElementById('spawn').onclick = () => {
    const parent = universes[Math.floor(Math.random() * universes.length)];
    spawnUniverse(parent);
  };

  // Full evolution cycle
  document.getElementById('evolve').onclick = () => {
    document.getElementById('detect').click();
    setTimeout(() => document.getElementById('recognize').click(), 800);
    setTimeout(() => document.getElementById('blowup').click(), 1600);
    setTimeout(() => document.getElementById('branch').click(), 2400);
  };

  document.getElementById('reset').onclick = () => {
    svg.selectAll('*').remove();
    universes = [];
    pinchPoints = [];
    branchPoints = [];
    universeId = 0;
    root = spawnUniverse();
    output.innerHTML = '<div style="color:#00ff88">COSMOS RESET</div>';
  };
  
  window.onresize = () => {
    width = metaverseContainer.clientWidth;
    height = metaverseContainer.clientHeight;
    svg.attr('width', width).attr('height', height);
    // A simple reset on resize might be easiest
    document.getElementById('reset').click();
  };
</script>

</body>
</html>

