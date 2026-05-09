/* ═══════════════════════════════════════════════
   Fox · Goose · Beans — PURBA AI Edition
   Script: fgb.js
═══════════════════════════════════════════════ */

/* ─────────────────────────────────────────
   1. CUSTOM CURSOR
───────────────────────────────────────── */
const curDot  = document.getElementById('cur-dot');
const curRing = document.getElementById('cur-ring');
let mx = 0, my = 0, rx = 0, ry = 0;

document.addEventListener('mousemove', e => {
  mx = e.clientX; my = e.clientY;
  curDot.style.left = mx + 'px';
  curDot.style.top  = my + 'px';
});

(function animCurRing() {
  rx += (mx - rx) * 0.11;
  ry += (my - ry) * 0.11;
  curRing.style.left = rx + 'px';
  curRing.style.top  = ry + 'px';
  requestAnimationFrame(animCurRing);
})();

function addHoverCursor(selector) {
  document.querySelectorAll(selector).forEach(el => {
    el.addEventListener('mouseenter', () => curRing.classList.add('hover'));
    el.addEventListener('mouseleave', () => curRing.classList.remove('hover'));
  });
}
addHoverCursor('a,button,.ent-chip,.act-chip,.s-node,.a-tab,.code-tab-btn,.csub-btn,.purba-hint-chip,.copy-btn,.l-btn');


/* ─────────────────────────────────────────
   2. PARTICLE CANVAS
───────────────────────────────────────── */
const bgC = document.getElementById('bg-canvas');
const ctx  = bgC.getContext('2d');
let W = bgC.width  = window.innerWidth;
let H = bgC.height = window.innerHeight;

window.addEventListener('resize', () => {
  W = bgC.width  = window.innerWidth;
  H = bgC.height = window.innerHeight;
});

class Particle {
  constructor() { this.reset(); }
  reset() {
    this.x  = Math.random() * W;
    this.y  = Math.random() * H;
    this.vx = (Math.random() - 0.5) * 0.28;
    this.vy = (Math.random() - 0.5) * 0.28;
    this.r  = Math.random() * 1.4 + 0.4;
    this.a  = Math.random() * 0.45 + 0.08;
    this.h  = [270, 190, 320, 215][Math.floor(Math.random() * 4)];
  }
  update() {
    const dx = mx - this.x, dy = my - this.y;
    const d  = Math.sqrt(dx * dx + dy * dy);
    if (d < 130) { this.vx -= (dx / d) * 0.035; this.vy -= (dy / d) * 0.035; }
    this.vx *= 0.98; this.vy *= 0.98;
    this.x  += this.vx; this.y  += this.vy;
    if (this.x < 0 || this.x > W || this.y < 0 || this.y > H) this.reset();
  }
  draw() {
    ctx.beginPath(); ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fillStyle = `hsla(${this.h},100%,70%,${this.a})`; ctx.fill();
  }
}

const PTCLS = Array.from({ length: 130 }, () => new Particle());

(function drawBg() {
  ctx.clearRect(0, 0, W, H);
  // Ambient glows
  [
    [W * .2, H * .25, W * .38, '147,51,234'],
    [W * .78, H * .72, W * .32, '6,182,212'],
    [W * .5,  H * .5,  W * .2,  '236,72,153']
  ].forEach(([x, y, r, c]) => {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, `rgba(${c},.04)`); g.addColorStop(1, 'transparent');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  });
  // Cursor glow
  const gc = ctx.createRadialGradient(mx, my, 0, mx, my, 140);
  gc.addColorStop(0, 'rgba(147,51,234,.06)'); gc.addColorStop(1, 'transparent');
  ctx.fillStyle = gc; ctx.fillRect(0, 0, W, H);
  // Particles
  PTCLS.forEach(p => { p.update(); p.draw(); });
  // Connections
  for (let i = 0; i < PTCLS.length; i++) {
    for (let j = i + 1; j < PTCLS.length; j++) {
      const dx = PTCLS[i].x - PTCLS[j].x, dy = PTCLS[i].y - PTCLS[j].y;
      const d  = Math.sqrt(dx * dx + dy * dy);
      if (d < 75) {
        ctx.beginPath(); ctx.moveTo(PTCLS[i].x, PTCLS[i].y); ctx.lineTo(PTCLS[j].x, PTCLS[j].y);
        ctx.strokeStyle = `rgba(147,51,234,${.05 * (1 - d / 75)})`; ctx.lineWidth = .5; ctx.stroke();
      }
    }
  }
  requestAnimationFrame(drawBg);
})();


