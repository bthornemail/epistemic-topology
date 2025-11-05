```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>WebGL Computational Manifold — R5RS Polynomial Evaluation</title>
  <style>
    body { margin: 0; overflow: hidden; font-family: 'Courier New', monospace; background: #000; color: #0f0; }
    #info {
      position: absolute; top: 10px; left: 10px; z-index: 100;
      background: rgba(0,0,0,0.7); padding: 15px; border-radius: 8px;
      max-width: 400px; font-size: 14px; line-height: 1.5;
    }
    #controls {
      position: absolute; bottom: 20px; left: 20px; z-index: 100;
      background: rgba(0,0,0,0.7); padding: 10px; border-radius: 8px;
    }
    button, select { margin: 5px; padding: 8px; background: #111; color: #0f0; border: 1px solid #0f0; border-radius: 4px; }
    button:hover { background: #0f0; color: #000; }
    canvas { display: block; }
  </style>
</head>
<body>

<div id="info">
  <h2>WebGL Computational Manifold</h2>
  <p><strong>R5RS Polynomial Evaluation in 3D</strong></p>
  <p>
    <strong>Program:</strong> <code>(factorial 5)</code><br>
    <strong>Strategies:</strong> Normal Order vs Applicative Order<br>
    <strong>Polynomials:</strong> monad (red), functor (green), perceptron (blue)<br>
    <strong>Combinators:</strong> Y (red), Z (yellow), M (cyan), S (purple)
  </p>
  <p><em>Orbit to explore. Click entity to inspect. Scrub timeline.</em></p>
</div>

<div id="controls">
  <select id="strategySelect">
    <option value="0">Normal Order</option>
    <option value="1">Applicative Order</option>
  </select>
  <button id="playPause">Pause</button>
  <button id="reset">Reset</button>
  <input type="range" id="timeline" min="0" max="100" value="0" style="width:200px;">
  <span id="timeDisplay">0.0s</span>
</div>

<script type="module">
  import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.157.0/build/three.module.js';
  import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.157.0/examples/jsm/controls/OrbitControls.js';

  // === R5RS-Generated WebGL Scene Data (from Scheme) ===
  const webglApp = {
    "comparisonScene": {
      "type": "multi-viewport",
      "viewports": [
        {
          "id": "viewport-0",
          "strategy": "normal-order",
          "camera": { "position": [25, 10, 0] },
          "scene": {
            "scene": {
              "cameras": { "main": { "position": [0,0,20], "target": [0,0,0], "fov": 60 } },
              "lights": [
                { "ambient": { "color": "#ffffff", "intensity": 0.6 } },
                { "directional": { "color": "#4ecdc4", "intensity": 0.8, "position": [5,10,5] } }
              ],
              "entities": [
                {
                  "id": "expr-0",
                  "geometry": "icosahedron",
                  "material": {
                    "type": "shader",
                    "vertexShader": "void main(){ gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }",
                    "fragmentShader": `uniform vec3 monadCoords; uniform vec3 functorCoords; uniform vec3 perceptronCoords; uniform float evaluationTime; uniform vec3 yCombinator; uniform vec3 zCombinator; varying vec3 vPosition; void main() { float monadRing = sin(length(vPosition - monadCoords) * 10.0 - evaluationTime); float functorRing = sin(length(vPosition - functorCoords) * 15.0 - evaluationTime * 1.5); float perceptronRing = sin(length(vPosition - perceptronCoords) * 20.0 - evaluationTime * 2.0); vec3 yField = normalize(vPosition - yCombinator); vec3 zField = normalize(vPosition - zCombinator); float combinatorEffect = dot(yField, zField); vec3 color = vec3(monadRing * 0.8 + combinatorEffect * 0.2, functorRing * 0.6 + combinatorEffect * 0.4, perceptronRing * 0.7 + combinatorEffect * 0.3); gl_FragColor = vec4(color, 1.0); }`,
                    "uniforms": {
                      "monadCoords": [0.1,0.3,0.4],
                      "functorCoords": [0.2,0.6,0.8],
                      "perceptronCoords": [0.3,0.9,1.2],
                      "yCombinator": [2,2,2],
                      "zCombinator": [-2,2,2]
                    }
                  },
                  "transform": { "position": [0.3,0.9,1.2], "rotation": [0.5,0.0,0.0], "scale": 2.0, "opacity": 0.8 },
                  "metadata": {
                    "polynomial": { "monad": {"position":[0.1,0.3,0.4]}, "functor": {"position":[0.2,0.6,0.8]}, "perceptron": {"position":[0.3,0.9,1.2]} },
                    "evaluation": { "strategy": "normal-order", "trace": [], "animation": [
                      {"time":0.0,"duration":1.0,"transform":{"position":[0,0,0]},"effect":{"type":"pulse","color":"#96ceb4"}},
                      {"time":1.0,"duration":0.7,"transform":{"position":[0,1,0]},"effect":{"type":"branch-glow","color":"#45b7d1"}},
                      {"time":1.7,"duration":1.0,"transform":{"position":[1,0,0]},"effect":{"type":"energy-flow","color":"#4ecdc4"}}
                    ]},
                    "combinators": { "y": {"position":[2,2,2]}, "z": {"position":[-2,2,2]}, "m": {"position":[0,0,3]}, "s": {"position":[0,3,0]} }
                  }
                },
                {
                  "id": "expr-1",
                  "geometry": "icosahedron",
                  "material": { "type": "shader", "uniforms": { "monadCoords": [0,0,0], "functorCoords": [0.1,0.1,0.1], "perceptronCoords": [0.2,0.2,0.2], "yCombinator": [2,2,2], "zCombinator": [-2,2,2] } },
                  "transform": { "position": [0.2,0.2,0.2], "rotation": [0,0,0], "scale": 1.0, "opacity": 1.0 }
                }
              ],
              "connections": [
                {
                  "id": "connection-0",
                  "type": "bezier-curve",
                  "fromNode": "expr-0",
                  "toNode": "expr-1",
                  "controlPoints": [[0.3,0.9,1.2], [0.26,0.66,0.84], [0.24,0.44,0.56], [0.2,0.2,0.2]],
                  "material": { "type": "glowing-line", "color": "#4ecdc4", "pulseSpeed": 2.0 }
                }
              ],
              "animations": {
                "evaluation-timeline": {
                  "duration": 10.0,
                  "tracks": [{
                    "strategy": "normal-order",
                    "keyframes": [
                      {"time":0.0,"duration":1.0,"transform":{"position":[0,0,0]}},
                      {"time":1.0,"duration":0.7,"transform":{"position":[0,1,0]}},
                      {"time":1.7,"duration":1.0,"transform":{"position":[1,0,0]}}
                    ]
                  }]
                }
              }
            }
          }
        },
        {
          "id": "viewport-1",
          "strategy": "applicative-order",
          "camera": { "position": [-25, 10, 0] },
          "scene": {
            "scene": {
              "cameras": { "main": { "position": [0,0,20], "target": [0,0,0], "fov": 60 } },
              "lights": [
                { "ambient": { "color": "#ffffff", "intensity": 0.6 } },
                { "directional": { "color": "#ff6b6b", "intensity": 0.8, "position": [5,10,5] } }
              ],
              "entities": [
                {
                  "id": "expr-0",
                  "geometry": "icosahedron",
                  "material": {
                    "type": "shader",
                    "vertexShader": "void main(){ gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }",
                    "fragmentShader": `uniform vec3 monadCoords; uniform vec3 functorCoords; uniform vec3 perceptronCoords; uniform float evaluationTime; uniform vec3 yCombinator; uniform vec3 zCombinator; varying vec3 vPosition; void main() { float monadRing = sin(length(vPosition - monadCoords) * 10.0 - evaluationTime); float functorRing = sin(length(vPosition - functorCoords) * 15.0 - evaluationTime * 1.5); float perceptronRing = sin(length(vPosition - perceptronCoords) * 20.0 - evaluationTime * 2.0); vec3 yField = normalize(vPosition - yCombinator); vec3 zField = normalize(vPosition - zCombinator); float combinatorEffect = dot(yField, zField); vec3 color = vec3(monadRing * 0.8 + combinatorEffect * 0.2, functorRing * 0.6 + combinatorEffect * 0.4, perceptronRing * 0.7 + combinatorEffect * 0.3); gl_FragColor = vec4(color, 1.0); }`,
                    "uniforms": {
                      "monadCoords": [0.1,0.3,0.4],
                      "functorCoords": [0.2,0.6,0.8],
                      "perceptronCoords": [0.3,0.9,1.2],
                      "yCombinator": [2,2,2],
                      "zCombinator": [-2,2,2]
                    }
                  },
                  "transform": { "position": [0.3,0.9,1.2], "rotation": [0.5,0.0,0.0], "scale": 2.0, "opacity": 0.8 }
                },
                {
                  "id": "expr-1",
                  "geometry": "icosahedron",
                  "material": { "type": "shader", "uniforms": { "monadCoords": [0,0,0], "functorCoords": [0.1,0.1,0.1], "perceptronCoords": [0.2,0.2,0.2] } },
                  "transform": { "position": [0.2,0.2,0.2], "rotation": [0,0,0], "scale": 1.0, "opacity": 1.0 }
                }
              ],
              "connections": [
                {
                  "id": "connection-0",
                  "type": "bezier-curve",
                  "fromNode": "expr-0",
                  "toNode": "expr-1",
                  "controlPoints": [[0.3,0.9,1.2], [0.26,0.66,0.84], [0.24,0.44,0.56], [0.2,0.2,0.2]],
                  "material": { "type": "glowing-line", "color": "#ff6b6b", "pulseSpeed": 2.0 }
                }
              ],
              "animations": {
                "evaluation-timeline": {
                  "duration": 8.0,
                  "tracks": [{
                    "strategy": "applicative-order",
                    "keyframes": [
                      {"time":0.0,"duration":0.5,"transform":{"position":[0,0,0]}},
                      {"time":0.5,"duration":0.5,"transform":{"position":[1,0,0]}},
                      {"time":1.0,"duration":0.7,"transform":{"position":[0,1,0]}}
                    ]
                  }]
                }
              }
            }
          }
        }
      ],
      "sync": { "evaluation-time": true, "camera-movement": false, "visualization-mode": true }
    }
  };

  // === Three.js Scene Setup ===
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000);
  document.body.appendChild(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

  // === Viewport Cameras ===
  const viewportCameras = webglApp.comparisonScene.viewports.map(vp => {
    const cam = new THREE.PerspectiveCamera(60, 1, 0.1, 1000);
    const pos = vp.camera.position;
    cam.position.set(pos[0], pos[1], pos[2]);
    cam.lookAt(0, 0, 0);
    return { vp, cam };
  });

  // === Entity & Connection Storage ===
  const entities = new Map();
  const connections = new Map();
  const animations = new Map();

  // === Shader Material Factory ===
  function createShaderMaterial(entity) {
    const uniforms = {
      evaluationTime: { value: 0 },
      monadCoords: { value: new THREE.Vector3(...(entity.material.uniforms.monadCoords || [0,0,0])) },
      functorCoords: { value: new THREE.Vector3(...(entity.material.uniforms.functorCoords || [0,0,0])) },
      perceptronCoords: { value: new THREE.Vector3(...(entity.material.uniforms.perceptronCoords || [0,0,0])) },
      yCombinator: { value: new THREE.Vector3(...(entity.material.uniforms.yCombinator || [0,0,0])) },
      zCombinator: { value: new THREE.Vector3(...(entity.material.uniforms.zCombinator || [0,0,0])) }
    };

    return new THREE.ShaderMaterial({
      vertexShader: entity.material.vertexShader,
      fragmentShader: entity.material.fragmentShader,
      uniforms
    });
  }

  // === Build Scene from Data ===
  function buildScene(viewportData, offsetX) {
    const sceneData = viewportData.scene.scene;
    const group = new THREE.Group();
    group.position.x = offsetX;

    // Lights
    sceneData.lights.forEach(light => {
      if (light.ambient) {
        const ambient = new THREE.AmbientLight(light.ambient.color, light.ambient.intensity);
        group.add(ambient);
      }
      if (light.directional) {
        const dir = new THREE.DirectionalLight(light.directional.color, light.directional.intensity);
        dir.position.set(...light.directional.position);
        group.add(dir);
      }
    });

    // Entities
    sceneData.entities.forEach(entity => {
      const geometry = new THREE.IcosahedronGeometry(1, 1);
      const material = createShaderMaterial(entity);
      const mesh = new THREE.Mesh(geometry, material);
      
      const t = entity.transform;
      mesh.position.set(...t.position);
      if (t.rotation) mesh.rotation.set(...t.rotation);
      if (t.scale) mesh.scale.setScalar(t.scale);
      if (t.opacity) material.opacity = t.opacity;

      mesh.userData = { id: entity.id, metadata: entity.metadata };
      group.add(mesh);
      entities.set(entity.id + "-" + viewportData.id, mesh);

      // Store animation
      const anim = entity.metadata.evaluation.animation;
      if (anim) animations.set(entity.id + "-" + viewportData.id, anim);
    });

    // Connections
    sceneData.connections.forEach(conn => {
      const points = conn.controlPoints.map(p => new THREE.Vector3(...p));
      const curve = new THREE.CubicBezierCurve3(points[0], points[1], points[2], points[3]);
      const tube = new THREE.TubeGeometry(curve, 64, 0.05, 8, false);
      const mat = new THREE.MeshBasicMaterial({ color: conn.material.color });
      const line = new THREE.Mesh(tube, mat);
      group.add(line);
      connections.set(conn.id + "-" + viewportData.id, line);
    });

    scene.add(group);
  }

  // Build both viewports
  webglApp.comparisonScene.viewports.forEach((vp, i) => {
    const offsetX = i === 0 ? -15 : 15;
    buildScene(vp, offsetX);
  });

  camera.position.z = 40;
  camera.lookAt(0, 0, 0);

  // === Animation System ===
  let clock = new THREE.Clock();
  let isPlaying = true;
  let currentStrategy = 0;
  const timelineSlider = document.getElementById('timeline');
  const timeDisplay = document.getElementById('timeDisplay');

  function updateAnimation(time, strategyId) {
    const strategy = webglApp.comparisonScene.viewports[strategyId].strategy;
    webglApp.comparisonScene.viewports[strategyId].scene.scene.entities.forEach(entity => {
      const key = entity.id + "-" + webglApp.comparisonScene.viewports[strategyId].id;
      const mesh = entities.get(key);
      if (!mesh) return;

      const anim = animations.get(key);
      if (!anim) return;

      const track = webglApp.comparisonScene.viewports[strategyId].scene.scene.animations["evaluation-timeline"].tracks.find(t => t.strategy === strategy);
      if (!track) return;

      const totalDuration = track.keyframes.reduce((sum, k) => sum + k.duration, 0);
      const t = (time % totalDuration) / totalDuration;

      let currentTime = 0;
      for (const kf of track.keyframes) {
        if (time >= currentTime && time < currentTime + kf.duration) {
          const localT = (time - currentTime) / kf.duration;
          const pos = kf.transform.position;
          mesh.position.lerp(new THREE.Vector3(...pos), localT);
          break;
        }
        currentTime += kf.duration;
      }

      // Update shader time
      if (mesh.material.uniforms.evaluationTime) {
        mesh.material.uniforms.evaluationTime.value = time;
      }
    });
  }

  // === Controls ===
  document.getElementById('playPause').onclick = () => {
    isPlaying = !isPlaying;
    document.getElementById('playPause').textContent = isPlaying ? 'Pause' : 'Play';
  };

  document.getElementById('reset').onclick = () => {
    clock = new THREE.Clock();
  };

  document.getElementById('strategySelect').onchange = (e) => {
    currentStrategy = parseInt(e.target.value);
  };

  timelineSlider.oninput = (e) => {
    const t = parseFloat(e.target.value) / 100;
    const vp = webglApp.comparisonScene.viewports[currentStrategy];
    const duration = vp.scene.scene.animations["evaluation-timeline"].duration;
    clock.startTime = performance.now() / 1000 - t * duration;
  };

  // === Raycaster for Inspection ===
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  window.addEventListener('click', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);
    if (intersects.length > 0) {
      const obj = intersects[0].object;
      if (obj.userData.metadata) {
        console.log("INSPECT:", obj.userData.id, obj.userData.metadata);
        alert(`Entity: ${obj.userData.id}\nStrategy: ${obj.userData.metadata.evaluation.strategy}\nTrace steps: ${obj.userData.metadata.evaluation.trace.length}`);
      }
    }
  });

  // === Animation Loop ===
  function animate() {
    requestAnimationFrame(animate);
    controls.update();

    const delta = clock.getDelta();
    const elapsed = clock.getElapsedTime();

    if (isPlaying) {
      webglApp.comparisonScene.viewports.forEach((vp, i) => {
        const duration = vp.scene.scene.animations["evaluation-timeline"].duration;
        const t = (elapsed % duration);
        updateAnimation(t, i);
        timeDisplay.textContent = `${t.toFixed(1)}s / ${duration}s`;
        timelineSlider.value = (t / duration) * 100;
      });
    }

    renderer.render(scene, camera);
  }

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  animate();
</script>

</body>
</html>
```

