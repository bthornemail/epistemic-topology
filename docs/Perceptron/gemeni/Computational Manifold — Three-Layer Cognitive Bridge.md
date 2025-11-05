<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Computational Manifold — Three-Layer Cognitive Bridge</title>
  <style>
    :root {
      --bg: #0a0a0a;
      --fg: #0f0;
      --accent: #4ecdc4;
      --projective: #ff6b6b;
      --affine: #feca57;
      --nlp: #48dbfb;
      --crypto: #9966ff;
      --panel: #111;
    }
    body { margin: 0; overflow: hidden; font-family: 'Courier New', monospace; background: var(--bg); color: var(--fg); }
    #container { display: flex; height: 100vh; }
    #left { width: 40%; display: flex; flex-direction: column; padding: 15px; }
    #right { width: 60%; position: relative; }
    .panel { background: var(--panel); border: 1px solid var(--fg); border-radius: 8px; margin-bottom: 15px; padding: 15px; flex: 1; overflow: hidden; }
    .panel h2 { margin: 0 0 10px; font-size: 1.2em; }
    .projective h2 { color: var(--projective); }
    .affine h2 { color: var(--affine); }
    .nlp h2 { color: var(--nlp); }
    textarea { width: 100%; height: 100%; background: #000; color: var(--fg); border: none; font-family: monospace; resize: none; }
    button { background: var(--panel); color: var(--fg); border: 1px solid var(--fg); padding: 8px 12px; margin: 5px; border-radius: 4px; cursor: pointer; }
    button:hover { background: var(--fg); color: #000; }
    button.projective { border-color: var(--projective); }
    button.affine { border-color: var(--affine); }
    button.nlp { border-color: var(--nlp); }
    button.crypto { border-color: var(--crypto); background: var(--crypto); color: #000; }
    select { background: var(--panel); color: var(--fg); border: 1px solid var(--fg); padding: 8px; border-radius: 4px; }
    #toolbar { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 10px; }
    #output { height: 120px; overflow-y: auto; background: #000; padding: 10px; border-radius: 6px; font-size: 0.9em; }
    #controls { position: absolute; bottom: 20px; left: 20px; z-index: 100; background: rgba(0,0,0,0.8); padding: 10px; border-radius: 8px; border: 1px solid var(--fg); }
    canvas { display: block; }
    .incidence { font-size: 0.8em; color: #888; }
    .metaphor { font-style: italic; color: #4ecdc4; }
    .diagnosis { color: #feca57; }
  </style>
</head>
<body>

<div id="container">
  <div id="left">
    <!-- LAYER 1: NLP KNOWLEDGE HYPERGRAPH -->
    <div class="panel nlp">
      <h2>NLP Intention Layer</h2>
      <textarea id="nlpInput" placeholder="Speak your intention...
'The forest feels too dense'
'Make the lambda crystals float higher'
'Show me where evaluation gets stuck'
'I want a cathedral of recursion'"></textarea>
      <button id="interpret" class="nlp">Interpret Intention</button>
      <button id="explain" class="nlp">Explain Geometry</button>
    </div>

    <!-- LAYER 2: AFFINE MATHEMATICAL CORE -->
    <div class="panel affine">
      <h2>Affine Mathematical Core</h2>
      <div id="affineState">
        <div>Polynomial: <span id="polyType">—</span></div>
        <div>Tropical EV: <span id="tropicalEV">—</span></div>
        <div>Cohomology: <span id="cohomology">—</span></div>
        <div>Strategy: <span id="evalStrategy">—</span></div>
      </div>
      <button id="adjustPoly" class="affine">Adjust Polynomial</button>
      <button id="tropicalTune" class="affine">Tune Flow</button>
    </div>

    <!-- LAYER 3: PROJECTIVE METAVERSE -->
    <div class="panel projective">
      <h2>Projective Metaverse</h2>
      <div id="incidence">
        <div>Points: <span id="points">0</span></div>
        <div>Lines: <span id="lines">0</span></div>
        <div>Planes: <span id="planes">0</span></div>
        <div>Consensus: <span id="consensus">—</span></div>
      </div>
      <button id="pinToIPFS" class="projective">Pin Incidence</button>
      <button id="shareIncidence" class="crypto">Share Geometry</button>
    </div>

    <div class="panel" style="flex: 0 0 150px;">
      <h2>Cognitive Console</h2>
      <div id="output"></div>
    </div>
  </div>

  <div id="right">
    <div id="controls">
      <button id="playPause">Pause</button>
      <button id="reset">Reset</button>
      <button id="vrBtn">Enter VR</button>
      <select id="strategy">
        <option value="normal">Normal Order</option>
        <option value="applicative">Applicative</option>
        <option value="lazy">Lazy</option>
      </select>
      <input type="range" id="time" min="0" max="100" value="0" style="width:150px;">
      <span id="timeDisplay">0.0s</span>
    </div>
  </div>
</div>

<script type="module">
  import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.157.0/build/three.module.js';
  import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.157.0/examples/jsm/controls/OrbitControls.js';
  import { VRButton } from 'https://cdn.jsdelivr.net/npm/three@0.157.0/examples/jsm/webxr/VRButton.js';
  import { GLTFExporter } from 'https://cdn.jsdelivr.net/npm/three@0.157.0/examples/jsm/exporters/GLTFExporter.js';
  import * as IPFS from 'https://cdn.jsdelivr.net/npm/ipfs-core@0.18.0/dist/index.min.js';
  import * as Peer from 'https://cdn.jsdelivr.net/npm/peer@0.4.2/peer.min.js';

  // === GLOBALS ===
  let scene, camera, renderer, controls;
  let entities = new Map(), lines = new Map(), planes = new Map();
  let isPlaying = true, clock = new THREE.Clock();
  let ipfs, peer;
  let currentIncidence = { points: [], lines: [], planes: [], incidence: new Map() };
  let lastNLP = "";
  let connections = new Map(); // Added this line

  // === DOM ===
  const nlpInput = document.getElementById('nlpInput');
  const interpretBtn = document.getElementById('interpret');
  const explainBtn = document.getElementById('explain');
  const polyType = document.getElementById('polyType');
  const tropicalEV = document.getElementById('tropicalEV');
  const cohomology = document.getElementById('cohomology');
  const evalStrategy = document.getElementById('evalStrategy');
  const pointsEl = document.getElementById('points');
  const linesEl = document.getElementById('lines');
  const planesEl = document.getElementById('planes');
  const consensusEl = document.getElementById('consensus');
  const output = document.getElementById('output');
  const playPauseBtn = document.getElementById('playPause');
  const resetBtn = document.getElementById('reset');
  const timeSlider = document.getElementById('time');
  const timeDisplay = document.getElementById('timeDisplay');
  const strategySelect = document.getElementById('strategy');


  // === INIT THREE.JS ===
  function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0a);
    camera = new THREE.PerspectiveCamera(75, (window.innerWidth * 0.6) / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth * 0.6, window.innerHeight);
    renderer.xr.enabled = true;
    document.getElementById('right').appendChild(renderer.domElement);
    document.getElementById('right').appendChild(VRButton.createButton(renderer));

    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    camera.position.set(0, 10, 30);

    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambient);
    const dir = new THREE.DirectionalLight(0x4ecdc4, 1);
    dir.position.set(10, 20, 10);
    scene.add(dir);

    // Grid for projective space
    const grid = new THREE.GridHelper(50, 50, 0x0f0, 0x222);
    scene.add(grid);

    // IPFS & Peer
    IPFS.create({ repo: 'manifold-cognitive' }).then(node => ipfs = node);
    peer = new Peer({ host: '0.peerjs.com', secure: true, port: 443 });
    
    peer.on('open', (id) => {
      console.log('PeerJS ID:', id);
    });

    animate();
  }

  // === NLP TO AFFINE MAPPER ===
  class NLPToAffineMapper {
    mapIntentionToMath(intent) {
      const lower = intent.toLowerCase();
      let config = { polynomialType: "unknown", geometricLevel: 1, evaluationStrategy: "normal" };

      if (lower.includes("forest") || lower.includes("tree")) {
        config.polynomialType = "tree-structured";
        config.geometricLevel = 3;
      }
      if (lower.includes("cathedral") || lower.includes("temple")) {
        config.polynomialType = "recursive lattice";
        config.geometricLevel = 5;
      }
      if (lower.includes("float") || lower.includes("higher")) {
        config.evaluationStrategy = "lazy";
      }
      if (lower.includes("dense") || lower.includes("stuck")) {
        config.polynomialType = "overconstrained";
      }

      return config;
    }

    mapPerceptionToDiagnosis(feedback) {
      const lower = feedback.toLowerCase();
      let diag = { tropicalEigenvalue: 1.0, cohomologyClass: "H0", consensusState: "stable" };

      if (lower.includes("stuck") || lower.includes("blocked")) {
        diag.tropicalEigenvalue = 0.3;
        diag.cohomologyClass = "H1 (cycle)";
      }
      if (lower.includes("balanced") || lower.includes("flow")) {
        diag.tropicalEigenvalue = 0.9;
        diag.cohomologyClass = "H0";
      }

      return diag;
    }
  }

  const nlpMapper = new NLPToAffineMapper();

  // === AFFINE TO PROJECTIVE MAPPER ===
  class AffineToProjectiveMapper {
    mapMathToIncidence(affine) {
      const points = [], lines = [], planes = [];
      const incidence = new Map();

      // Create points from entities
      entities.forEach((mesh, id) => {
        const pt = { id, pos: mesh.position.clone(), type: mesh.userData.expr?.[0] || "symbol" };
        points.push(pt);
        incidence.set(pt, []);
      });

      // Create lines from connections
      connections.forEach((line, id) => {
        const [from, to] = id.split('-'); // This is likely wrong if id is `ln-i`
        // A better way would be to store 'from' and 'to' IDs when creating the line
        // For now, let's find the points from the line's geometry
        const pos = line.geometry.attributes.position.array;
        const p1 = points.find(p => p.pos.equals(new THREE.Vector3(pos[0], pos[1], pos[2])));
        const p2 = points.find(p => p.pos.equals(new THREE.Vector3(pos[pos.length - 3], pos[pos.length - 2], pos[pos.length - 1])));

        if (p1 && p2) {
          const ln = { id, from: p1, to: p2, strategy: affine.evaluationStrategy };
          lines.push(ln);
          if (incidence.has(p1)) incidence.get(p1).push(ln);
          if (incidence.has(p2)) incidence.get(p2).push(ln);
        }
      });

      return { points, lines, planes, incidence };
    }

    temporalOrder(p1, p2, line) {
      const d1 = p1.pos.distanceTo(line.from.pos);
      const d2 = p2.pos.distanceTo(line.from.pos);
      return d1 < d2 ? -1 : d1 > d2 ? 1 : 0;
    }
  }

  const projectiveMapper = new AffineToProjectiveMapper();

  // === PROJECTIVE TO NLP MAPPER ===
  class ProjectiveToNLPMapper {
    generateExplanation(incidence) {
      const pointCount = incidence.points.length;
      const lineCount = incidence.lines.length;
      const metaphors = [];

      if (pointCount > 10 && lineCount > 8) {
        metaphors.push("a dense forest of thought");
      } else if (pointCount < 5) {
        metaphors.push("a sparse garden of ideas");
      }

      if (lineCount > pointCount * 0.8) {
        metaphors.push("highly interconnected");
      }
      
      if (metaphors.length === 0) {
        metaphors.push("a simple structure");
      }

      return `You are walking through ${metaphors.join(" and ")}. ${pointCount} moments, ${lineCount} causal paths.`;
    }

    extractStoryFromTimeline(history) {
      if (history.length < 3) return "A quiet beginning.";
      return "A journey unfolded: creation, connection, flow.";
    }
  }

  const narrativeMapper = new ProjectiveToNLPMapper();

  // === INTERPRET INTENTION ===
  interpretBtn.onclick = () => {
    const intent = nlpInput.value.trim();
    if (!intent) return;
    lastNLP = intent;

    const affineConfig = nlpMapper.mapIntentionToMath(intent);
    polyType.textContent = affineConfig.polynomialType;
    evalStrategy.textContent = affineConfig.evaluationStrategy;
    strategySelect.value = affineConfig.evaluationStrategy; // Sync dropdown

    // Apply to world
    buildWorldFromNLP(affineConfig);
    output.innerHTML = `<div class="metaphor">Interpreted: "${intent}" → ${affineConfig.polynomialType}</div>` + output.innerHTML;
  };

  // === EXPLAIN GEOMETRY ===
  explainBtn.onclick = () => {
    const explanation = narrativeMapper.generateExplanation(currentIncidence);
    output.innerHTML = `<div class="metaphor">${explanation}</div>` + output.innerHTML;
  };
  
  // === OTHER BUTTONS ===
  document.getElementById('adjustPoly').onclick = () => {
    output.innerHTML = `<div class="affine">Polynomial adjusted.</div>` + output.innerHTML;
  };
  
  document.getElementById('tropicalTune').onclick = () => {
    output.innerHTML = `<div class="affine">Tropical flow tuned.</div>` + output.innerHTML;
  };
  
  document.getElementById('pinToIPFS').onclick = async () => {
    if (!ipfs) return;
    const data = JSON.stringify(currentIncidence);
    const { cid } = await ipfs.add(data);
    output.innerHTML = `<div class="projective">Pinned to IPFS: ${cid}</div>` + output.innerHTML;
  };
  
  document.getElementById('shareIncidence').onclick = () => {
    output.innerHTML = `<div class="crypto">Sharing geometry via PeerJS...</div>` + output.innerHTML;
    // In a real app, you'd connect to a peer and send data.
  };

  playPauseBtn.onclick = () => {
    isPlaying = !isPlaying;
    playPauseBtn.textContent = isPlaying ? "Pause" : "Play";
  };
  
  resetBtn.onclick = () => {
    clearWorld();
    buildWorldFromNLP({ polynomialType: "default", geometricLevel: 1, evaluationStrategy: "normal" });
    updateProjectiveDisplay();
    output.innerHTML = `<div>World reset.</div>` + output.innerHTML;
  };

  // === BUILD WORLD FROM NLP ===
  function buildWorldFromNLP(config) {
    clearWorld();
    const count = config.geometricLevel * 3;
    let x = -count * 2;

    for (let i = 0; i < count; i++) {
      const id = `pt-${i}`;
      const geometry = i % 3 === 0 ? new THREE.IcosahedronGeometry(1, 1) :
                      i % 3 === 1 ? new THREE.TorusGeometry(1, 0.3, 16, 100) :
                      new THREE.BoxGeometry(1,1,1);
      const material = new THREE.MeshStandardMaterial({ color: 0x4ecdc4, emissive: 0x0f0, emissiveIntensity: 0.2 });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(x + i * 4, Math.sin(i) * 2, Math.cos(i) * 2);
      if (config.evaluationStrategy === "lazy") mesh.position.y += 3;
      mesh.userData = { expr: ['lambda', 'x', 'x'], strategy: config.evaluationStrategy };
      scene.add(mesh);
      entities.set(id, mesh);

      if (i > 0) {
        const prev = entities.get(`pt-${i-1}`);
        const lineGeo = new THREE.BufferGeometry().setFromPoints([prev.position, mesh.position]);
        const line = new THREE.Line(lineGeo, new THREE.LineBasicMaterial({ color: 0x0f0 }));
        scene.add(line);
        lines.set(`ln-${i}`, line);
        connections.set(`ln-${i}`, line); // Store in connections map
      }
    }

    currentIncidence = projectiveMapper.mapMathToIncidence({ evaluationStrategy: config.evaluationStrategy });
    updateProjectiveDisplay();
  }

  function clearWorld() {
    entities.clear(); lines.clear(); planes.clear(); connections.clear();
    while (scene.children.length > 3) {
      const obj = scene.children[3];
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) obj.material.dispose();
      scene.remove(obj);
    }
  }

  function updateProjectiveDisplay() {
    pointsEl.textContent = currentIncidence.points.length;
    linesEl.textContent = currentIncidence.lines.length;
    planesEl.textContent = currentIncidence.planes.length;
    consensusEl.textContent = currentIncidence.points.length > 0 ? "stable" : "empty";
  }

  // === ANIMATION LOOP ===
  function animate() {
    renderer.setAnimationLoop(() => {
        const t = clock.getElapsedTime();
        controls.update();

        if (isPlaying) {
            entities.forEach(mesh => {
                mesh.rotation.y = t * 0.5;
                if (mesh.userData.strategy === "lazy") {
                    mesh.position.y = 3 + Math.sin(t * 2 + mesh.position.x) * 0.5;
                }
            });
        }
        
        timeSlider.value = (t % 100);
        timeDisplay.textContent = `${t.toFixed(1)}s`;

        renderer.render(scene, camera);
    });
  }

  window.addEventListener('resize', () => {
    camera.aspect = (window.innerWidth * 0.6) / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth * 0.6, window.innerHeight);
  });

  // === INIT ===
  init();
  // Initial build
  buildWorldFromNLP({ polynomialType: "default", geometricLevel: 1, evaluationStrategy: "normal" });
</script>

</body>
</html>