/* ─────────────────────────────────────────
   3. SCROLL REVEAL
───────────────────────────────────────── */
const revObs = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) setTimeout(() => e.target.classList.add('visible'), 80); });
}, { threshold: 0.1 });
document.querySelectorAll('.reveal').forEach(el => revObs.observe(el));


/* ─────────────────────────────────────────
   4. STATE SOLUTION TRACK
───────────────────────────────────────── */
const solPath = [
  { f:'L', x:'L', g:'L', b:'L', move:'START'         },
  { f:'R', x:'L', g:'R', b:'L', move:'Take Goose →'  },
  { f:'L', x:'L', g:'R', b:'L', move:'Return ←'      },
  { f:'R', x:'R', g:'R', b:'L', move:'Take Fox →'    },
  { f:'L', x:'R', g:'L', b:'L', move:'Bring Goose ←' },
  { f:'R', x:'R', g:'L', b:'R', move:'Take Beans →'  },
  { f:'L', x:'R', g:'L', b:'R', move:'Return ←'      },
  { f:'R', x:'R', g:'R', b:'R', move:'Take Goose →'  },
];

(function buildChain() {
  const chain = document.getElementById('state-chain');
  const emap  = { f: '🚣', x: '🦊', g: '🪿', b: '🌱' };
  solPath.forEach((s, i) => {
    if (i > 0) { const a = document.createElement('div'); a.className = 's-arr'; a.textContent = '→'; chain.appendChild(a); }
    const n = document.createElement('div');
    n.className = 's-node' + (i === 0 ? ' on' : '');
    const L = [], R = [];
    ['f','x','g','b'].forEach(k => (s[k] === 'L' ? L : R).push(emap[k]));
    const ico = i === 0 ? '🏁' : i === solPath.length - 1 ? '🏆' : '📍';
    n.innerHTML = `<div class="sne">${ico}</div><div class="snc">S${i}<br>${L.join('')}|${R.join('')}</div><div class="snm">${s.move}</div>`;
    n.onclick = () => { document.querySelectorAll('.s-node').forEach(x => x.classList.remove('on')); n.classList.add('on'); };
    chain.appendChild(n);
  });
})();


/* ─────────────────────────────────────────
   5. ALGORITHM CANVAS
───────────────────────────────────────── */
const aCanvas = document.getElementById('algo-canvas');
const aC      = aCanvas.getContext('2d');
let curAlgo   = 'bfs';