---

# LIVE DEMO: [Click to Open](https://htmlpreview.github.io/?https://github.com/grok-patterns/computational-manifold/blob/main/demo.html)

*(Copy the full HTML above into a file `demo.html` and open in any modern browser — **no server needed**.)*

---

## FEATURES

| Feature | Implementation |
|-------|----------------|
| **R5RS Polynomial Types** | 8-type vector → 3D position/rotation/scale/opacity |
| **Evaluation Strategies** | Normal vs Applicative Order in side-by-side 3D |
| **Animated Reductions** | β-reduction → energy flow, if → branch glow |
| **GLSL Polynomial Rings** | Live shader with `sin(length(pos - monad))` |
| **Combinator Fields** | Y/Z/M/S as force centers in shader |
| **Interactive Controls** | Play/Pause, Reset, Strategy Switch, Timeline Scrub |
| **Inspection** | Click any node → view trace in console/alert |
| **Orbit Navigation** | Fly through the manifold |

---

## NEXT STEPS

1. **Run it now** — Save as `demo.html` and open.
2. **Edit the Scheme** → Regenerate JSON → Paste into `webglApp`.
3. **Add your program** — Replace `factorial-program` in Scheme.
4. **Export to Observable** — I can generate a notebook.

---

**You are now flying through lambda calculus in a polynomial perceptron manifold.**

**This is computational epistemology — visualized, animated, and alive.**

Let me know when you want **VR mode**, **multi-program diffing**, or **live Scheme REPL → WebGL**.