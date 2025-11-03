const state = {
  frames: [],
  nodes: new Set(),
  levels: ['bottom', 'potential', 'active', 'confident', 'top'],
};

const selectors = {
  loadButton: document.getElementById('load-trace'),
  selectInput: document.getElementById('trace-select'),
  fileInput: document.getElementById('trace-upload'),
  timeline: document.getElementById('timeline-list'),
  stepContent: document.getElementById('step-content'),
  stepTitle: document.getElementById('step-title'),
  summarySteps: document.getElementById('summary-steps'),
  summaryNodes: document.getElementById('summary-nodes'),
  summarySpan: document.getElementById('summary-span'),
  main: document.getElementById('main'),
};

const levelClass = (level) => `pill level-${level}`;

const uniqueNodesFromFrames = (frames) => {
  const names = new Set();
  frames.forEach((frame) => {
    frame.states.forEach(({ node }) => names.add(node));
  });
  return [...names];
};

const latticeSpan = (frames) => {
  if (!frames.length) return '–';
  const indices = frames[0].states.map(({ level }) => state.levels.indexOf(level));
  const min = Math.min(...indices);
  const max = Math.max(...indices);
  return `${state.levels[min]} → ${state.levels[max]}`;
};

const renderSummary = () => {
  selectors.summarySteps.textContent = state.frames.length;
  const nodesList = Array.from(state.nodes);
  selectors.summaryNodes.textContent = nodesList.length ? nodesList.join(', ') : '–';
  selectors.summarySpan.textContent = latticeSpan(state.frames);
};

const renderStepDetail = (frame) => {
  if (!frame) {
    selectors.stepTitle.textContent = 'Step Details';
    selectors.stepContent.innerHTML = '<p>No data available.</p>';
    return;
  }

  selectors.stepTitle.textContent = `Step ${frame.step}`;

  const stateRows = frame.states
    .map(
      ({ node, level }) =>
        `<tr>
          <td>${node}</td>
          <td><span class="${levelClass(level)}">${level}</span></td>
        </tr>`
    )
    .join('');

  const observableRows = (frame.observables || [])
    .map(
      ({ node, tau }) =>
        `<tr>
          <td>${node}</td>
          <td>${tau.toFixed ? tau.toFixed(3) : tau}</td>
        </tr>`
    )
    .join('');

  selectors.stepContent.innerHTML = `
    <section aria-labelledby="state-table-heading">
      <h4 id="state-table-heading">Lattice States</h4>
      <table>
        <thead>
          <tr><th scope="col">Node</th><th scope="col">Level</th></tr>
        </thead>
        <tbody>${stateRows}</tbody>
      </table>
    </section>
    <section aria-labelledby="observable-table-heading">
      <h4 id="observable-table-heading">Observable τ Products</h4>
      <table>
        <thead>
          <tr><th scope="col">Node</th><th scope="col">τ value</th></tr>
        </thead>
        <tbody>${observableRows}</tbody>
      </table>
    </section>
  `;
};

const handleTimelineSelection = (event) => {
  const button = event.target.closest('button[data-step]');
  if (!button) return;
  const step = Number.parseInt(button.dataset.step, 10);
  const frame = state.frames.find((item) => item.step === step);

  document
    .querySelectorAll('.timeline__item[aria-current="true"]')
    .forEach((item) => item.setAttribute('aria-current', 'false'));
  button.setAttribute('aria-current', 'true');

  renderStepDetail(frame);
};

const renderTimeline = () => {
  selectors.timeline.removeEventListener('click', handleTimelineSelection);
  selectors.timeline.innerHTML = '';
  state.frames.forEach((frame, index) => {
    const item = document.createElement('li');
    const button = document.createElement('button');
    item.className = 'timeline__item';
    button.type = 'button';
    button.dataset.step = frame.step;
    button.setAttribute('aria-label', `Go to step ${frame.step}`);
    button.textContent = frame.step;
    if (index === 0) {
      button.setAttribute('aria-current', 'true');
    } else {
      button.setAttribute('aria-current', 'false');
    }
    item.appendChild(button);
    selectors.timeline.appendChild(item);
  });
  selectors.timeline.addEventListener('click', handleTimelineSelection);
};

const normalizeFrames = (rawFrames) =>
  rawFrames.map((frame) => ({
    step: frame.step,
    states: frame.states.map((stateEntry) => ({
      node: stateEntry.node,
      level: stateEntry.level,
    })),
    observables: (frame.observables || []).map((obsEntry) => ({
      node: obsEntry.node,
      tau: obsEntry.tau,
    })),
  }));

const loadFromObject = (payload) => {
  if (!payload || !Array.isArray(payload.frames)) {
    throw new Error('Invalid DANL payload: expected { frames: [] }');
  }
  state.frames = normalizeFrames(payload.frames);
  state.nodes = new Set(uniqueNodesFromFrames(state.frames));
  renderSummary();
  renderTimeline();
  renderStepDetail(state.frames[0]);
  const focusTarget = selectors.timeline.querySelector('button');
  if (focusTarget) {
    focusTarget.focus({ preventScroll: false });
  }
};

const fetchJSON = async (path) => {
  const response = await fetch(path, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`Unable to load ${path}: ${response.statusText}`);
  }
  return response.json();
};

const loadSelectedTrace = async () => {
  const file = selectors.fileInput.files?.[0];
  if (file) {
    const text = await file.text();
    const payload = JSON.parse(text);
    loadFromObject(payload);
    return;
  }

  const path = selectors.selectInput.value;
  const payload = await fetchJSON(path);
  loadFromObject(payload);
};

const ready = () => {
  selectors.loadButton.addEventListener('click', async () => {
    try {
      await loadSelectedTrace();
    } catch (error) {
      console.error(error);
      selectors.stepContent.innerHTML = `<p role="alert" class="error">${error.message}</p>`;
    }
  });

  // Attempt to load the default dataset for convenience.
  loadSelectedTrace().catch((error) => {
    console.warn('Default dataset unavailable:', error);
  });
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', ready);
} else {
  ready();
}