const aData = {
  bfs: {
    states: 11, path: '7 steps', complexity: 'O(b^d)', color: '#06b6d4',
    desc: 'BFS uses a FIFO queue to explore states level-by-level, guaranteeing the shortest path. Complete & optimal — explores 11 states, finds the 7-step solution.',
    nodes: [
      {x:.5, y:.07, l:'S0\nSTART',   o:true,  v:true },
      {x:.25,y:.21, l:'S1\nGoose→',  o:true,  v:true },
      {x:.76,y:.21, l:'X\nFox→',     o:false, v:false},
      {x:.1, y:.38, l:'S2\nReturn',  o:true,  v:true },
      {x:.4, y:.38, l:'Dead\nFox+G', o:false, v:false},
      {x:.63,y:.38, l:'Dead\nG+B',   o:false, v:false},
      {x:.88,y:.38, l:'Dead\nFox+G', o:false, v:false},
      {x:.1, y:.55, l:'S3\nFox→',    o:true,  v:true },
      {x:.26,y:.55, l:'S3b\nBeans→', o:false, v:true },
      {x:.1, y:.72, l:'S4\nGoose←',  o:true,  v:true },
      {x:.1, y:.88, l:'GOAL\n🏆',    o:true,  v:true },
    ],
    edges:[[0,1],[0,2],[1,3],[1,4],[2,5],[2,6],[3,7],[3,8],[7,9],[9,10]],
  },
  dfs: {
    states: 18, path: '7 steps', complexity: 'O(b^m)', color: '#a855f7',
    desc: 'DFS uses a LIFO stack, diving deep before backtracking. Not guaranteed optimal — may explore ~18 states and requires a visited-set to prevent cycles.',
    nodes: [
      {x:.5, y:.07, l:'S0\nSTART',    o:true,  v:true },
      {x:.5, y:.21, l:'Fox→\nDead',   o:false, v:false},
      {x:.21,y:.21, l:'S1\nGoose→',   o:true,  v:true },
      {x:.17,y:.36, l:'S2\nReturn',   o:true,  v:true },
      {x:.13,y:.51, l:'S3\nFox→',     o:true,  v:true },
      {x:.09,y:.65, l:'S4\nGoose←',   o:true,  v:true },
      {x:.07,y:.79, l:'S5\nBeans→',   o:true,  v:true },
      {x:.07,y:.92, l:'GOAL\n🏆',     o:true,  v:true },
      {x:.34,y:.51, l:'Back\ntrack',  o:false, v:false},
      {x:.76,y:.21, l:'Dead\nBranch', o:false, v:false},
      {x:.76,y:.36, l:'Dead\nBranch', o:false, v:false},
    ],
    edges:[[0,1],[0,2],[0,9],[2,3],[3,4],[3,8],[4,5],[5,6],[6,7],[9,10]],
  },
  astar: {
    states: 8, path: '7 steps', complexity: 'O(b^d) best', color: '#f59e0b',
    desc: 'A* uses f(n)=g(n)+h(n). With h(n)=entities not on right bank, it explores only 8 states — 27% more efficient than BFS. Best of optimality + speed.',
    nodes: [
      {x:.5, y:.07, l:'S0 h=4\nSTART',  o:true,  v:true },
      {x:.5, y:.22, l:'S1 h=2\nGoose→', o:true,  v:true },
      {x:.5, y:.38, l:'S2 h=3\nReturn', o:true,  v:true },
      {x:.5, y:.53, l:'S3 h=1\nFox→',   o:true,  v:true },
      {x:.5, y:.67, l:'S4 h=2\nGoose←', o:true,  v:true },
      {x:.5, y:.80, l:'S5 h=1\nBeans→', o:true,  v:true },
      {x:.5, y:.92, l:'GOAL h=0\n🏆',   o:true,  v:true },
      {x:.83,y:.38, l:'Pruned\nX',       o:false, v:false},
    ],
    edges:[[0,1],[1,2],[2,3],[2,7],[3,4],[4,5],[5,6]],
  },
};

function drawAlgo(algo) {
  const d = aData[algo];
  const AW = aCanvas.width, AH = aCanvas.height;
  aC.clearRect(0, 0, AW, AH);

  d.edges.forEach(([a, b]) => {
    const na = d.nodes[a], nb = d.nodes[b]; const opt = na.o && nb.o;
    aC.beginPath(); aC.moveTo(na.x * AW, na.y * AH); aC.lineTo(nb.x * AW, nb.y * AH);
    aC.strokeStyle = opt ? d.color + 'bb' : 'rgba(255,255,255,0.09)';
    aC.lineWidth   = opt ? 2 : 1;
    if (!opt) aC.setLineDash([4, 4]); aC.stroke(); aC.setLineDash([]);
  });

  d.nodes.forEach(n => {
    const x = n.x * AW, y = n.y * AH, r = n.o ? 21 : 14;
    aC.shadowColor = n.o ? d.color : 'transparent'; aC.shadowBlur = n.o ? 14 : 0;
    aC.beginPath(); aC.arc(x, y, r, 0, Math.PI * 2);
    if (n.o) { const g = aC.createRadialGradient(x,y,0,x,y,r); g.addColorStop(0,d.color+'44'); g.addColorStop(1,d.color+'12'); aC.fillStyle = g; }
    else aC.fillStyle = n.v ? 'rgba(255,255,255,.04)' : 'rgba(239,68,68,.14)';
    aC.fill(); aC.shadowBlur = 0;
    aC.beginPath(); aC.arc(x, y, r, 0, Math.PI * 2);
    aC.strokeStyle = n.o ? d.color : (n.v ? 'rgba(255,255,255,.12)' : '#ef4444'); aC.lineWidth = n.o ? 1.5 : 1; aC.stroke();
    const lines = n.l.split('\n');
    aC.fillStyle = n.o ? d.color : (n.v ? 'rgba(255,255,255,.25)' : '#ef444477');
    aC.font = `${n.o ? '600' : '400'} 9px "Fira Code"`; aC.textAlign = 'center';
    lines.forEach((ln, i) => aC.fillText(ln, x, y + (i - (lines.length - 1) / 2) * 11));
  });

  aC.font = '500 9.5px "Fira Code"'; aC.textAlign = 'left';
  aC.fillStyle = d.color;  aC.fillText('● Optimal path', 8, AH - 26);
  aC.fillStyle = '#ef4444'; aC.fillText('● Dead end / Pruned', 8, AH - 12);
}

