'use strict';

const BRAND = Object.freeze({
  name:'CIWU Ω∞',
  designation:'INFINITY PLATFORM',
  constitution:'CIWU Ω∞ TERMINUS',
  architecture:
    'ZORTEX × NERUTEX × EONS',
  principle:
    'INFINITE EVOLUTION × FINITE AUTHORITY × FAIL-CLOSED SECURITY × HUMAN SOVEREIGNTY',
  logo:'/brand/ciwu-omega-infinity-logo.png'
});

function escapeHtml(value) {
  return String(value == null ? '' : value)
    .replaceAll('&','&amp;')
    .replaceAll('<','&lt;')
    .replaceAll('>','&gt;')
    .replaceAll('"','&quot;')
    .replaceAll("'","&#39;");
}

function brandStyles() {
  return `
:root {
  --ciwu-void:#030711;
  --ciwu-space:#07111f;
  --ciwu-panel:rgba(7,18,34,.72);
  --ciwu-panel-strong:rgba(5,13,26,.90);
  --ciwu-line:rgba(113,177,255,.22);
  --ciwu-blue:#55aaff;
  --ciwu-blue-hot:#87d8ff;
  --ciwu-gold:#e5b65a;
  --ciwu-gold-hot:#ffd88a;
  --ciwu-text:#f5f7fb;
  --ciwu-muted:#98a8bc;
  --ciwu-ok:#66e29a;
  --ciwu-radius:18px;
  --ciwu-shadow:
    0 20px 80px rgba(0,0,0,.48),
    0 0 48px rgba(39,126,255,.08);
}

* {
  box-sizing:border-box;
}

html {
  background:var(--ciwu-void);
}

body {
  margin:0;
  color:var(--ciwu-text);
  background:
    radial-gradient(circle at 50% -15%,
      rgba(40,113,255,.18),
      transparent 42%),
    radial-gradient(circle at 50% 115%,
      rgba(229,182,90,.13),
      transparent 35%),
    linear-gradient(180deg,
      #02060d 0%,
      #06101d 48%,
      #030711 100%);
  min-height:100vh;
}

body::before {
  content:'';
  position:fixed;
  inset:0;
  pointer-events:none;
  opacity:.32;
  background-image:
    radial-gradient(circle,
      rgba(255,255,255,.85) 0 1px,
      transparent 1.4px);
  background-size:89px 89px;
  mask-image:
    linear-gradient(to bottom,
      black,
      transparent 85%);
}

.ciwu-shell {
  min-height:100vh;
  position:relative;
  overflow:hidden;
}

.ciwu-topbar {
  position:sticky;
  top:0;
  z-index:100;
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:24px;
  padding:14px 26px;
  border-bottom:1px solid var(--ciwu-line);
  background:rgba(3,7,17,.82);
  backdrop-filter:blur(22px);
}

.ciwu-brand-lockup {
  display:flex;
  align-items:center;
  gap:13px;
}

.ciwu-brand-lockup img {
  width:48px;
  height:48px;
  object-fit:cover;
  object-position:center;
  border-radius:50%;
  box-shadow:
    0 0 26px rgba(229,182,90,.22),
    0 0 32px rgba(85,170,255,.14);
}

.ciwu-brand-name {
  font-size:18px;
  font-weight:760;
  letter-spacing:.10em;
}

.ciwu-brand-subtitle {
  color:var(--ciwu-gold);
  font-size:10px;
  letter-spacing:.28em;
  margin-top:3px;
}

.ciwu-nav {
  display:flex;
  align-items:center;
  gap:8px;
  flex-wrap:wrap;
}

.ciwu-nav a {
  text-decoration:none;
  color:var(--ciwu-muted);
  font-size:12px;
  letter-spacing:.06em;
  padding:9px 12px;
  border-radius:999px;
  transition:.2s ease;
}

.ciwu-nav a:hover {
  color:white;
  background:rgba(85,170,255,.09);
}

.ciwu-console-button {
  border:1px solid rgba(229,182,90,.55);
  color:var(--ciwu-gold-hot);
  padding:10px 17px;
  border-radius:10px;
  background:
    linear-gradient(180deg,
      rgba(229,182,90,.10),
      rgba(229,182,90,.03));
  box-shadow:
    inset 0 0 20px rgba(229,182,90,.07),
    0 0 28px rgba(229,182,90,.08);
}

.ciwu-hero {
  position:relative;
  min-height:620px;
  display:grid;
  place-items:center;
  padding:70px 24px 48px;
  isolation:isolate;
}

.ciwu-hero::before,
.ciwu-hero::after {
  content:'';
  position:absolute;
  left:50%;
  top:50%;
  width:min(74vw,820px);
  aspect-ratio:1;
  border-radius:50%;
  transform:translate(-50%,-50%);
  border:1px solid rgba(85,170,255,.15);
  pointer-events:none;
  z-index:-1;
}

.ciwu-hero::before {
  animation:ciwuOrbit 32s linear infinite;
  box-shadow:
    inset 0 0 120px rgba(46,110,255,.05);
}

.ciwu-hero::after {
  width:min(56vw,610px);
  border-color:rgba(229,182,90,.14);
  animation:ciwuOrbitReverse 24s linear infinite;
}

@keyframes ciwuOrbit {
  from {
    transform:
      translate(-50%,-50%)
      rotate(0deg);
  }
  to {
    transform:
      translate(-50%,-50%)
      rotate(360deg);
  }
}

@keyframes ciwuOrbitReverse {
  from {
    transform:
      translate(-50%,-50%)
      rotate(360deg);
  }
  to {
    transform:
      translate(-50%,-50%)
      rotate(0deg);
  }
}

.ciwu-hero-inner {
  width:min(1180px,100%);
  display:grid;
  grid-template-columns:minmax(280px,1.08fr) minmax(280px,.92fr);
  gap:52px;
  align-items:center;
}

.ciwu-eyebrow {
  color:var(--ciwu-gold);
  letter-spacing:.22em;
  font-size:12px;
  font-weight:700;
}

.ciwu-title {
  font-size:clamp(46px,8vw,98px);
  line-height:.92;
  letter-spacing:-.045em;
  margin:14px 0 20px;
  background:
    linear-gradient(135deg,
      #fff 8%,
      var(--ciwu-gold-hot) 42%,
      #fff 62%,
      var(--ciwu-blue-hot));
  -webkit-background-clip:text;
  background-clip:text;
  color:transparent;
}

.ciwu-tagline {
  max-width:700px;
  color:#c6d2df;
  font-size:clamp(17px,2vw,23px);
  line-height:1.55;
}

.ciwu-principle {
  max-width:720px;
  margin-top:22px;
  color:var(--ciwu-muted);
  font-size:12px;
  letter-spacing:.13em;
  line-height:1.8;
}

.ciwu-actions {
  display:flex;
  gap:12px;
  flex-wrap:wrap;
  margin-top:30px;
}

.ciwu-primary-action,
.ciwu-secondary-action {
  display:inline-flex;
  align-items:center;
  justify-content:center;
  text-decoration:none;
  min-height:48px;
  padding:0 20px;
  border-radius:12px;
  font-weight:700;
  letter-spacing:.04em;
}

.ciwu-primary-action {
  color:#110d05;
  background:
    linear-gradient(135deg,
      var(--ciwu-gold-hot),
      var(--ciwu-gold));
  box-shadow:
    0 8px 35px rgba(229,182,90,.23);
}

.ciwu-secondary-action {
  color:var(--ciwu-blue-hot);
  border:1px solid rgba(85,170,255,.35);
  background:rgba(85,170,255,.05);
}

.ciwu-logo-stage {
  position:relative;
  display:grid;
  place-items:center;
}

.ciwu-logo-stage::before {
  content:'';
  position:absolute;
  inset:12%;
  border-radius:50%;
  background:
    radial-gradient(circle,
      rgba(68,158,255,.24),
      rgba(229,182,90,.07) 46%,
      transparent 72%);
  filter:blur(28px);
}

.ciwu-master-logo {
  position:relative;
  width:min(500px,92vw);
  border-radius:32px;
  filter:
    drop-shadow(0 30px 50px rgba(0,0,0,.52))
    drop-shadow(0 0 20px rgba(229,182,90,.11));
}

.ciwu-grid {
  width:min(1180px,calc(100% - 36px));
  margin:0 auto 72px;
  display:grid;
  grid-template-columns:
    repeat(4,minmax(0,1fr));
  gap:14px;
}

.ciwu-card {
  min-height:170px;
  padding:21px;
  border:1px solid var(--ciwu-line);
  border-radius:var(--ciwu-radius);
  background:
    linear-gradient(180deg,
      rgba(14,31,53,.78),
      rgba(5,14,27,.82));
  box-shadow:var(--ciwu-shadow);
  backdrop-filter:blur(16px);
}

.ciwu-card-kicker {
  color:var(--ciwu-gold);
  font-size:10px;
  letter-spacing:.19em;
  text-transform:uppercase;
}

.ciwu-card-title {
  font-size:18px;
  margin:10px 0 8px;
}

.ciwu-card-copy {
  color:var(--ciwu-muted);
  font-size:13px;
  line-height:1.6;
}

.ciwu-status-line {
  display:flex;
  align-items:center;
  gap:8px;
  margin-top:15px;
  color:var(--ciwu-ok);
  font-size:11px;
  letter-spacing:.08em;
}

.ciwu-status-dot {
  width:7px;
  height:7px;
  border-radius:50%;
  background:currentColor;
  box-shadow:0 0 14px currentColor;
}

@media (max-width:900px) {
  .ciwu-nav {
    display:none;
  }

  .ciwu-hero {
    padding-top:46px;
  }

  .ciwu-hero-inner {
    grid-template-columns:1fr;
    gap:28px;
  }

  .ciwu-logo-stage {
    order:-1;
  }

  .ciwu-master-logo {
    width:min(420px,90vw);
  }

  .ciwu-grid {
    grid-template-columns:
      repeat(2,minmax(0,1fr));
  }
}

@media (max-width:560px) {
  .ciwu-topbar {
    padding:10px 13px;
  }

  .ciwu-console-button {
    padding:8px 10px;
    font-size:11px;
  }

  .ciwu-brand-name {
    font-size:14px;
  }

  .ciwu-hero {
    min-height:auto;
    padding:32px 18px;
  }

  .ciwu-grid {
    grid-template-columns:1fr;
    width:calc(100% - 24px);
  }
}

@media (prefers-reduced-motion:reduce) {
  .ciwu-hero::before,
  .ciwu-hero::after {
    animation:none;
  }
}
`;
}

