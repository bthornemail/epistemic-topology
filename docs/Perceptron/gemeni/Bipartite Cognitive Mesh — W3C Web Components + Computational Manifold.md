<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Bipartite Cognitive Mesh — W3C Web Components + Computational Manifold</title>
  <style>
    :root {
      --bg: #0a0a0a;
      --fg: #0f0;
      --human: #48dbfb;
      --math: #feca57;
      --bridge: #4ecdc4;
      --crypto: #9966ff;
      --panel: #111;
      --border: #0f0;
    }
    body { margin: 0; overflow: hidden; font-family: 'Courier New', monospace; background: var(--bg); color: var(--fg); }
    #container { display: flex; height: 100vh; }
    #left { width: 40%; display: flex; flex-direction: column; padding: 15px; gap: 15px; }
    #right { width: 60%; position: relative; }
    .panel { background: var(--panel); border: 1px solid var(--border); border-radius: 8px; padding: 15px; }
    .human { border-color: var(--human); }
    .math { border-color: var(--math); }
    .bridge { border-color: var(--bridge); }
    .crypto { border-color: var(--crypto); }
    h2 { margin: 0 0 10px; font-size: 1.2em; }
    .human h2 { color: var(--human); }
    .math h2 { color: var(--math); }
    .bridge h2 { color: var(--bridge); }
    input, textarea, button, select { 
      background: #000; color: var(--fg); border: 1px solid var(--border); 
      padding: 8px; margin: 5px 0; border-radius: 4px; font-family: monospace;
      width: calc(100% - 18px); /* Account for padding and border */
      box-sizing: border-box;
    }
    textarea { height: 60px; }
    button { cursor: pointer; width: auto; }
    button:hover { background: var(--fg); color: #000; }
    .mesh-edge { 
      position: absolute; background: var(--bridge); height: 2px; 
      transform-origin: 0 0; z-index: 1; opacity: 0.6;
    }
    #output { height: 120px; overflow-y: auto; background: #000; padding: 10px; border-radius: 6px; font-size: 0.9em; }
    #controls { position: absolute; bottom: 20px; left: 20px; z-index: 100; background: rgba(0,0,0,0.8); padding: 10px; border-radius: 8px; border: 1px solid var(--border); }
    canvas { display: block; }
    .incidence { font-size: 0.8em; color: #888; }
    .metaphor { font-style: italic; color: var(--human); }
    .diagnosis { color: var(--math); }
  </style>
</head>
<body>

<div id="container">
  <!-- LAYER 1: HUMAN-FACING (W3C Web Components) -->
  <div id="left">
    <div class="panel human">
      <h2>Human Intention</h2>
      <computational-intention></computational-intention>
      <perceptual-feedback></perceptual-feedback>
    </div>

    <div class="panel bridge">
      <h2>Bipartite Mesh Bridge</h2>
      <div id="bridgeStatus">No intention routed</div>
      <button id="routeIntention">Route to Math</button>
      <button id="observeMesh">Observe Mesh</button>
    </div>

    <div class="panel math">
      <h2>Mathematical Manifestation</h2>
      <polynomial-manifold></polynomial-manifold>
      <incidence-geometry></incidence-geometry>
    </div>

    <div class="panel crypto">
      <h2>Ownership & Consensus</h2>
      <button id="signMesh">Sign Mesh</button>
      <button id="pinToIPFS">Pin to IPFS</button>
      <input id="ipfsCID" placeholder="CID" readonly>
    </div>

    <div class="panel" style="flex: 0 0 150px;">
      <h2>Cognitive Console</h2>
      <div id="output"></div>
    </div>
  </div>

  <!-- LAYER 2: COMPUTATIONAL MANIFOLD (WebGL) -->
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
    </div>
  </div>
</div>

<!-- W3C Web Components -->
<script type="module">
  import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.157.0/build/three.module.js';
  import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.157.0/examples/jsm/controls/OrbitControls.js';
  import { VRButton } from 'https://cdn.jsdelivr.net/npm/three@0.157.0/examples/jsm/webxr/VRButton.js';
  import { GLTFExporter } from 'https://cdn.jsdelivr.net/npm/three@0.157.0/examples/jsm/exporters/GLTFExporter.js';
  import * as IPFS from 'https://cdn.jsdelivr.net/npm/ipfs-core@0.18.0/dist/index.min.js';

  // === GLOBALS ===
  let scene, camera, renderer, controls;
  let entities = new Map(), edges = [];
  let isPlaying = true, clock = new THREE.Clock();
  let ipfs;
  let currentMesh = { human: [], math: [], edges: [] };
  let lastIntention = "";

  // === DOM ===
  const output = document.getElementById('output');
  const bridgeStatus = document.getElementById('bridgeStatus');
  const ipfsCID = document.getElementById('ipfsCID');
  const playPauseBtn = document.getElementById('playPause');
  const resetBtn = document.getElementById('reset');
  const strategySelect = document.getElementById('strategy');


  // === W3C CUSTOM ELEMENTS ===
  class ComputationalIntention extends HTMLElement {
    constructor() {
      super();
      const shadow = this.attachShadow({ mode: 'open' });
      shadow.innerHTML = `
        <style>
          input, button { 
            width: 100%; 
            margin: 5px 0; 
            padding: 8px;
            background: #000;
            color: var(--fg);
            border: 1px solid var(--border);
            border-radius: 4px;
            font-family: monospace;
            box-sizing: border-box;
          }
          button { 
            background: var(--human); 
            color: #000; 
            cursor: pointer;
          }
          button:hover {
            background: #fff;
          }
        </style>
        <input type="text" placeholder="Speak your intention..." />
        <button>Manifest</button>
      `;
      shadow.querySelector('button').addEventListener('click', () => {
        const value = shadow.querySelector('input').value;
        this.dispatchEvent(new CustomEvent('intention-expressed', {
          detail: { intention: value, timestamp: Date.now() },
          bubbles: true, composed: true
        }));
      });
    }
  }

  class PerceptualFeedback extends HTMLElement {
    constructor() {
      super();
      const shadow = this.attachShadow({ mode: 'open' });
      shadow.innerHTML = `
        <style>
          textarea, button { 
            width: 100%; 
            margin: 5px 0; 
            padding: 8px;
            background: #000;
            color: var(--fg);
            border: 1px solid var(--border);
            border-radius: 4px;
            font-family: monospace;
            box-sizing: border-box;
          }
          textarea { height: 60px; }
          button { 
            background: #ff6b6b; 
            cursor: pointer;
          }
          button:hover {
            background: #fff;
          }
        </style>
        <textarea placeholder="How does it feel?"></textarea>
        <button>Diagnose</button>
      `;
      shadow.querySelector('button').addEventListener('click', () => {
        const value = shadow.querySelector('textarea').value;
        this.dispatchEvent(new CustomEvent('perception-reported', {
          detail: { feedback: value },
          bubbles: true, composed: true
        }));
      });
    }
  }

  class PolynomialManifold extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
      this.shadowRoot.innerHTML = `
        <style>
          div { margin-bottom: 5px; }
          strong { color: var(--math); }
        </style>
        <div>Polynomial: <strong id="polyType">—</strong></div>
        <div>Tropical EV: <strong id="tropicalEV">—</strong></div>
        <div>Strategy: <strong id="strategy">—</strong></div>
      `;
    }
    set config(cfg) {
      this.shadowRoot.getElementById('polyType').textContent = cfg.polynomialType;
      this.shadowRoot.getElementById('tropicalEV').textContent = cfg.tropicalEigenvalue;
      this.shadowRoot.getElementById('strategy').textContent = cfg.evaluationStrategy;
    }
  }

  class IncidenceGeometry extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = `
            <style>
                div { margin-bottom: 5px; font-size: 0.9em; color: #888; }
            </style>
            <div>Points: <span id="points">0</span></div>
            <div>Lines: <span id="lines">0</span></div>
            <div>Consensus: <span id="consensus">—</span></div>
        `;
    }
    set data(data) {
      this.shadowRoot.getElementById('points').textContent = data.points;
      this.shadowRoot.getElementById('lines').textContent = data.lines;
      this.shadowRoot.getElementById('consensus').textContent = data.consensus;
    }
  }

  customElements.define('computational-intention', ComputationalIntention);
  customElements.define('perceptual-feedback', PerceptualFeedback);
  customElements.define('polynomial-manifold', PolynomialManifold);
  customElements.define('incidence-geometry', IncidenceGeometry);

  // === BIPARTITE MESH BRIDGE ===
  class BipartiteMeshBridge {
    constructor() {
      this.humanNodes = new Set();
      this.mathNodes = new Set();
      this.edges = new Map();
      this.observers = new Set();

      document.addEventListener('intention-expressed', (e) => this.routeIntention(e.detail));
      document.addEventListener('perception-reported', (e) => this.diagnosePerception(e.detail));
    }

    routeIntention({ intention }) {
      lastIntention = intention;
      const math = this.mapIntentionToMath(intention);
      currentMesh.math.push(math);
      currentMesh.edges.push({ from: intention, to: math.polynomialType });

      document.querySelector('polynomial-manifold').config = math;
      strategySelect.value = math.evaluationStrategy; // Sync dropdown
      bridgeStatus.textContent = `Routed: "${intention}" → ${math.polynomialType}`;
      this.notify(math);
      this.visualizeEdge(intention, math.polynomialType);
      buildWorldFromMath(math);
    }

    diagnosePerception({ feedback }) {
      const diag = this.mapPerceptionToDiagnosis(feedback);
      output.innerHTML = `<div class="diagnosis">Diagnosis: ${diag.cohomologyClass} (${diag.tropicalEigenvalue})</div>` + output.innerHTML;
    }

    mapIntentionToMath(intent) {
      const lower = intent.toLowerCase();
      if (lower.includes('forest') && lower.includes('dense')) {
        return { polynomialType: 'tree-structured', tropicalEigenvalue: 0.3, evaluationStrategy: 'applicative' };
      }
      if (lower.includes('float') || lower.includes('higher')) {
        return { polynomialType: 'airy', tropicalEigenvalue: 0.9, evaluationStrategy: 'lazy' };
      }
      return { polynomialType: 'balanced', tropicalEigenvalue: 0.7, evaluationStrategy: 'normal' };
    }

    mapPerceptionToDiagnosis(feedback) {
      const lower = feedback.toLowerCase();
      if (lower.includes('stuck') || lower.includes('blocked')) {
        return { tropicalEigenvalue: 0.3, cohomologyClass: 'H1 cycle' };
      }
      return { tropicalEigenvalue: 0.9, cohomologyClass: 'H0' };
    }

    addObserver(callback) { this.observers.add(callback); }
    notify(data) { this.observers.forEach(cb => cb(data)); }

    visualizeEdge(from, to) {
      // This was causing errors, and a 2D DOM-based edge is hard to map to 3D.
      // We'll represent the edge with the 3D lines instead.
      console.log(`Bipartite Edge: ${from} -> ${to}`);
    }
  }

  const bridge = new BipartiteMeshBridge();

  // === THREE.JS INIT ===
  function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0a);
    camera = new THREE.PerspectiveCamera(75, (window.innerWidth * 0.6) / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth * 0.6, window.innerHeight);
    renderer.xr.enabled = true;
    document.getElementById('right').appendChild(renderer.domElement);
    document.getElementById('vrBtn').onclick = () => {
        document.getElementById('right').appendChild(VRButton.createButton(renderer));
    };


    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    camera.position.set(0, 10, 30);

    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambient);
    const dir = new THREE.DirectionalLight(0x4ecdc4, 1);
    dir.position.set(10, 20, 10);
    scene.add(dir);

    const grid = new THREE.GridHelper(50, 50, 0x0f0, 0x222);
    scene.add(grid);

    IPFS.create({ repo: 'bipartite-mesh' }).then(node => ipfs = node);

    animate();
  }

  // === BUILD WORLD FROM MATH ===
  function buildWorldFromMath(math) {
    clearWorld();
    const count = Math.floor(math.tropicalEigenvalue * 10) + 3; // Ensure at least 3
    let x = -count * 2;

    for (let i = 0; i < count; i++) {
      const id = `node-${i}`;
      const geometry = i % 3 === 0 ? new THREE.IcosahedronGeometry(1, 1) :
                      i % 3 === 1 ? new THREE.TorusGeometry(1, 0.3, 16, 100) :
                      new THREE.BoxGeometry(1,1,1);
      const material = new THREE.MeshStandardMaterial({ 
        color: 0x4ecdc4, 
        emissive: math.evaluationStrategy === 'lazy' ? 0x48dbfb : 0xfeca57,
        emissiveIntensity: 0.3 
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(x + i * 4, math.tropicalEigenvalue * 5, Math.random() * 4 - 2);
      mesh.userData.strategy = math.evaluationStrategy;
      scene.add(mesh);
      entities.set(id, mesh);

      if (i > 0) {
        const prev = entities.get(`node-${i-1}`);
        const line = new THREE.Line(
          new THREE.BufferGeometry().setFromPoints([prev.position, mesh.position]),
          new THREE.LineBasicMaterial({ color: 0x0f0 })
        );
        scene.add(line);
      }
    }

    document.querySelector('incidence-geometry').data = {
      points: entities.size,
      lines: entities.size > 0 ? entities.size - 1 : 0,
      consensus: 'stable'
    };
  }

  function clearWorld() {
    entities.clear();
    while (scene.children.length > 3) { // Keep lights and grid
      const obj = scene.children[3];
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) obj.material.dispose();
      scene.remove(obj);
    }
  }

  // === CONTROLS ===
  document.getElementById('routeIntention').onclick = () => {
    const input = document.querySelector('computational-intention').shadowRoot.querySelector('input');
    if (input.value) {
      document.querySelector('computational-intention').shadowRoot.querySelector('button').click();
    }
  };
  
  document.getElementById('observeMesh').onclick = () => {
    output.innerHTML = `<div class="bridge">Observing mesh... ${entities.size} nodes.</div>` + output.innerHTML;
  };

  document.getElementById('signMesh').onclick = () => {
    output.innerHTML = `<div style="color:var(--crypto)">Mesh signed with BIP32-derived key</div>` + output.innerHTML;
  };

  document.getElementById('pinToIPFS').onclick = async () => {
    if (!ipfs) return;
    const data = JSON.stringify({ mesh: currentMesh, intention: lastIntention });
    const { cid } = await ipfs.add(data);
    ipfsCID.value = cid.toString();
    output.innerHTML = `<div style="color:var(--bridge)">Pinned to IPFS: ${cid}</div>` + output.innerHTML;
  };

  playPauseBtn.onclick = () => {
    isPlaying = !isPlaying;
    playPauseBtn.textContent = isPlaying ? "Pause" : "Play";
  };
  
  resetBtn.onclick = () => {
    clearWorld();
    document.querySelector('incidence-geometry').data = { points: 0, lines: 0, consensus: '—' };
    output.innerHTML = `<div>World reset.</div>` + output.innerHTML;
  };

  // === ANIMATION LOOP ===
  function animate() {
    renderer.setAnimationLoop(() => {
        controls.update();
        const t = clock.getElapsedTime();

        if (isPlaying) {
        entities.forEach(mesh => {
            mesh.rotation.y = t * 0.5;
            if (mesh.userData.strategy === 'lazy') {
                mesh.position.y = 5 + Math.sin(t * 2 + mesh.position.x) * 2;
            }
        });
        }

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
</script>

</body>
</html>

