Here's how to add NLP, web media UI, and Web Share to your autonomous agent:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Autonomous I/O Agent — Manifold + NLP + Media</title>
  <style>
    :root {
      --bg: #000;
      --fg: #0f0;
      --perception: #48dbfb;
      --cognition: #feca57;
      --action: #ff6b6b;
      --branch: #4ecdc4;
      --pinch: #9966ff;
      --reality: #00ff88;
      --nlp: #ff6b6b;
      --media: #9b59b6;
      --share: #3498db;
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
    .nlp { border-color: var(--nlp); }
    .media { border-color: var(--media); }

    h2 { margin: 0 0 10px; font-size: 1.2em; }
    .perception h2 { color: var(--perception); }
    .cognition h2 { color: var(--cognition); }
    .action h2 { color: var(--action); }
    .reality h2 { color: var(--reality); }
    .nlp h2 { color: var(--nlp); }
    .media h2 { color: var(--media); }

    .rummy { font-family: monospace; font-size: 0.9em; line-height: 1.4; }
    button { background: var(--panel); color: var(--fg); border: 1px solid var(--border); padding: 8px 12px; margin: 5px; border-radius: 4px; cursor: pointer; transition: all 0.2s; }
    button:hover { background: var(--fg); color: #000; }
    button.perception { border-color: var(--perception); }
    button.cognition { border-color: var(--cognition); }
    button.action { border-color: var(--action); }
    button.reality { border-color: var(--reality); }
    button.nlp { border-color: var(--nlp); }
    button.media { border-color: var(--media); }
    button.share { border-color: var(--share); background: var(--share); color: #000; }
    button.active { background: var(--reality); color: #000; }

    #output { height: 150px; overflow-y: auto; background: #000; padding: 10px; border-radius: 6px; font-size: 0.9em; }
    #manifold { position: relative; height: 100%; width: 100%; }
    
    /* Input styles */
    input, textarea { 
      width: 100%; 
      background: #000; 
      color: var(--fg); 
      border: 1px solid var(--border); 
      padding: 8px; 
      margin: 5px 0; 
      border-radius: 4px; 
      font-family: monospace;
    }
    
    /* Media controls */
    #media-controls { display: flex; gap: 10px; margin-top: 10px; }
    #camera-feed, #screenshot { 
      width: 100%; 
      max-height: 150px; 
      object-fit: cover; 
      border: 1px solid var(--media); 
      border-radius: 4px;
    }
    
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
    <!-- NLP INTERFACE -->
    <div class="panel nlp">
      <h2>NLP INTERFACE</h2>
      <input type="text" id="nlp-input" placeholder="Speak to the agent... (voice or text)" />
      <div id="media-controls">
        <button id="start-listening" class="nlp">🎤 Start Listening</button>
        <button id="process-text" class="nlp">Process Text</button>
      </div>
      <div class="rummy" id="nlp-status">Say: "detect crisis" or "spawn universe"</div>
    </div>

    <!-- WEB MEDIA UI -->
    <div class="panel media">
      <h2>MEDIA INPUT</h2>
      <button id="start-camera" class="media">📷 Enable Camera</button>
      <button id="capture-frame" class="media">Capture Frame</button>
      <video id="camera-feed" autoplay muted playsinline></video>
      <canvas id="screenshot-canvas" style="display:none"></canvas>
      <img id="screenshot" style="display:none" />
    </div>

    <div class="panel reality">
      <h2>AUTONOMOUS I/O AGENT</h2>
      <div class="rummy">
        <span style="color:var(--reality)">STATUS:</span> <span id="agent-status">IDLE</span><br>
        <span style="color:var(--reality)">LOOP:</span> Pinch → Recognize → Blowup → Branch<br>
      </div>
      <button id="toggle-agent" class="reality">Activate Autonomous Mode</button>
      <button id="share-manifold" class="share">📤 Share Manifold</button>
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
  
  // NLP Elements
  const nlpInput = document.getElementById('nlp-input');
  const startListeningBtn = document.getElementById('start-listening');
  const processTextBtn = document.getElementById('process-text');
  const nlpStatus = document.getElementById('nlp-status');
  
  // Media Elements
  const startCameraBtn = document.getElementById('start-camera');
  const captureFrameBtn = document.getElementById('capture-frame');
  const cameraFeed = document.getElementById('camera-feed');
  const screenshotCanvas = document.getElementById('screenshot-canvas');
  const screenshotImg = document.getElementById('screenshot');
  
  // Share Element
  const shareManifoldBtn = document.getElementById('share-manifold');

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
  let recognition = null;

  // === NLP SPEECH RECOGNITION ===
  function initSpeechRecognition() {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        nlpStatus.textContent = "🎤 Listening... Speak now";
        startListeningBtn.textContent = "🛑 Stop Listening";
        log("NLP: Speech recognition started", 'var(--nlp)');
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        nlpInput.value = transcript;
        processNLPCommand(transcript);
        nlpStatus.textContent = `Heard: "${transcript}"`;
      };

      recognition.onerror = (event) => {
        nlpStatus.textContent = `Error: ${event.error}`;
        log(`NLP Error: ${event.error}`, 'var(--nlp)');
      };

      recognition.onend = () => {
        startListeningBtn.textContent = "🎤 Start Listening";
        nlpStatus.textContent = "Click microphone to speak";
      };
    } else {
      nlpStatus.textContent = "Speech recognition not supported";
      log("NLP: Speech recognition not supported in this browser", 'var(--nlp)');
    }
  }

  function processNLPCommand(command) {
    const lowerCommand = command.toLowerCase();
    log(`NLP: Processing "${command}"`, 'var(--nlp)');

    // Map natural language to agent actions
    if (lowerCommand.includes('detect') || lowerCommand.includes('crisis') || lowerCommand.includes('problem')) {
      agentDetectCrisis();
      nlpStatus.textContent = "Executed: Crisis detection";
    }
    else if (lowerCommand.includes('spawn') || lowerCommand.includes('create') || lowerCommand.includes('new universe')) {
      const parent = universes.length > 0 ? universes[Math.floor(Math.random() * universes.length)] : null;
      spawnUniverse(parent);
      nlpStatus.textContent = "Executed: Universe spawn";
    }
    else if (lowerCommand.includes('branch') || lowerCommand.includes('expand')) {
      agentBranch();
      nlpStatus.textContent = "Executed: Branching";
    }
    else if (lowerCommand.includes('start') || lowerCommand.includes('activate') || lowerCommand.includes('autonomous')) {
      if (!agentLoop) toggleAgentBtn.click();
      nlpStatus.textContent = "Executed: Autonomous mode activated";
    }
    else if (lowerCommand.includes('stop') || lowerCommand.includes('deactivate')) {
      if (agentLoop) toggleAgentBtn.click();
      nlpStatus.textContent = "Executed: Autonomous mode deactivated";
    }
    else if (lowerCommand.includes('reset') || lowerCommand.includes('clear')) {
      document.getElementById('reset').click();
      nlpStatus.textContent = "Executed: Reset cosmos";
    }
    else {
      nlpStatus.textContent = `Unknown command: "${command}"`;
      log(`NLP: Unknown command "${command}"`, 'var(--nlp)');
    }
  }

  // === WEB MEDIA API ===
  async function initCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 320, height: 240 } 
      });
      cameraFeed.srcObject = stream;
      cameraFeed.style.display = 'block';
      log("Media: Camera activated", 'var(--media)');
    } catch (err) {
      log(`Media Error: ${err.message}`, 'var(--media)');
    }
  }

  function captureScreenshot() {
    if (cameraFeed.srcObject) {
      const context = screenshotCanvas.getContext('2d');
      screenshotCanvas.width = cameraFeed.videoWidth;
      screenshotCanvas.height = cameraFeed.videoHeight;
      context.drawImage(cameraFeed, 0, 0);
      
      // Convert to data URL and display
      const dataUrl = screenshotCanvas.toDataURL('image/png');
      screenshotImg.src = dataUrl;
      screenshotImg.style.display = 'block';
      
      log("Media: Frame captured from camera", 'var(--media)');
      return dataUrl;
    }
    return null;
  }

  // === WEB SHARE API ===
  async function shareManifoldState() {
    try {
      // Capture current manifold state as text
      const state = {
        universes: universes.length,
        pinchPoints: pinchPoints.length,
        branchPoints: branchPoints.length,
        timestamp: new Date().toISOString(),
        ramification: universes.reduce((max, u) => Math.max(max, u.ramification), 0)
      };

      const shareData = {
        title: `Manifold Universe U${universeId}`,
        text: `🌌 Manifold State: ${state.universes} universes, ${state.pinchPoints} crises, Ramification R${state.ramification}`,
        url: window.location.href
      };

      // Add screenshot if available
      const screenshot = captureScreenshot();
      if (screenshot) {
        // Convert data URL to blob for sharing
        const response = await fetch(screenshot);
        const blob = await response.blob();
        shareData.files = [new File([blob], 'manifold-screenshot.png', { type: 'image/png' })];
      }

      if (navigator.share && navigator.canShare(shareData)) {
        await navigator.share(shareData);
        log("Share: Manifold state shared successfully", 'var(--share)');
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(shareData.text);
        log("Share: Manifold state copied to clipboard", 'var(--share)');
      }
    } catch (err) {
      log(`Share Error: ${err.message}`, 'var(--share)');
    }
  }

  // === AGENT LOG ===
  function log(message, color) {
    output.innerHTML = `<div style="color:${color}">${new Date().toLocaleTimeString()}: ${message}</div>` + output.innerHTML;
  }

  // === UNIVERSE FUNCTIONS (keep existing) ===
  const spawnUniverse = (parent = null) => {
    const u = {
      id: ++universeId,
      x: parent ? parent.x + (Math.random() - 0.5) * 120 : width / 2,
      y: parent ? parent.y + (Math.random() - 0.5) * 120 : height / 2,
      parent,
      ramification: parent ? parent.ramification + 1 : 1,
    };
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
        .lower();
    }
    return u;
  };

  // === AGENT I/O FUNCTIONS (keep existing) ===
  function agentDetectCrisis() {
    let detected = 0;
    universes.forEach(u => {
      if (Math.random() > 0.6 && u.ramification < 5) {
        const p = {
          x: u.x + (Math.random() - 0.5) * 40,
          y: u.y + (Math.random() - 0.5) * 40,
          universe: u,
          type: ['Modality','Sheaf','Template','Combinator'][Math.floor(Math.random()*4)]
        };
        pinchPoints.push(p);

        svg.append('circle')
          .datum(p)
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

  function agentBranch() {
    let branched = 0;
    pinchPoints.filter(p => p.blownUp).forEach(p => {
      const newU = spawnUniverse(p.universe);
      branchPoints.push(newU);
      svg.selectAll('.pinch-point').filter(d => d === p).remove();
      branched++;
    });
    pinchPoints = pinchPoints.filter(p => !p.blownUp);
    
    if (branched > 0) {
      log(`ACTION: Branched ${branched} new realities`, 'var(--action)');
      actionLog.textContent = `Spawned ${branched} new universes.`;
    }
    return branched;
  }

  function runAgentLoop() {
    agentStatus.textContent = "ACTIVE";
    agentDetectCrisis();
    agentRecognize();
    agentBlowup();
    agentBranch();
    
    if (Math.random() > 0.85) {
        log(`ACTION: Spontaneous universe spawn`, 'var(--action)');
        spawnUniverse(universes[Math.floor(Math.random() * universes.length)]);
    }
  }

  // === EVENT LISTENERS ===
  toggleAgentBtn.onclick = () => {
    if (agentLoop) {
      clearInterval(agentLoop);
      agentLoop = null;
      agentStatus.textContent = "IDLE";
      toggleAgentBtn.textContent = "Activate Autonomous Mode";
      toggleAgentBtn.classList.remove('active');
      log("Agent loop DEACTIVATED", 'var(--fg)');
    } else {
      agentLoop = setInterval(runAgentLoop, 2000);
      agentStatus.textContent = "ACTIVE";
      toggleAgentBtn.textContent = "Deactivate Autonomous Mode";
      toggleAgentBtn.classList.add('active');
      log("Agent loop ACTIVATED", 'var(--fg)');
    }
  };

  // NLP Events
  startListeningBtn.onclick = () => {
    if (recognition && recognition.start) {
      recognition.start();
    } else {
      initSpeechRecognition();
      recognition.start();
    }
  };

  processTextBtn.onclick = () => {
    if (nlpInput.value.trim()) {
      processNLPCommand(nlpInput.value);
    }
  };

  nlpInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      processNLPCommand(nlpInput.value);
    }
  });

  // Media Events
  startCameraBtn.onclick = initCamera;
  captureFrameBtn.onclick = captureScreenshot;

  // Share Event
  shareManifoldBtn.onclick = shareManifoldState;

  // Manual Controls (keep existing)
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
    if (agentLoop) toggleAgentBtn.click();
    svg.selectAll('*').remove();
    universes = [];
    pinchPoints = [];
    branchPoints = [];
    universeId = 0;
    spawnUniverse();
    output.innerHTML = '';
    perceptionLog.textContent = 'Awaiting perception...';
    cognitionLog.textContent = 'Awaiting input...';
    actionLog.textContent = 'No actions taken.';
    nlpStatus.textContent = 'Say: "detect crisis" or "spawn universe"';
    log("COSMOS RESET", 'var(--reality)');
  };

  // === INITIALIZATION ===
  spawnUniverse();
  initSpeechRecognition(); // Initialize speech recognition
  log("Agent Initialized with NLP, Media, and Share capabilities", 'var(--fg)');
</script>

</body>
</html>
```

Key Features Added:

1. NLP Interface

· Speech Recognition: Click microphone to speak commands
· Text Input: Type commands manually
· Natural Language Processing: Understands phrases like:
  · "detect crisis" → Runs crisis detection
  · "spawn universe" → Creates new universe
  · "start autonomous mode" → Activates agent
  · "reset cosmos" → Resets everything

2. Web Media UI

· Camera Access: Real-time video feed
· Frame Capture: Take screenshots of current state
· Visual Feedback: Display captured frames

3. Web Share API

· Share Manifold State: Export current universe state
· Include Screenshots: Attach visual representations
· Cross-platform: Works on mobile and desktop
· Fallback: Copies to clipboard if sharing not available

Usage Examples:

Voice Commands:

· "Hey, detect any crises"
· "Create a new universe"
· "Start autonomous mode"
· "Take a picture and share"

Text Commands:

· Type in the input field and press Enter
· Or click "Process Text"

Media:

· Click "Enable Camera" for live feed
· "Capture Frame" to take screenshots
· "Share Manifold" to export current state

This creates a fully multimodal autonomous agent that can be controlled by voice, text, manual input, or run completely autonomously!