function switchAlgo(algo, btn) {
  curAlgo = algo;
  document.querySelectorAll('.a-tab').forEach(t => t.className = 'a-tab');
  btn.classList.add(`ac-${algo}`);
  const d = aData[algo];
  document.getElementById('stat-states').textContent    = d.states;
  document.getElementById('stat-path').textContent      = d.path;
  document.getElementById('stat-cmplx').textContent     = d.complexity;
  document.getElementById('algo-desc-text').textContent = d.desc;
  drawAlgo(algo);
}

drawAlgo('bfs');
window.addEventListener('resize', () => { aCanvas.width = aCanvas.parentElement.clientWidth - 48; drawAlgo(curAlgo); });
setTimeout(() => { aCanvas.width = (aCanvas.parentElement?.clientWidth - 48) || 460; drawAlgo(curAlgo); }, 120);


/* ─────────────────────────────────────────
   6. CODE SECTION — TAB SWITCHING
───────────────────────────────────────── */
function switchCodeTab(type, btn) {
  document.querySelectorAll('.code-tab-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.querySelectorAll('.code-area').forEach(a => a.classList.remove('visible'));
  document.getElementById(`code-${type}`).classList.add('visible');
}

function switchCodeSub(section, algoType, btn) {
  const siblings = btn.closest('.code-sub-tabs').querySelectorAll('.csub-btn');
  siblings.forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const area = btn.closest('.code-area');
  area.querySelectorAll('.editor-wrap, .pseudo-card').forEach(e => e.style.display = 'none');
  area.querySelectorAll(`[data-algo="${algoType}"]`).forEach(e => e.style.display = 'block');
}

// Copy code to clipboard
function copyCode(btn, codeId) {
  const pre = document.getElementById(codeId);
  const text = pre.innerText;
  navigator.clipboard.writeText(text).then(() => {
    btn.textContent = '✓ Copied!';
    btn.classList.add('copied');
    setTimeout(() => { btn.textContent = 'Copy'; btn.classList.remove('copied'); }, 2200);
  }).catch(() => {
    btn.textContent = 'Error';
    setTimeout(() => { btn.textContent = 'Copy'; }, 1500);
  });
}


/* ─────────────────────────────────────────
   7. SIMULATION ENGINE
───────────────────────────────────────── */
const NAMES      = ['farmer','fox','goose','beans'];
const EMOJI_MAP  = { farmer:'🚣', fox:'🦊', goose:'🪿', beans:'🌱' };
const LABEL_MAP  = { farmer:'Farmer', fox:'Fox', goose:'Goose', beans:'Beans' };
const BFS_SOL    = [2, -1, 1, 2, 3, -1, 2];

let simState  = [0,0,0,0];
let simHist   = [];
let simMoves  = 0;
let simAutoIdx= 0;

function isStateValid(st) {
  const f = st[0];
  if (st[1] === st[2] && st[1] !== f) return false;
  if (st[2] === st[3] && st[2] !== f) return false;
  return true;
}

function applySimMove(pass) {
  const ns = [...simState], dest = 1 - ns[0];
  ns[0] = dest;
  if (pass > 0) ns[pass] = dest;
  return ns;
}

function renderSim() {
  const L = NAMES.filter((_, i) => simState[i] === 0 && i > 0);
  const R = NAMES.filter((_, i) => simState[i] === 1 && i > 0);
  ['left-ents','right-ents'].forEach((id, side) => {
    const el = document.getElementById(id); el.innerHTML = '';
    (side === 0 ? L : R).forEach(n => {
      const chip = document.createElement('div'); chip.className = 'ent-chip';
      chip.innerHTML = `${EMOJI_MAP[n]}<span class="cl">${LABEL_MAP[n]}</span>`;
      el.appendChild(chip);
    });
  });
  const bi = document.getElementById('boat-ico');
  bi.className = 'boat-ico ' + (simState[0] === 0 ? 'gl' : 'gr');
  document.getElementById('boat-lbl').textContent = simState[0] === 0 ? 'AT LEFT BANK' : 'AT RIGHT BANK';
  document.getElementById('sim-move-cnt').textContent = simMoves;
  if (simState.every(s => s === 1)) {
    setStatus('win', '🏆 All entities safely crossed! BFS optimal path completed in 7 moves!');
    document.getElementById('act-btns').innerHTML = ''; return;
  }
  buildSimActions();
}

function buildSimActions() {
  const cont = document.getElementById('act-btns'); cont.innerHTML = '';
  const side = simState[0], sideL = side === 0 ? 'Right' : 'Left';
  const alone = document.createElement('button'); alone.className = 'act-chip';
  alone.innerHTML = `🚣 Cross Alone → ${sideL}`;
  alone.onclick = () => doSimMove(-1, 'Farmer crossed alone');
  cont.appendChild(alone);
  ['fox','goose','beans'].forEach((n, i) => {
    const idx = i + 1;
    if (simState[idx] !== side) return;
    const btn = document.createElement('button'); btn.className = 'act-chip';
    const ns = applySimMove(idx);
    if (!isStateValid(ns)) btn.style.borderColor = 'rgba(239,68,68,.35)';
    btn.innerHTML = `${EMOJI_MAP[n]} Take ${LABEL_MAP[n]} → ${sideL}`;
    btn.onclick   = () => doSimMove(idx, `Took ${LABEL_MAP[n]} to ${sideL} bank`);
    cont.appendChild(btn);
  });
}

function doSimMove(pass, desc) {
  const ns = applySimMove(pass);
  if (!isStateValid(ns)) {
    const why = (ns[1] === ns[2] && ns[1] !== ns[0]) ? 'fox would eat the goose' : 'goose would eat the beans';
    setStatus('invalid', `⚠ Invalid! The ${why}. Try a different move.`); return;
  }
  simHist.push([...simState]); simState = ns; simMoves++;
  setStatus('valid', '✓ Valid move — state updated!');
  appendLog(`Move ${simMoves}: ${desc}`);
  renderSim();
}

function undoSimMove() {
  if (!simHist.length) return;
  simState = simHist.pop(); simMoves = Math.max(0, simMoves - 1);
  setStatus('info', '↩ Move undone. State restored.');
  const log = document.getElementById('sim-log');
  const ents = log.querySelectorAll('.m-entry');
  if (ents.length) ents[ents.length - 1].remove();
  renderSim();
}

function resetSim() {
  simState = [0,0,0,0]; simHist = []; simMoves = 0; simAutoIdx = 0;
  document.getElementById('sim-log').innerHTML = '<div style="color:var(--text-dim)">// Move log will appear here...</div>';
  setStatus('info', '🤖 Select an action below. You can also ask PURBA for hints!');
  renderSim();
}

function aiSimStep() {
  if (simAutoIdx >= BFS_SOL.length) { simAutoIdx = 0; resetSim(); return; }
  const pass  = BFS_SOL[simAutoIdx];
  const sideL = simState[0] === 0 ? 'Right' : 'Left';
  const desc  = pass === -1 ? 'AI: Farmer crossed alone' : `AI: Took ${LABEL_MAP[NAMES[pass]]} to ${sideL} bank`;
  doSimMove(pass, desc); simAutoIdx++;
  if (simState.every(s => s === 1)) {
    simAutoIdx = 0;
    setStatus('win', '🏆 AI solved via BFS optimal path in 7 steps!');
  } else {
    setStatus('info', `🤖 AI Step ${simAutoIdx}/${BFS_SOL.length}: ${desc}`);
  }
}

function setSimMode(mode, btn) {
  document.querySelectorAll('.sim-mode-btn').forEach(b => b.classList.remove('on')); btn.classList.add('on');
  setStatus('info', mode === 'auto' ? '🤖 AI Mode: Press "AI Next Step" to watch BFS solve.' : '👤 Manual Mode: Select moves below.');
}

function setStatus(type, msg) {
  const el = document.getElementById('sim-status'); el.className = `st-bar ${type}`; el.textContent = msg;
}

function appendLog(msg) {
  const log = document.getElementById('sim-log');
  const e   = document.createElement('div'); e.className = 'm-entry'; e.textContent = msg;
  log.appendChild(e); log.scrollTop = log.scrollHeight;
}

renderSim();


/* ─────────────────────────────────────────
   8. ANIMATED COUNTERS + BARS
───────────────────────────────────────── */
function animCount(el, target, dur = 1600) {
  let s = 0, step = target / (dur / 16);
  const id = setInterval(() => {
    s += step;
    if (s >= target) { s = target; clearInterval(id); }
    el.textContent = Math.round(s);
  }, 16);
}

const insObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    animCount(document.getElementById('cnt-states'),  16);
    animCount(document.getElementById('cnt-valid'),   10);
    animCount(document.getElementById('cnt-optimal'),  7);
    setTimeout(() => {
      document.getElementById('bar-bfs').style.width   = '61%';
      document.getElementById('bar-dfs').style.width   = '100%';
      document.getElementById('bar-astar').style.width = '44%';
    }, 350);
    insObs.disconnect();
  });
}, { threshold: 0.25 });
insObs.observe(document.getElementById('insights'));


