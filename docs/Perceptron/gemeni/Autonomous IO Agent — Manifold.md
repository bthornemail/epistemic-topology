<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Autonomous I/O Agent — Manifold</title>
  <style>
    :root {
      --bg: #000;
      --fg: #0f0;
      --perception: #48dbfb; /* Input */
      --cognition: #feca57;  /* Processing */
      --action: #ff6b6b;     /* Output */
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
    
    /* I/O Panels */
    .perception { border-color: var(--perception); }
    .cognition { border-color: var(--cognition); }
    .action { border-color: var(--action); }
    .reality { border-color: var(--reality); }

    h2 { margin: 0 0 10px; font-size: 1.2em; }
    .perception h2 { color: var(--perception); }
    .cognition h2 { color: var(--cognition); }
    .action h2 { color: var(--action); }
    .reality h2 { color: var(--reality); }

    .rummy { font-family: monospace; font-size: 0.9em; line-height: 1.4; }
    button { background: var(--panel); color: var(--fg); border: 1px solid var(--border); padding: 8px 12px; margin: 5px; border-radius: 4px; cursor: pointer; transition: all 0.2s; }
    button:hover { background: var(--fg); color: #000; }
    button.perception { border-color: var(--perception); }
    button.cognition { border-color: var(--cognition); }
    button.action { border-color: var(--action); }
    button.reality { border-color: var(--reality); }
    button.active { background: var(--reality); color: #000; }

    #output { height: 200px; overflow-y: auto; background: #000; padding: 10px; border-radius: 6px; font-size: 0.9em; }
    #manifold { position: relative; height: 100%; width: 100%; }
    
    /* D3 Styles */
    .universe { fill: var(--reality); stroke: var(--reality); stroke-width: 2; opacity: 0.7; }
    .pinch-point { fill: var(--pinch); stroke: #fff; stroke-width: 2; }
    .branch-point { fill: var(--branch); stroke: #fff; stroke-width: 2; }
    .exceptional { stroke: var(--branch); stroke-dasharray: 5,5; stroke-width: 2; }
    .reality-label { fill: var(--reality); font-size: 10px; text-anchor: middle; user-select: none; }
    
    /* Animations */
    .animate-pulse { animation: pulse 1.5s infinite; }
    .animate-birth { animation: birth 1s forwards; }
    @keyframes pulse { 0% { r: 8; opacity: 1; } 50% { r: 18; opacity: 0.7; } 100% { r: 8; opacity: 1; } }
    @keyframes birth { 0% { opacity: 0; transform: scale(0); } 100% { opacity: 1; transform: scale(1); } }
  </style>
</head>
<body>

<div id="container">
  <div id="left">
    <div class="panel reality">
      <h2>AUTONOMOUS I/O AGENT</h2>
      <div class="rummy">
        <span style="color:var(--reality)">STATUS:</span> <span id="agent-status">IDLE</span><br>
        <span style="color:var(--reality)">LOOP:</span> Pinch → Recognize → Blowup → Branch<br>
      </div>
      <button id="toggle-agent" class="reality">Activate Autonomous Mode</button>
      <button id="reset">Reset Cosmos</button>
    </div>

    <!-- AGENT I/O PANELS -->
    <div class="panel perception">
      <h2>PERCEPTION (INPUT)</h2>
      <div class="rummy" id="perception-log">Awaiting perception...</div>
      <button id="detect" class="perception">Manual Detect</button>
    </div>

    <div class="panel cognition">
      <h2>COGNITION (PROCESSING)</h2>
      <div class="rummy" id="cognition-log">Awaiting input...</div>
      <button id="recognize" class="cognition">Manual Recognize</button>
      <button id="blowup" class="cognition">Manual Blowup</button>
    </div>

    <div class="panel action">
      <h2>ACTION (OUTPUT)</h2>
      <div class="rummy" id="action-log">No actions taken.</div>
      <button id="branch" class="action">Manual Branch</button>
      <button id="spawn" class="action">Manual Spawn</button>
    </div>

    <!-- CONSOLE -->
    <div class="panel" style="flex: 1 1 auto;">
      <h2>Agent Console</h2>
      <div id="output"></div>
    </div>
  </div>

  <div id="right">
    <div id="manifold"></div>
  </div>
</div>

<script type="module">
  import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7/+esm';

  // === DOM Elements ===
  const output = document.getElementById('output');
  const manifoldContainer = document.getElementById('manifold');
  const agentStatus = document.getElementById('agent-status');
  const toggleAgentBtn = document.getElementById('toggle-agent');
  const perceptionLog = document.getElementById('perception-log');
  const cognitionLog = document.getElementById('cognition-log');
  const actionLog = document.getElementById('action-log');

  // === D3 Setup ===
  let width = manifoldContainer.clientWidth;
  let height = manifoldContainer.clientHeight;
  const svg = d3.select('#manifold').append('svg')
    .attr('width', width)
    .attr('height', height);

  // === Agent State ===
  let universes = [];
  let pinchPoints = [];
  let branchPoints = [];
  let universeId = 0;
  let agentLoop = null;

  // === Agent Log ===
  function log(message, color) {
    output.innerHTML = `<div style="color:${color}">${new Date().toLocaleTimeString()}: ${message}</div>` + output.innerHTML;
  }

  // === Universe Functions ===
  const spawnUniverse = (parent = null) => {
    const u = {
      id: ++universeId,
      x: parent ? parent.x + (Math.random() - 0.5) * 120 : width / 2,
      y: parent ? parent.y + (Math.random() - 0.5) * 120 : height / 2,
      parent,
      ramification: parent ? parent.ramification + 1 : 1,
    };
    // Boundary check
    u.x = Math.max(50, Math.min(width - 50, u.x));
    u.y = Math.max(50, Math.min(height - 50, u.y));
    universes.push(u);

    const group = svg.append('g')
      .attr('class', 'universe-group')
      .attr('transform', `translate(${u.x},${u.y})`);

    group.append('circle')
      .attr('class', 'universe')
      .attr('r', 15 + u.ramification * 5)
      .classed('animate-birth', true);

    group.append('text')
      .attr('class', 'reality-label')
      .attr('y', -25 - u.ramification * 5)
      .text(`U${u.id} [R${u.ramification}]`);

    if (parent) {
      svg.append('line')
        .attr('class', 'exceptional')
        .attr('x1', parent.x)
        .attr('y1', parent.y)
        .attr('x2', u.x)
        .attr('y2', u.y)
        .lower(); // Send to back
    }
    return u;
  };

  // === AGENT I/O FUNCTIONS ===

  // --- 1. PERCEPTION (Input) ---
  function agentDetectCrisis() {
    let detected = 0;
    universes.forEach(u => {
      if (Math.random() > 0.6 && u.ramification < 5) { // Add a condition
        const p = {
          x: u.x + (Math.random() - 0.5) * 40,
          y: u.y + (Math.random() - 0.5) * 40,
          universe: u,
          type: ['Modality','Sheaf','Template','Combinator'][Math.floor(Math.random()*4)]
        };
        pinchPoints.push(p);

        svg.append('circle')
          .datum(p) // Bind data
          .attr('class', 'pinch-point animate-pulse')
          .attr('cx', p.x)
          .attr('cy', p.y)
          .attr('r', 12);
        
        detected++;
      }
    });
    if (detected > 0) {
      log(`PERCEPTION: Detected ${detected} new pinch points`, 'var(--perception)');
    }
    perceptionLog.textContent = `Observing ${universes.length} universes. ${pinchPoints.length} total pinch points.`;
    return detected;
  }

  // --- 2. COGNITION (Processing) ---
  function agentRecognize() {
    const unrecognized = pinchPoints.filter(p => !p.recognized);
    unrecognized.forEach(p => p.recognized = true);
    if (unrecognized.length > 0) {
      log(`COGNITION: Recognized ${unrecognized.length} singularities`, 'var(--cognition)');
      cognitionLog.textContent = `Classified ${unrecognized.length} singularities.`;
    }
    return unrecognized.length;
  }

  function agentBlowup() {
    let blownUp = 0;
    pinchPoints.filter(p => p.recognized && !p.blownUp).forEach(p => {
      svg.append('line')
        .attr('class', 'exceptional')
        .attr('x1', p.x - 20)
        .attr('y1', p.y - 20)
        .attr('x2', p.x + 20)
        .attr('y2', p.y - 20)
        .lower();
      p.blownUp = true;
      blownUp++;
    });
    if (blownUp > 0) {
      log(`COGNITION: Computed ${blownUp} exceptional divisors`, 'var(--cognition)');
      cognitionLog.textContent = `Computed ${blownUp} exceptional divisors.`;
    }
    return blownUp;
  }

  // --- 3. ACTION (Output) ---
  function agentBranch() {
    let branched = 0;
    pinchPoints.filter(p => p.blownUp).forEach(p => {
      const newU = spawnUniverse(p.universe);
      branchPoints.push(newU);
      
      // Remove the visual pinch point
      svg.selectAll('.pinch-point').filter(d => d === p).remove();
      branched++;
    });
    // Clean up state
    pinchPoints = pinchPoints.filter(p => !p.blownUp);
    
    if (branched > 0) {
      log(`ACTION: Branched ${branched} new realities`, 'var(--action)');
      actionLog.textContent = `Spawned ${branched} new universes.`;
    }
    return branched;
  }

  // === Agent Loop ===
  function runAgentLoop() {
    agentStatus.textContent = "ACTIVE";
    agentDetectCrisis();
    agentRecognize();
    agentBlowup();
    agentBranch();
    
    // Randomly spawn a new universe sometimes
    if (Math.random() > 0.85) {
        log(`ACTION: Spontaneous universe spawn`, 'var(--action)');
        spawnUniverse(universes[Math.floor(Math.random() * universes.length)]);
    }
  }

  // === Controls ===
  toggleAgentBtn.onclick = () => {
    if (agentLoop) {
      clearInterval(agentLoop);
      agentLoop = null;
      agentStatus.textContent = "IDLE";
      toggleAgentBtn.textContent = "Activate Autonomous Mode";
      toggleAgentBtn.classList.remove('active');
      log("Agent loop DEACTIVATED", 'var(--fg)');
    } else {
      agentLoop = setInterval(runAgentLoop, 2000); // Run loop every 2 seconds
      agentStatus.textContent = "ACTIVE";
      toggleAgentBtn.textContent = "Deactivate Autonomous Mode";
      toggleAgentBtn.classList.add('active');
      log("Agent loop ACTIVATED", 'var(--fg)');
    }
  };

  // Manual Buttons
  document.getElementById('detect').onclick = agentDetectCrisis;
  document.getElementById('recognize').onclick = agentRecognize;
  document.getElementById('blowup').onclick = agentBlowup;
  document.getElementById('branch').onclick = agentBranch;
  document.getElementById('spawn').onclick = () => {
      const parent = universes.length > 0 ? universes[Math.floor(Math.random() * universes.length)] : null;
      spawnUniverse(parent);
      log(`ACTION: Manual universe spawn`, 'var(--action)');
  };
  
  document.getElementById('reset').onclick = () => {
    if (agentLoop) {
        toggleAgentBtn.click(); // Turn off agent
    }
    svg.selectAll('*').remove();
    universes = [];
    pinchPoints = [];
    branchPoints = [];
    universeId = 0;
    spawnUniverse(); // Spawn root universe
    output.innerHTML = '';
    perceptionLog.textContent = 'Awaiting perception...';
    cognitionLog.textContent = 'Awaiting input...';
    actionLog.textContent = 'No actions taken.';
    log("COSMOS RESET", 'var(--reality)');
  };

  // === Resize Handler ===
  window.onresize = () => {
    width = manifoldContainer.clientWidth;
    height = manifoldContainer.clientHeight;
    svg.attr('width', width).attr('height', height);
    document.getElementById('reset').click(); // Reset on resize
  };

  // === Initial Spawn ===
  spawnUniverse();
  log("Agent Initialized. Ready for activation.", 'var(--fg)');
</script>

</body>
</html>