function topbar() {
  return `
<header class="ciwu-topbar">
  <div class="ciwu-brand-lockup">
    <img
      src="${escapeHtml(BRAND.logo)}"
      alt="CIWU Omega Infinity emblem"
    />
    <div>
      <div class="ciwu-brand-name">
        CIWU Ω∞
      </div>
      <div class="ciwu-brand-subtitle">
        INFINITY PLATFORM
      </div>
    </div>
  </div>

  <nav class="ciwu-nav">
    <a href="#intelligence">Intelligence</a>
    <a href="#memory">Memory</a>
    <a href="#security">Security</a>
    <a href="#workspace">Workspace</a>
  </nav>

  <a
    class="ciwu-console-button"
    href="#workspace"
  >
    ACCESS CONSOLE
  </a>
</header>
`;
}

function hero() {
  return `
<section class="ciwu-hero">
  <div class="ciwu-hero-inner">

    <div>
      <div class="ciwu-eyebrow">
        CIWU Ω∞ TERMINUS
      </div>

      <h1 class="ciwu-title">
        ENTER THE
        INFINITY
      </h1>

      <div class="ciwu-tagline">
        Universal intelligence,
        infinite memory and
        fail-closed operational security
        under permanent human sovereignty.
      </div>

      <div class="ciwu-principle">
        ${escapeHtml(BRAND.principle)}
      </div>

      <div class="ciwu-actions">
        <a
          class="ciwu-primary-action"
          href="#workspace"
        >
          OPEN CIWU
        </a>

        <a
          class="ciwu-secondary-action"
          href="#architecture"
        >
          EXPLORE ARCHITECTURE
        </a>
      </div>
    </div>

    <div class="ciwu-logo-stage">
      <img
        class="ciwu-master-logo"
        src="${escapeHtml(BRAND.logo)}"
        alt="CIWU Omega Infinity master emblem"
      />
    </div>

  </div>
</section>
`;
}

