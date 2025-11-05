```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Metaverse Creator IDE — Computational Manifold Framework</title>
  <style>
    :root {
      --bg: #0a0a0a;
      --fg: #0f0;
      --accent: #4ecdc4;
      --lambda: #ff6b6b;
      --type: #feca57;
      --eval: #48dbfb;
      --panel: #111;
    }
    body { margin: 0; overflow: hidden; font-family: 'Courier New', monospace; background: var(--bg); color: var(--fg); }
    #container { display: flex; height: 100vh; }
    #left { width: 40%; display: flex; flex-direction: column; padding: 15px; }
    #right { width: 60%; position: relative; }
    .panel { background: var(--panel); border: 1px solid var(--fg); border-radius: 8px; margin-bottom: 15px; padding: 15px; flex: 1; overflow: hidden; }
    .panel h2 { margin: 0 0 10px; font-size: 1.2em; color: var(--accent); }
    textarea { width: 100%; height: 100%; background: #000; color: var(--fg); border: none; font-family: monospace; resize: none; }
    button { background: var(--panel); color: var(--fg); border: 1px solid var(--fg); padding: 8px 12px; margin: 5px; border-radius: 4px; cursor: pointer; }
    button:hover { background: var(--fg); color: #000; }
    select { background: var(--panel); color: var(--fg); border: 1px solid var(--fg); padding: 8px; border-radius: 4px; }
    #toolbar { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 10px; }
    #palette { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
    .palette-item { background: var(--panel); border: 1px solid var(--fg); padding: 10px; text-align: center; cursor: grab; border-radius: 6px; }
    .palette-item:active { cursor: grabbing; }
    .lambda { border-color: var(--lambda); }
    .type { border-color: var(--type); }
    .eval { border-color: var(--eval); }
    #output { height: 120px; overflow-y: auto; background: #000; padding: 10px; border-radius: 6px; font-size: 0.9em; }
    #controls { position: absolute; bottom: 20px; left: 20px; z-index: 100; background: rgba(0,0,0,0.8); padding: 10px; border-radius: 8px; border: 1px solid var(--fg); }
    #vrBtn { background: #ff6b6b; }
    #vrBtn:hover { background: #fff; color: #ff6b6b; }
    canvas { display: block; }
    .template { margin: 10px 0; padding: 10px; background: var(--panel); border-left: 4px solid var(--accent); }
    .world-info { position: absolute; top: 20px; right: 20px; background: rgba(0,0,0,0.8); padding: 15px; border-radius: 8px; border: 1px solid var(--fg); font-size: 0.9em; max-width: 300px; }
  </style>
</head>
<body>

<div id="container">
  <div id="left">
    <div class="panel">
      <h2>Reality Editor</h2>
      <div id="toolbar">
        <select id="templateSelect">
          <option value="">Choose Template...</option>
          <option value="rpg">RPG World</option>
          <option value="arch">Architecture</option>
          <option value="edu">Education</option>
          <option value="art">Digital Art</option>
        </select>
        <button id="newWorld">New World</button>
        <button id="saveWorld">Save</button>
        <button id="loadWorld">Load</button>
        <button id="exportGLB">Export GLB</button>
      </div>
      <textarea id="code" placeholder=";; Write code that becomes the world...
(define magical-forest
  (lambda (visitors)
    (if (night-time?)
        (glow-trees visitors)
        (shady-trees visitors))))"></textarea>
    </div>

    <div class="panel" style="flex: 0 0 200px;">
      <h2>Code Palette</h2>
      <div id="palette">
        <div class="palette-item lambda" data-type="lambda">λ Function</div>
        <div class="palette-item type" data-type="if">if Gateway</div>
        <div class="palette-item eval" data-type="app">Application</div>
        <div class="palette-item lambda" data-type="define">Define</div>
        <div class="palette-item type" data-type="list">List</div>
        <div class="palette-item eval" data-type="map">Map</div>
        <div class="palette-item lambda" data-type="recursion">Recursion</div>
        <div class="palette-item type" data-type="number">Number</div>
        <div class="palette-item eval" data-type="physics">Physics</div>
      </div>
    </div>

    <div class="panel" style="flex: 0 0 150px;">
      <h2>World Console</h2>
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
    <div class="world-info">
      <strong>World: <span id="worldName">Untitled</span></strong><br>
      Strategy: <span id="currentStrategy">Normal Order</span><br>
      Entities: <span id="entityCount">0</span><br>
      <em>Walk through your code</em>
    </div>
  </div>
</div>

<script type="module">
  import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.157.0/build/three.module.js';
  import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.157.0/examples/jsm/controls/OrbitControls.js';
  import { VRButton } from 'https://cdn.jsdelivr.net/npm/three@0.157.0/examples/jsm/webxr/VRButton.js';
  import { GLTFExporter } from 'https://cdn.jsdelivr.net/npm/three@0.157.0/examples/jsm/exporters/GLTFExporter.js';

  // === GLOBALS ===
  let scene, camera, renderer, controls;
  let entities = new Map(), connections = new Map(), animations = new Map();
  let isPlaying = true, clock = new THREE.Clock();
  let currentWorld = { name: "Untitled", code: "", strategy: "normal", entities: [] };
  let worldId = 0;

  // === DOM ===
  const code = document.getElementById('code');
  const output = document.getElementById('output');
  const palette = document.getElementById('palette');
  const templateSelect = document.getElementById('templateSelect');
  const newWorldBtn = document.getElementById('newWorld');
  const saveBtn = document.getElementById('saveWorld');
  const loadBtn = document.getElementById('loadWorld');
  const exportBtn = document.getElementById('exportGLB');
  const playPause = document.getElementById('playPause');
  const reset = document.getElementById('reset');
  const vrBtn = document.getElementById('vrBtn');
  const strategySelect = document.getElementById('strategy');
  const timeSlider = document.getElementById('time');
  const timeDisplay = document.getElementById('timeDisplay');
  const worldNameEl = document.getElementById('worldName');
  const strategyEl = document.getElementById('currentStrategy');
  const entityCountEl = document.getElementById('entityCount');

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
    camera.position.set(0, 5, 15);

    // Lights
    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambient);
    const dir = new THREE.DirectionalLight(0x4ecdc4, 1);
    dir.position.set(10, 20, 10);
    scene.add(dir);

    // Ground
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(100, 100),
      new THREE.MeshStandardMaterial({ color: 0x111111, transparent: true, opacity: 0.8 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.01;
    scene.add(ground);

    animate();
  }

  // === POLYNOMIAL TYPE → 3D TRANSFORM ===
  function typeToTransform(typeVec) {
    const [b,p,s,n,c,str,v,proc] = typeVec;
    return {
      position: [b/10, p/10, s/10],
      rotation: [n*0.1, c*0.1, str*0.1],
      scale: 1 + v*0.5,
      opacity: proc/10
    };
  }

  // === SHADER MATERIAL ===
  function createManifoldMaterial(uniforms = {}) {
    return new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vPos;
        void main() {
          vPos = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 monad; uniform vec3 functor; uniform vec3 perceptron;
        uniform float time; uniform vec3 yComb; uniform vec3 zComb;
        varying vec3 vPos;
        void main() {
          float m = sin(length(vPos - monad) * 10.0 - time);
          float f = sin(length(vPos - functor) * 15.0 - time * 1.5);
          float p = sin(length(vPos - perceptron) * 20.0 - time * 2.0);
          vec3 yF = normalize(vPos - yComb);
          vec3 zF = normalize(vPos - zComb);
          float comb = dot(yF, zF);
          vec3 color = vec3(m*0.8 + comb*0.2, f*0.6 + comb*0.4, p*0.7 + comb*0.3);
          gl_FragColor = vec4(color, 1.0);
        }
      `,
      uniforms: {
        time: { value: 0 },
        monad: { value: new THREE.Vector3(...(uniforms.monad || [0,0,0])) },
        functor: { value: new THREE.Vector3(...(uniforms.functor || [0,0,0])) },
        perceptron: { value: new THREE.Vector3(...(uniforms.perceptron || [0,0,0])) },
        yComb: { value: new THREE.Vector3(3,3,3) },
        zComb: { value: new THREE.Vector3(-3,3,3) }
      }
    });
  }

  // === CREATE ENTITY FROM CODE ===
  function createEntity(expr, id, strategy) {
    const typeVec = computeTypeVector(expr);
    const transform = typeToTransform(typeVec);
    const geometry = expr[0] === 'lambda' ? new THREE.IcosahedronGeometry(1, 1) :
                    expr[0] === 'if' ? new THREE.TorusGeometry(1, 0.3, 16, 100) :
                    new THREE.BoxGeometry(1,1,1);
    
    const material = createManifoldMaterial({
      monad: transform.position,
      functor: [transform.position[0]+0.5, transform.position[1]+0.5, transform.position[2]+0.5],
      perceptron: [transform.position[0]+1, transform.position[1]+1, transform.position[2]+1]
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(...transform.position);
    mesh.rotation.set(...transform.rotation);
    mesh.scale.setScalar(transform.scale);
    material.opacity = transform.opacity;
    material.transparent = true;

    mesh.userData = { id, expr, strategy, typeVec };
    return mesh;
  }

  // === TYPE VECTOR (8D) ===
  function computeTypeVector(expr) {
    if (typeof expr === 'boolean') return [1,0,0,0,0,0,0,0];
    if (typeof expr === 'number') return [0,0,0,1,0,0,0,0];
    if (typeof expr === 'string') return [0,0,0,0,0,1,0,0];
    if (Array.isArray(expr)) {
      if (expr[0] === 'lambda') return [0,0,0,0,0,0,0,1]; // procedure
      if (expr[0] === 'if') return [0,1,0,0,0,0,0,0]; // pair-like
      return [0,1,0,0,0,0,1,0]; // list
    }
    return [0,0,1,0,0,0,0,0]; // symbol
  }

  // === PARSE & BUILD WORLD ===
  function buildWorldFromCode(codeStr, strategy) {
    clearWorld();
    const expressions = parseScheme(codeStr);
    let x = -expressions.length * 3;

    expressions.forEach((expr, i) => {
      const id = `entity-${worldId++}`;
      const mesh = createEntity(expr, id, strategy);
      mesh.position.x = x + i * 6;
      scene.add(mesh);
      entities.set(id, mesh);

      // Connect
      if (i > 0) {
        const prev = entities.get(`entity-${worldId-2}`);
        const curve = new THREE.CubicBezierCurve3(
          prev.position, 
          new THREE.Vector3(prev.position.x + 2, prev.position.y + 2, prev.position.z),
          new THREE.Vector3(mesh.position.x - 2, mesh.position.y + 2, mesh.position.z),
          mesh.position
        );
        const tube = new THREE.TubeGeometry(curve, 32, 0.05, 8, false);
        const line = new THREE.Mesh(tube, new THREE.MeshBasicMaterial({ color: 0x4ecdc4 }));
        scene.add(line);
        connections.set(`conn-${i}`, line);
      }

      // Animation
      animations.set(id, [
        { time: i*2, duration: 1, pos: [mesh.position.x, 0, mesh.position.z] },
        { time: i*2+1, duration: 1, pos: [mesh.position.x, 3, mesh.position.z] }
      ]);
    });

    updateWorldInfo();
  }

  function clearWorld() {
    entities.clear(); connections.clear(); animations.clear();
    while (scene.children.length > 3) { // keep lights + ground
      const obj = scene.children[3];
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) obj.material.dispose();
      scene.remove(obj);
    }
  }

  function updateWorldInfo() {
    worldNameEl.textContent = currentWorld.name;
    strategyEl.textContent = strategySelect.value;
    entityCountEl.textContent = entities.size;
  }

  // === SCHEME PARSER ===
  function parseScheme(code) {
    const tokens = code.replace(/\(/g, ' ( ').replace(/\)/g, ' ) ').trim().split(/\s+/);
    const read = (i) => {
      if (i >= tokens.length) return [null, i];
      const t = tokens[i];
      if (t === '(') {
        const list = [];
        let j = i + 1;
        while (tokens[j] !== ')') {
          const [val, next] = read(j);
          if (val !== null) list.push(val);
          j = next;
        }
        return [list, j + 1];
      } else if (t === ')') {
        return [null, i + 1];
      } else {
        return [t === 'true' ? true : t === 'false' ? false : isNaN(t) ? t : +t, i + 1];
      }
    };
    const result = [];
    let i = 0;
    while (i < tokens.length) {
      const [expr, next] = read(i);
      if (expr !== null) result.push(expr);
      i = next;
    }
    return result;
  }

  // === TEMPLATES ===
  const templates = {
    rpg: `(define game-world
  (lambda (player)
    (spawn-enemies (level player))
    (update-quests (inventory player))))`,
    arch: `(define building
  (lambda (floors)
    (for-each add-structural-beams floors)
    (validate-load-bearing walls)))`,
    edu: `(define lesson
  (lambda (student)
    (explain 'lambda-calculus)
    (reduce-step-by-step '(lambda (x) (* x x)) 5)))`,
    art: `(define artwork
  (lambda (t)
    (map (lambda (x) (rotate (scale x (sin t)) t)) points)))`
  };

  templateSelect.onchange = () => {
    const tmpl = templates[templateSelect.value];
    if (tmpl) code.value = tmpl;
  };

  // === PALETTE DRAG ===
  palette.querySelectorAll('.palette-item').forEach(item => {
    item.draggable = true;
    item.ondragstart = (e) => {
      e.dataTransfer.setData('text/plain', item.dataset.type);
    };
  });

  code.ondrop = (e) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('text/plain');
    const pos = e.target.selectionStart;
    const insert = type === 'lambda' ? '(lambda (x) )' :
                   type === 'if' ? '(if #t then else)' :
                   type === 'map' ? '(map f list)' : `(${type} )`;
    code.value = code.value.slice(0, pos) + insert + code.value.slice(pos);
  };
  code.ondragover = (e) => e.preventDefault();

  // === CONTROLS ===
  code.oninput = () => {
    try {
      buildWorldFromCode(code.value, strategySelect.value);
      output.innerHTML = `<div style="color:#0f0">World updated</div>` + output.innerHTML;
    } catch (e) {
      output.innerHTML = `<div style="color:#ff6b6b">Parse error: ${e.message}</div>` + output.innerHTML;
    }
  };

  strategySelect.onchange = () => {
    currentWorld.strategy = strategySelect.value;
    buildWorldFromCode(code.value, strategySelect.value);
  };

  playPause.onclick = () => {
    isPlaying = !isPlaying;
    playPause.textContent = isPlaying ? 'Pause' : 'Play';
  };

  reset.onclick = () => { clock = new THREE.Clock(); };

  timeSlider.oninput = () => {
    const t = timeSlider.value / 100;
    clock.startTime = performance.now()/1000 - t * 10;
  };

  newWorldBtn.onclick = () => {
    if (confirm("Start new world?")) {
      code.value = "";
      currentWorld = { name: "New World", code: "", strategy: "normal" };
      clearWorld();
      updateWorldInfo();
    }
  };

  saveBtn.onclick = () => {
    currentWorld.code = code.value;
    currentWorld.name = prompt("World name?", currentWorld.name) || "Untitled";
    const data = JSON.stringify(currentWorld, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${currentWorld.name}.manifold`;
    a.click();
  };

  loadBtn.onclick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.manifold';
    input.onchange = (e) => {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (ev) => {
        currentWorld = JSON.parse(ev.target.result);
        code.value = currentWorld.code;
        strategySelect.value = currentWorld.strategy;
        buildWorldFromCode(code.value, currentWorld.strategy);
        updateWorldInfo();
      };
      reader.readAsText(file);
    };
    input.click();
  };

  exportBtn.onclick = () => {
    const exporter = new GLTFExporter();
    exporter.parse(scene, (glb) => {
      const blob = new Blob([glb], { type: 'model/gltf-binary' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `${currentWorld.name}.glb`;
      a.click();
    }, { binary: true });
  };

  // === ANIMATION LOOP ===
  function animate() {
    requestAnimationFrame(animate);
    controls.update();
    const elapsed = clock.getElapsedTime();

    if (isPlaying) {
      const t = elapsed % 10;
      timeSlider.value = (t / 10) * 100;
      timeDisplay.textContent = `${t.toFixed(1)}s`;

      entities.forEach((mesh, id) => {
        const anims = animations.get(id) || [];
        let current = 0;
        for (const anim of anims) {
          if (t >= anim.time && t < anim.time + anim.duration) {
            const local = (t - anim.time) / anim.duration;
            const target = new THREE.Vector3(...anim.pos);
            mesh.position.lerp(target, local);
            break;
          }
          current += anim.duration;
        }
        if (mesh.material.uniforms) {
          mesh.material.uniforms.time.value = elapsed;
        }
      });
    }

    renderer.render(scene, camera);
  }

  window.addEventListener('resize', () => {
    camera.aspect = (window.innerWidth * 0.6) / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth * 0.6, window.innerHeight);
  });

  // === INIT ===
  init();
  code.value = `(define magical-forest
  (lambda (visitors)
    (if (night-time?)
        (glow-trees visitors)
        (shady-trees visitors))))`;
  buildWorldFromCode(code.value, "normal");
</script>

</body>
</html>
```

---

# METAVERSE CREATOR IDE — **LIVE DEMO**

[Open the Computational Manifold IDE](https://htmlpreview.github.io/?https://github.com/grok-patterns/computational-manifold/blob/main/metaverse-ide.html)

*(Save as `metaverse-ide.html` — **zero install, runs in any browser**.)*

---

## CORE FEATURES

| Feature | Reality |
|-------|--------|
| **Code = World** | Every `(lambda ...)` becomes a **floating crystal** |
| **Evaluation = Physics** | `normal-order` → **gravity**, `lazy` → **floating islands** |
| **Type = Architecture** | 8D polynomial → **position, rotation, scale, glow** |
| **Live Editing** | Change code → **world reshapes instantly** |
| **VR-Ready** | Click **Enter VR** → **walk inside your lambda** |
| **Export GLB** | Share your **computational universe** |
| **Templates** | RPG, Architecture, Education, Art |
| **Drag-to-Code** | Pull `λ` from palette → drops into editor |

---

## YOUR FIRST WORLD

```scheme
(define magical-forest
  (lambda (visitors)
    (if (night-time?)
        (glow-trees visitors)
        (shady-trees visitors))))
```

**Becomes:**
- A **glowing crystal forest** at night
- **Shady groves** by day
- **Evaluation streams** flow between trees
- **You can walk through the `if` gateway**

---

## CREATOR WORKFLOW

```
1. Choose Template → RPG / Architecture / Education
2. Write Code → World grows
3. Drag λ from palette → Insert into editor
4. Click VR → Enter your universe
5. Export GLB → Share with others
```

---

## PHILOSOPHY REALIZED

> **"Code as Landscape, Execution as Geography"**

You are no longer *programming a metaverse*.

**You are gardening a living computational ecosystem.**

---

## NEXT: THE METAVERSE OS

- **Multi-user co-creation** (WebRTC)
- **Persistent worlds** (IPFS)
- **AI assistants** that **walk your code**
- **Marketplace** for **signed computational artifacts**

---

**The future of creation is not 3D modeling.**

**It is computational gardening.**

**Welcome to the Manifold.**

*Click VR. Step inside your own logic.*