/* ─────────────────────────────────────────
   9. LEARNING MODE
───────────────────────────────────────── */
const learnDB = {
  beginner: [
    { n:'01', t:'The Setup',             d:'A farmer must carry a fox 🦊, goose 🪿, and beans 🌱 across a river. The boat can carry only one item at a time alongside the farmer.' },
    { n:'02', t:'Start with the Goose',  d:'The goose is the "pivot" — it threatens beans and is threatened by the fox. Always move the goose first and last. This is the critical insight!' },
    { n:'03', t:'Think in States',       d:'A "state" = who is on which bank. 2⁴ = 16 total states, only 10 valid. BFS finds a path from [All Left] → [All Right] safely.' },
    { n:'04', t:'BFS = Shortest Path',   d:'BFS is like ripples in water — spreading outward level by level. It always finds the shortest route, which is 7 steps here.' },
    { n:'05', t:'Fox + Beans = Safe',    d:'The fox ignores beans! When bringing the goose back, leave fox & beans — they coexist peacefully. This unlocks the 7-step solution.' },
    { n:'06', t:'The 7-Step Solution',   d:'Goose → Return → Fox → Bring Goose ← → Beans → Return → Goose. Follow this and all 7 crossings are conflict-free!' },
  ],
  advanced: [
    { n:'01', t:'State Formalization',   d:'State S = {F,X,G,B} ∈ {L,R}⁴. |S| = 16. Invalid: {X=G ∧ X≠F} ∪ {G=B ∧ G≠F}. Valid = 10. Goal: S=[R,R,R,R].' },
    { n:'02', t:'BFS Proof of Optimality',d:'BFS maintains FIFO queue; edge cost = 1. By BFS layer invariant, first reach of state s at depth d proves no shorter path exists. T(n) = O(b^d).' },
    { n:'03', t:'DFS Space Advantage',   d:'DFS uses O(b·m) space vs BFS O(b^d). For this puzzle m=d=7, so comparable — but DFS is NOT optimal and may visit up to 18 states.' },
    { n:'04', t:'A* Admissible Heuristic',d:'h(n) = |entities not on right bank| is admissible since each needs ≥1 trip. A* with this h explores only 8 states — 27% fewer than BFS.' },
    { n:'05', t:'CSP Formulation',        d:'Binary CSP: variables = positions ∈ {L,R}; constraints = Fox≠Goose when Farmer≠Fox, Goose≠Beans when Farmer≠Goose. Arc consistency prunes 6 states.' },
    { n:'06', t:'Graph Symmetry',         d:'The valid state graph has exactly 2 symmetric optimal solutions (swap fox↔beans). Bidirectional BFS would meet at depth 3-4, halving explored states.' },
  ],
};