function capabilityGrid() {
  const cards = [
    [
      'ZORTEX Ω²',
      'Universal Intelligence Router',
      'Routes models, agents, tools and compute through validated capability and risk gates.',
      'ROUTER READY'
    ],
    [
      'NERUTEX Ω²',
      'Infinity Memory',
      'Persistent memory with provenance, freshness, contradiction detection and bounded retrieval.',
      'MEMORY ONLINE'
    ],
    [
      'EONS Ω∞',
      'Security Kernel',
      'Default deny, hard gates, finite authority, authorization decay and fail-closed execution.',
      'KERNEL ACTIVE'
    ],
    [
      'CIWU Ω∞',
      'Evolution Fabric',
      'Models, multimodal systems, research, code and future capabilities enter through governed adapters.',
      'FABRIC READY'
    ]
  ];

  return `
<section
  id="architecture"
  class="ciwu-grid"
>
  ${
    cards.map(
      ([kicker,title,copy,status]) => `
      <article class="ciwu-card">
        <div class="ciwu-card-kicker">
          ${escapeHtml(kicker)}
        </div>

        <div class="ciwu-card-title">
          ${escapeHtml(title)}
        </div>

        <div class="ciwu-card-copy">
          ${escapeHtml(copy)}
        </div>

        <div class="ciwu-status-line">
          <span class="ciwu-status-dot"></span>
          ${escapeHtml(status)}
        </div>
      </article>
      `
    ).join('')
  }
</section>
`;
}

function brandShell() {
  return `
<div class="ciwu-shell">
  ${topbar()}
  ${hero()}
  ${capabilityGrid()}
</div>
`;
}

module.exports = {
  BRAND,
  brandStyles,
  topbar,
  hero,
  capabilityGrid,
  brandShell
};
