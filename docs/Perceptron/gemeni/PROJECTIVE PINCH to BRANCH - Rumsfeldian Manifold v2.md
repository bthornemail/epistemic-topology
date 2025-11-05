<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>PROJECTIVE PINCH → BRANCH: Rumsfeldian Manifold v2</title>
  <style>
    :root {
      --bg: #0a0a0a;
      --fg: #0f0;
      --known: #48dbfb;
      --unknown: #feca57;
      --emergent: #ff6b6b;
      --branch: #4ecdc4;
      --pinch: #9966ff;
      --panel: #111;
      --border: #0f0;
    }
    body { margin: 0; overflow: hidden; font-family: 'Courier New', monospace; background: var(--bg); color: var(--fg); }
    #container { display: flex; height: 100vh; }
    #left { width: 40%; display: flex; flex-direction: column; padding: 15px; gap: 15px; }
    #right { width: 60%; position: relative; }
    .panel { background: var(--panel); border: 1px solid var(--border); border-radius: 8px; padding: 15px; }
    .known { border-color: var(--known); }
    .unknown { border-color: var(--unknown); }
    .emergent { border-color: var(--emergent); }
    .branch { border-color: var(--branch); }
    .pinch { border-color: var(--pinch); }
    h2 { margin: 0 0 10px; font-size: 1.2em; }
    .known h2 { color: var(--known); }
    .unknown h2 { color: var(--unknown); }
    .emergent h2 { color: var(--emergent); }
    .branch h2 { color: var(--branch); }
    .pinch h2 { color: var(--pinch); }
    .rummy { font-family: monospace; font-size: 0.9em; line-height: 1.4; }
    button { background: var(--panel); color: var(--fg); border: 1px solid var(--border); padding: 8px 12px; margin: 5px; border-radius: 4px; cursor: pointer; }
    button:hover { background: var(--fg); color: #000; }
    button.pinch { border-color: var(--pinch); }
    button.branch { border-color: var(--branch); }
    #output { height: 120px; overflow-y: auto; background: #000; padding: 10px; border-radius: 6px; font-size: 0.9em; }
    #manifold { position: relative; height: 100%; width: 100%; }
    .pinch-point { fill: var(--pinch); stroke: #fff; stroke-width: 2; }
    .branch-point { fill: var(--branch); stroke: #fff; stroke-width: 2; }
    .exceptional { stroke: var(--branch); stroke-dasharray: 5,5; stroke-width: 2; }
    .label { fill: var(--fg); font-size: 10px; text-anchor: middle; }
    .ram-label { fill: var(--branch); font-size: 10px; text-anchor: middle; }
    .animate-pinch { animation: pulse 2s infinite; }
    .animate-blowup { animation: expand 1s forwards; }
    @keyframes pulse { 0% { r: 8; } 50% { r: 18; } 100% { r: 8; } }
    @keyframes expand { 0% { opacity: 1; transform: scale(1); } 100% { opacity: 0; transform: scale(3); } }
    #controls { position: absolute; bottom: 20px; left: 20px; z-index: 100; background: rgba(0,0,0,0.8); padding: 10px; border-radius: 8px; border: 1px solid var(--border); }
  </style>
</head>
<body>

<div id="container">
  <div id="left">
    <div class="panel known">
      <h2>KNOWN KNOWNS</h2>
      <div class="rummy">
        <span style="color:var(--known)">Solid:</span><br>
        • LISP/M-S duality<br>
        • Datalog gluing<br>
        • Y/Z fixed points<br>
        • Triple substrate<br>
        • W3C UI<br>
        • H¹ = V(G)
      </div>
    </div>

    <div class="panel unknown">
      <h2>KNOWN UNKNOWNS</h2>
      <div class="rummy">
        <span style="color:var(--unknown)">Testable:</span><br>
        • Temporal mapping<br>
        • Sync load<br>
        • Conflict resolution<br>
        • H¹ ≠ V(G) insight<br>
        • Perceptron novelty<br>
        • Media latency
      </div>
    </div>

    <div class="panel emergent">
      <h2>UNKNOWN KNOWNS</h2>
      <div class="rummy">
        <span style="color:var(--emergent)">Emergent:</span><br>
        • LISP↔PROLOG rules<br>
        • Modality effects<br>
        • Template aesthetics<br>
        • Triple connections<br>
        • WebRTC sync<br>
        • Restriction opt
      </div>
    </div>

    <div class="panel pinch">
      <h2>PINCH POINTS (Black Holes)</h2>
      <div class="rummy">
        <span style="color:var(--pinch)">Singularities:</span><br>
        1. Modality Cascade<br>
        2. Sheaf Singularity<br>
        3. Correspondence<br>
        4. Template Paradox<br>
        5. Combinator Blowup<br>
        6. Media Feedback
      </div>
    </div>

    <div class="panel branch">
      <h2>BRANCH POINTS (Resolved)</h2>
      <div class="rummy">
        <span style="color:var(--branch)">New Territory:</span><br>
        • Modal separation<br>
        • Fixed-point fuel<br>
        • Theory extension<br>
        • Dual-view UI<br>
        • Bounded eval<br>
        • Decoupled obs
      </div>
      <button id="resolveAll" class="branch">Resolve All Pinches</button>
    </div>

    <div class="panel" style="flex: 0 0 150px;">
      <h2>Recognition Console</h2>
      <div id="output"></div>
    </div>
  </div>

  <div id="right">
    <div id="manifold"></div>
    <div id="controls">
      <button id="detect">Detect Pinches</button>
      <button id="recognize" class="pinch">Recognize Singularities</button>
      <button id="blowup" class="pinch">Blow Up Pinches</button>
      <button id="transform" class="branch">Transform to Branch</button>
      <button id="reset">Reset Manifold</button>
    </div>
  </div>
</div>

<script type="module">
  import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7/+esm';

  const output = document.getElementById('output');
  const manifoldContainer = document.getElementById('manifold');
  let width = manifoldContainer.clientWidth;
  let height = manifoldContainer.clientHeight;


  const svg = d3.select('#manifold').append('svg')
    .attr('width', width)
    .attr('height', height);

  // Initial structure
  let baseNodes = [];
  const updateBaseNodes = () => {
      baseNodes = [
        { id: 'LISP', x: width * 0.15, y: height * 0.2 },
        { id: 'Datalog', x: width * 0.45, y: height * 0.2 },
        { id: 'Y/Z', x: width * 0.15, y: height * 0.4 },
        { id: 'Sheaf', x: width * 0.45, y: height * 0.4 },
        { id: 'Triples', x: width * 0.15, y: height * 0.6 },
        { id: 'W3C', x: width * 0.45, y: height * 0.6 },
        { id: 'Perceptron', x: width * 0.75, y: height * 0.2 },
        { id: 'Media', x: width * 0.75, y: height * 0.5 },
        { id: 'State', x: width * 0.75, y: height * 0.8 }
      ];
  };


  let pinchPoints = [];
  let exceptionalDivisors = [];
  let branchPoints = [];

  // Draw base
  const drawBase = () => {
    svg.selectAll('*').remove();
    updateBaseNodes();

    // Base nodes
    svg.selectAll('.base')
      .data(baseNodes)
      .enter()
      .append('circle')
      .attr('class', 'base')
      .attr('cx', d => d.x)
      .attr('cy', d => d.y)
      .attr('r', 6)
      .attr('fill', '#0f0');

    svg.selectAll('.label')
      .data(baseNodes)
      .enter()
      .append('text')
      .attr('class', 'label')
      .attr('x', d => d.x)
      .attr('y', d => d.y - 10)
      .text(d => d.id);

    // Known connections
    const links = [
      { s: 'LISP', t: 'Datalog' },
      { s: 'Y/Z', t: 'Sheaf' },
      { s: 'Triples', t: 'W3C' }
    ];
    svg.selectAll('.known-link')
      .data(links)
      .enter()
      .append('line')
      .attr('class', 'known-link')
      .attr('x1', d => baseNodes.find(n => n.id === d.s).x)
      .attr('y1', d => baseNodes.find(n => n.id === d.s).y)
      .attr('x2', d => baseNodes.find(n => n.id === d.t).x)
      .attr('y2', d => baseNodes.find(n => n.id === d.t).y)
      .attr('stroke', '#48dbfb')
      .attr('stroke-width', 2);
  };

  drawBase();

  // Pinch detection
  document.getElementById('detect').onclick = () => {
    pinchPoints = [
      { x: width * 0.3, y: height * 0.3, type: 'Modality Cascade' },
      { x: width * 0.6, y: height * 0.5, type: 'Sheaf Singularity' },
      { x: width * 0.2, y: height * 0.7, type: 'Template Paradox' },
      { x: width * 0.7, y: height * 0.3, type: 'Combinator Blowup' },
      { x: width * 0.8, y: height * 0.6, type: 'Media Feedback' },
      { x: width * 0.4, y: height * 0.7, type: 'Correspondence Breakdown' }
    ];

    svg.selectAll('.pinch-point')
      .data(pinchPoints)
      .enter()
      .append('circle')
      .attr('class', 'pinch-point animate-pinch')
      .attr('cx', d => d.x)
      .attr('cy', d => d.y)
      .attr('r', 12);

    output.innerHTML = `<div style="color:#9966ff">DETECTED: ${pinchPoints.length} pinch points (black holes)</div>` + output.innerHTML;
  };

  // Recognition
  document.getElementById('recognize').onclick = () => {
    if (pinchPoints.length === 0) return;
    pinchPoints.forEach(p => {
      p.recognized = true;
    });
    svg.selectAll('.pinch-point').attr('stroke', 'var(--unknown)'); // Show recognition
    output.innerHTML = `<div style="color:#feca57">RECOGNIZED: All pinch points as projective singularities</div>` + output.innerHTML;
  };

  // Blowup
  document.getElementById('blowup').onclick = () => {
    if (pinchPoints.length === 0) return;
    exceptionalDivisors = []; // Clear old ones
    pinchPoints.forEach(p => {
      if (p.recognized) {
        const ex1 = { x: p.x - 30, y: p.y - 30, from: p };
        const ex2 = { x: p.x + 30, y: p.y - 30, from: p };
        exceptionalDivisors.push({ start: ex1, end: ex2, from: p.type });

        svg.append('line')
          .attr('class', 'exceptional')
          .attr('x1', ex1.x)
          .attr('y1', ex1.y)
          .attr('x2', ex2.x)
          .attr('y2', ex2.y);

        svg.selectAll('.pinch-point').filter(d => d === p)
          .classed('animate-blowup', true);
      }
    });
    output.innerHTML = `<div style="color:#9966ff">BLOWUP: Computed exceptional divisors for recognized pinches</div>` + output.innerHTML;
  };

  // Transform to branch
  document.getElementById('transform').onclick = () => {
    branchPoints = []; // Clear old ones
    exceptionalDivisors.forEach(div => {
      const branch1 = { x: div.start.x, y: div.start.y - 40, from: div.from.type, ramification: Math.floor(Math.random() * 3) + 2 };
      const branch2 = { x: div.end.x, y: div.end.y - 40, from: div.from.type, ramification: Math.floor(Math.random() * 3) + 2 };
      branchPoints.push(branch1, branch2);
    });

    svg.selectAll('.branch-point').remove(); // Clear old branch points
    svg.selectAll('.ram-label').remove();

    svg.selectAll('.branch-point')
      .data(branchPoints)
      .enter()
      .append('circle')
      .attr('class', 'branch-point')
      .attr('cx', d => d.x)
      .attr('cy', d => d.y)
      .attr('r', 8);
      
    svg.selectAll('.ram-label')
        .data(branchPoints)
        .enter()
        .append('text')
        .attr('class', 'ram-label')
        .attr('x', d => d.x)
        .attr('y', d => d.y - 15)
        .text(d => `R${d.ramification}`);

    exceptionalDivisors = [];
    pinchPoints = [];
    svg.selectAll('.pinch-point').remove();
    svg.selectAll('.exceptional').attr('stroke', '#fff');
    output.innerHTML = `<div style="color:#4ecdc4">TRANSFORMED: Pinches → Branch points with ramification</div>` + output.innerHTML;
  };

  document.getElementById('resolveAll').onclick = () => {
    document.getElementById('recognize').click();
    setTimeout(() => {
      document.getElementById('blowup').click();
      setTimeout(() => {
        document.getElementById('transform').click();
      }, 1000);
    }, 1000);
  };

  document.getElementById('reset').onclick = () => {
    pinchPoints = [];
    exceptionalDivisors = [];
    branchPoints = [];
    drawBase();
    output.innerHTML = '';
  };
  
  window.onresize = () => {
    width = manifoldContainer.clientWidth;
    height = manifoldContainer.clientHeight;
    svg.attr('width', width).attr('height', height);
    drawBase(); // Redraw everything on resize
  };

  // Initial draw
  drawBase();
</script>

</body>
</html>