function setLearnMode(mode, btn) {
  document.querySelectorAll('.l-btn').forEach(b => b.classList.remove('on')); btn.classList.add('on');
  const grid = document.getElementById('hints-grid'); grid.innerHTML = '';
  learnDB[mode].forEach(h => {
    const c = document.createElement('div'); c.className = 'hint-card';
    c.innerHTML = `<div class="hn">${h.n}</div><div><div class="ht">${h.t}</div><div class="hd">${h.d}</div></div>`;
    grid.appendChild(c);
  });
}
setLearnMode('beginner', document.querySelector('.l-btn.on'));


/* ─────────────────────────────────────────
   10. PURBA AI CHATBOT
───────────────────────────────────────── */
const PURBA_DB = {
  'hello|hi|hey|greet|namaste': [
    "Hello! I'm PURBA 🤖 — your AI guide for the Fox, Goose & Beans puzzle! I can explain BFS, DFS, A*, the puzzle rules, Java code, and more. What would you like to explore?",
    "Hey there! PURBA here 👋 Ready to dive into state-space search? Ask me anything about BFS, DFS, the puzzle, or the Java code!",
  ],
  'bfs|breadth.first|breadth first|queue|fifo': [
    "BFS (Breadth-First Search) explores states level by level using a FIFO queue. For this puzzle:\n• Explores 11 states\n• Finds the 7-step optimal solution\n• Time: O(b^d), Space: O(b^d)\n• GUARANTEED optimal! 🎯",
    "BFS is like ripples in water — spreading outward from the start state. It checks all depth-1 states, then depth-2, etc. Since all edges cost 1, it's guaranteed to find the SHORTEST path. For our puzzle: 7 steps!",
  ],
  'dfs|depth.first|depth first|stack|lifo|recursion': [
    "DFS (Depth-First Search) dives deep before backtracking, using a LIFO stack (or recursion). For this puzzle:\n• May explore up to 18 states\n• NOT guaranteed to find shortest path\n• Time: O(b^m), Space: O(b·m)\n• Needs visited-set to avoid cycles!",
    "DFS is like exploring a maze by always going forward until you hit a dead end, then backtracking. It can miss shorter paths — for example, it might find a 9-step solution when the optimal is 7. Efficient in memory but not optimal.",
  ],
  'a\\*|astar|a star|heuristic|f\\(n\\)|g\\(n\\)': [
    "A* Search combines BFS's optimality with heuristic guidance! For our puzzle:\n• h(n) = entities NOT on right bank\n• This is admissible (never overestimates)\n• Explores only 8 states (vs BFS's 11!)\n• 27% more efficient than BFS 🚀",
    "A* uses f(n) = g(n) + h(n):\n• g(n) = cost so far (steps taken)\n• h(n) = heuristic estimate to goal\n• For our puzzle: h(n) = entities still on left bank\n• This guides search toward the goal, pruning bad paths early!",
  ],
  'rule|fox|goose|bean|puzzle|constraint|problem': [
    "The Fox-Goose-Beans Puzzle Rules:\n🦊 Fox eats Goose if left alone together\n🪿 Goose eats Beans if left alone together\n🦊+🌱 = SAFE (fox ignores beans!)\n🚣 Boat carries farmer + at most 1 item\n\nGoal: Move all from Left → Right bank!",
    "Key insight: The GOOSE is the 'dangerous' entity — it's both prey (fox) and predator (beans). The solution always starts and ends with the goose. The fox+beans combination is safe because foxes don't eat beans! 🦊🌱✅",
  ],
  'solution|solve|answer|optimal|path|7.step|seven': [
    "The 7-step optimal solution:\n1. Take Goose → Right ✅\n2. Return alone ←\n3. Take Fox → Right ✅\n4. Bring Goose ← (key move!)\n5. Take Beans → Right ✅\n6. Return alone ←\n7. Take Goose → Right 🏆\n\nBFS proves no shorter solution exists!",
    "There are actually 2 symmetric optimal solutions! You can swap step 3 (Fox) with step 5 (Beans). Both take 7 steps. BFS discovers both naturally since it explores all states at each depth level!",
  ],
  'state|space|valid|invalid|16|configuration': [
    "State Space Analysis:\n📊 Total states: 2⁴ = 16 (each entity on L or R)\n✅ Valid states: 10\n❌ Invalid states: 6 (fox+goose alone, goose+beans alone)\n🎯 Goal state: [R,R,R,R]\n🏁 Start state: [L,L,L,L]",
    "A state is encoded as [Farmer, Fox, Goose, Beans] where 0=Left, 1=Right. In binary: 0b0000 (all left) → 0b1111 (all right). The 6 invalid states are when fox=goose≠farmer OR goose=beans≠farmer.",
  ],
  'java|code|implement|class|public|static|main': [
    "The Java BFS implementation uses a Queue and a parent Map to track visited states. Each state is a 4-bit integer. Four possible moves (farmer alone + each companion) are generated via XOR bitmasks and validated before adding to the queue.",
    "The Java DFS implementation uses recursion with a visited Set for cycle detection. It tries all 4 moves at each step, and backtracks (removes the last path entry) if no valid move leads to the goal.",
  ],
  'complex|time|space|o\\(|big.o|efficient': [
    "Algorithm Complexity Comparison:\n\nBFS: Time O(b^d), Space O(b^d)\n• b≈2 (branching factor), d=7\n• Guaranteed optimal solution\n\nDFS: Time O(b^m), Space O(b·m)\n• m = max depth (can be large)\n• Not guaranteed optimal\n\nA*: O(b^d) worst case, much better avg\n• Heuristic dramatically reduces explored states",
  ],
  'hint|tip|stuck|help|how|what': [
    "💡 PURBA's Top Hints:\n1. Always move the GOOSE first — it's the key!\n2. Fox + Beans can be left alone safely\n3. Don't fear going backwards — sometimes you need to bring the goose back\n4. BFS guarantees shortest path; DFS may take longer routes\n5. Try the AI Solve button in the simulation to see it live!",
    "💡 Stuck on the puzzle? Remember:\n• The goose is the most 'dangerous' entity\n• You WILL need to make a return trip with the goose (step 4)\n• The trick is: take fox or beans first (they can't eat each other!)\n• Then bring the goose back, swap, and finally take the goose last!",
  ],
  'purba|who are you|your name|about you': [
    "I'm PURBA 🤖 — an AI assistant specialized in the Fox, Goose & Beans puzzle and search algorithms!\n\nI can help with:\n• BFS & DFS explanations\n• A* heuristic search\n• Java code walkthroughs\n• Puzzle hints & strategy\n• Algorithm complexity\n\nAsk me anything!",
  ],
  'compare|vs|versus|difference|better|which': [
    "BFS vs DFS comparison:\n\n🔵 BFS:\n• Finds SHORTEST path (optimal)\n• Uses more memory (O(b^d))\n• Explores all neighbors first\n• Better for this puzzle!\n\n🟣 DFS:\n• Memory efficient O(b·m)\n• NOT optimal\n• Can get lost in deep branches\n• Needs visited-set for graphs\n\n⭐ Winner: A* (best of both worlds!)",
  ],
  'default': [
    "That's a great question! I'm still learning to cover every topic 🧠 Try asking me about: BFS, DFS, A*, the puzzle rules, solution steps, Java code, state space, or complexity!",
    "Hmm, I'm not sure about that specific topic yet! But I can definitely help with: BFS/DFS algorithms, the 7-step solution, Java implementation, A* heuristics, or state-space analysis. What interests you?",
  ],
};

