<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>RUMSFELDIAN MANIFOLD — Knowns, Unknowns, and the Integration Battlefield</title>
  <style>
    :root {
      --bg: #0a0a0a;
      --fg: #0f0;
      --known: #48dbfb;
      --unknown: #feca57;
      --emergent: #ff6b6b;
      --danger: #9966ff;
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
    .danger { border-color: var(--danger); }
    h2 { margin: 0 0 10px; font-size: 1.2em; }
    .known h2 { color: var(--known); }
    .unknown h2 { color: var(--unknown); }
    .emergent h2 { color: var(--emergent); }
    .danger h2 { color: var(--danger); }
    .rummy { font-family: monospace; font-size: 0.9em; line-height: 1.4; }
    .rummy strong { color: var(--fg); }
    .rummy .k { color: var(--known); }
    .rummy .u { color: var(--unknown); }
    .rummy .e { color: var(--emergent); }
    .rummy .d { color: var(--danger); }
    button { background: var(--panel); color: var(--fg); border: 1px solid var(--border); padding: 8px 12px; margin: 5px; border-radius: 4px; cursor: pointer; }
    button:hover { background: var(--fg); color: #000; }
    #output { height: 120px; overflow-y: auto; background: #000; padding: 10px; border-radius: 6px; font-size: 0.9em; }
    #battlefield { position: relative; height: 100%; width: 100%; }
    .front { stroke: var(--known); stroke-width: 2; }
    .no-mans { stroke: var(--unknown); stroke-dasharray: 5,5; }
    .minefield { fill: var(--danger); fill-opacity: 0.2; }
    .node { fill: var(--fg); r: 6; }
    .label { fill: var(--fg); font-size: 10px; text-anchor: middle; }
    #controls { position: absolute; bottom: 20px; left: 20px; z-index: 100; background: rgba(0,0,0,0.8); padding: 10px; border-radius: 8px; border: 1px solid var(--border); }
  </style>
</head>
<body>

<div id="container">
  <div id="left">
    <div class="panel known">
      <h2>KNOWN KNOWNS</h2>
      <div class="rummy">
        <span class="k">We have:</span><br>
        • LISP/M-S duality<br>
        • Datalog sheaf gluing<br>
        • Y/Z fixed points<br>
        • Triple substrate<br>
        • W3C UI<br>
        • H¹ = V(G)
      </div>
    </div>

    <div class="panel unknown">
      <h2>KNOWN UNKNOWNS</h2>
      <div class="rummy">
        <span class="u">We don't know:</span><br>
        • Temporal evolution mapping<br>
        • Real-time sync limits<br>
        • Conflict resolution<br>
        • H¹ ≠ V(G) meaning<br>
        • Perceptron novelty<br>
        • Media latency
      </div>
    </div>

    <div class="panel emergent">
      <h2>UNKNOWN KNOWNS</h2>
      <div class="rummy">
        <span class="e">Emergent:</span><br>
        • LISP↔PROLOG rules<br>
        • Modality effects<br>
        • Template aesthetics<br>
        • Triple connections<br>
        • WebRTC sync<br>
        • Restriction optimization
      </div>
    </div>

    <div class="panel danger">
      <h2>UNKNOWN UNKNOWNS</h2>
      <div class="rummy">
        <span class="d">Black Holes:</span><br>
        1. Modality Cascade<br>
        2. Sheaf Singularity<br>
        3. Correspondence Breakdown<br>
        4. Template Paradox<br>
        5. Combinator Blowup<br>
        6. Media Feedback Loop
      </div>
    </div>

    <div class="panel" style="flex: 0 0 150px;">
      <h2>Rumsfeldian Console</h2>
      <div id="output"></div>
    </div>
  </div>

  <div id="right">
    <div id="battlefield"></div>
    <div id="controls">
      <button id="simulate">Simulate Integration</button>
      <button id="stress">Stress Test</button>
      <button id="resolve">Resolve Conflict</button>
    </div>
  </div>
</div>

<script type="module">
  import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7/+esm';

  const output = document.getElementById('output');
  const battlefield = d3.select('#battlefield');
  const width = document.getElementById('right').clientWidth;
  const height = document.getElementById('right').clientHeight;


  const svg = battlefield.append('svg')
    .attr('width', width)
    .attr('height', height);

  // Battlefield Map
  const nodes = [
    { id: 'LISP', x: width * 0.15, y: height * 0.2, layer: 'front' },
    { id: 'Datalog', x: width * 0.45, y: height * 0.2, layer: 'front' },
    { id: 'Y/Z', x: width * 0.15, y: height * 0.4, layer: 'front' },
    { id: 'Sheaf', x: width * 0.45, y: height * 0.4, layer: 'front' },
    { id: 'Triples', x: width * 0.15, y: height * 0.6, layer: 'front' },
    { id: 'W3C', x: width * 0.45, y: height * 0.6, layer: 'front' },
    { id: 'Perceptron', x: width * 0.75, y: height * 0.2, layer: 'no-mans' },
    { id: 'Media', x: width * 0.75, y: height * 0.4, layer: 'no-mans' },
    { id: 'State', x: width * 0.75, y: height * 0.6, layer: 'no-mans' },
    { id: 'Mine1', x: width * 0.3, y: height * 0.3, layer: 'mine' },
    { id: 'Mine2', x: width * 0.6, y: height * 0.5, layer: 'mine' }
  ];

  const links = [
    { source: 'LISP', target: 'Datalog', type: 'front' },
    { source: 'Y/Z', target: 'Sheaf', type: 'front' },
    { source: 'Triples', target: 'W3C', type: 'front' },
    { source: 'Perceptron', target: 'Sheaf', type: 'no-mans' },
    { source: 'Media', target: 'State', type: 'no-mans' }
  ];

  // Draw links
  svg.selectAll('.link')
    .data(links)
    .enter()
    .append('line')
    .attr('class', d => d.type)
    .attr('x1', d => nodes.find(n => n.id === d.source).x)
    .attr('y1', d => nodes.find(n => n.id === d.source).y)
    .attr('x2', d => nodes.find(n => n.id === d.target).x)
    .attr('y2', d => nodes.find(n => n.id === d.target).y);

  // Draw nodes
  svg.selectAll('.node')
    .data(nodes)
    .enter()
    .append('circle')
    .attr('class', 'node')
    .attr('cx', d => d.x)
    .attr('cy', d => d.y)
    .attr('r', 6); // Added radius

  // Labels
  svg.selectAll('.label')
    .data(nodes)
    .enter()
    .append('text')
    .attr('class', 'label')
    .attr('x', d => d.x)
    .attr('y', d => d.y - 10)
    .text(d => d.id);

  // Minefields
  svg.append('rect')
    .attr('class', 'minefield')
    .attr('x', width * 0.25)
    .attr('y', height * 0.25)
    .attr('width', 100)
    .attr('height', 60);
  svg.append('rect')
    .attr('class', 'minefield')
    .attr('x', width * 0.55)
    .attr('y', height * 0.45)
    .attr('width', 100)
    .attr('height', 60);

  // Simulation
  document.getElementById('simulate').onclick = () => {
    output.innerHTML = `<div style="color:#48dbfb">Integration stable. H¹ = V(G)</div>` + output.innerHTML;
  };

  document.getElementById('stress').onclick = () => {
    const risks = [
      "Modality Cascade detected",
      "Sheaf Singularity imminent",
      "Correspondence Breakdown",
      "Template Paradox active",
      "Combinator Blowup",
      "Media Feedback Loop"
    ];
    const risk = risks[Math.floor(Math.random() * risks.length)];
    output.innerHTML = `<div style="color:#ff6b6b">STRESS: ${risk}</div>` + output.innerHTML;
  };

  document.getElementById('resolve').onclick = () => {
    output.innerHTML = `<div style="color:#feca57">Conflict resolved via perceptron adaptation</div>` + output.innerHTML;
  };
  
  window.onresize = () => {
    const newWidth = document.getElementById('right').clientWidth;
    const newHeight = document.getElementById('right').clientHeight;
    svg.attr('width', newWidth).attr('height', newHeight);
    
    // Recalculate node positions and redraw everything
    // This is simplified; a real app might use d3.forceSimulation
  };
</script>

</body>
</html>