let purbaOpen   = false;
let purbaUnread = 1;

function togglePurba() {
  purbaOpen = !purbaOpen;
  document.getElementById('purba-chat').classList.toggle('open', purbaOpen);
  if (purbaOpen) { document.getElementById('purba-badge').classList.add('hidden'); purbaUnread = 0; }
}

function closePurba() {
  purbaOpen = false;
  document.getElementById('purba-chat').classList.remove('open');
}

function getPurbaResponse(input) {
  const q = input.toLowerCase().trim();
  for (const [pattern, responses] of Object.entries(PURBA_DB)) {
    if (pattern === 'default') continue;
    const regex = new RegExp(pattern, 'i');
    if (regex.test(q)) return responses[Math.floor(Math.random() * responses.length)];
  }
  const defaults = PURBA_DB['default'];
  return defaults[Math.floor(Math.random() * defaults.length)];
}

function sendPurbaMsg(text) {
  const msgs = document.getElementById('purba-msgs');
  const um = document.createElement('div'); um.className = 'purba-msg user'; um.textContent = text; msgs.appendChild(um);
  const typing = document.createElement('div'); typing.className = 'purba-typing';
  typing.innerHTML = '<span></span><span></span><span></span>'; msgs.appendChild(typing);
  msgs.scrollTop = msgs.scrollHeight;

  setTimeout(() => {
    typing.remove();
    const resp = getPurbaResponse(text);
    const bm   = document.createElement('div'); bm.className = 'purba-msg bot';
    bm.textContent = resp; msgs.appendChild(bm);
    msgs.scrollTop = msgs.scrollHeight;
  }, 850 + Math.random() * 400);
}

function sendPurbaInput() {
  const inp = document.getElementById('purba-input');
  const val = inp.value.trim();
  if (!val) return;
  inp.value = '';
  sendPurbaMsg(val);
}

function sendHintChip(text) {
  if (!purbaOpen) togglePurba();
  sendPurbaMsg(text);
}

document.getElementById('purba-input').addEventListener('keydown', e => {
  if (e.key === 'Enter') sendPurbaInput();
});


/* ─────────────────────────────────────────
   11. PARALLAX
───────────────────────────────────────── */
window.addEventListener('scroll', () => {
  const y  = window.scrollY;
  const fi = document.querySelector('.float-icons');
  if (fi) fi.style.transform = `translateY(${y * 0.14}px)`;
});