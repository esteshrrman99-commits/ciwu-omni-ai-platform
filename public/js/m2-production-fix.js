(() => {
  'use strict';

  const M2 = {
    version: '2.0.0',
    busy: new Set()
  };

  const $ = (id) => document.getElementById(id);

  function escapeHtml(value) {
    return String(value ?? '')
      .replaceAll('&','&amp;')
      .replaceAll('<','&lt;')
      .replaceAll('>','&gt;');
  }

  function toast(message, ok = true) {
    let el = $('m2-toast');

    if (!el) {
      el = document.createElement('div');
      el.id = 'm2-toast';
      document.body.appendChild(el);
    }

    el.textContent = message;
    el.style.borderColor = ok
      ? 'rgba(32,227,154,.4)'
      : 'rgba(255,100,124,.48)';

    el.classList.add('show');

    clearTimeout(el._timer);

    el._timer = setTimeout(
      () => el.classList.remove('show'),
      3200
    );
  }

  async function request(url, options = {}) {
    const response = await fetch(url, options);

    const type =
      response.headers.get('content-type') || '';

    let data;

    if (type.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      const detail =
        typeof data === 'object'
          ? data.error || data.message || JSON.stringify(data)
          : data;

      throw new Error(
        `HTTP ${response.status}: ${detail || 'request failed'}`
      );
    }

    return data;
  }

  function setResult(id, content) {
    const el = $(id);

    if (!el) return;

    el.style.display = 'block';

    if (typeof content === 'string') {
      el.textContent = content;
    } else {
      el.textContent = JSON.stringify(content, null, 2);
    }
  }

  async function guard(name, fn) {
    if (M2.busy.has(name)) return;

    M2.busy.add(name);

    try {
      return await fn();
    } catch (error) {
      console.error(`[M2:${name}]`, error);
      toast(`${name}: ${error.message}`, false);
      throw error;
    } finally {
      M2.busy.delete(name);
    }
  }

  /* =====================================================
     QUANTUM DASHBOARD
     ===================================================== */

  window.getQuantumSurprise = () =>
    guard('Quantum Surprise', async () => {
      setResult(
        'quantumResult',
        'Generating educational research simulation...'
      );

      const data =
        await request('/api/quantum-surprise');

      setResult('quantumResult', data);

      toast('Quantum research result loaded');
    });

  window.getBreakthroughs = () =>
    guard('Breakthroughs', async () => {
      setResult(
        'quantumResult',
        'Loading cached research results...'
      );

      const data =
        await request('/api/quantum-breakthroughs');

      setResult('quantumResult', data);

      toast('Research results loaded');
    });

  window.checkEntanglement = () =>
    guard('System Status', async () => {
      const data = await request('/api/stats');
      const q = data.quantum || {};

      setResult(
        'quantumResult',
        [
          'CIWU SYSTEM COHERENCE',
          '',
          `Quantum state: ${q.quantumState ?? 'unknown'}`,
          `Qubits: ${q.qubits ?? 0}`,
          `Entangled pairs: ${q.entangledPairs ?? 0}`,
          `Cached breakthroughs: ${q.breakthroughsCached ?? 0}`,
          '',
          'Displayed values are application telemetry/simulation state.'
        ].join('\n')
      );

      toast('System telemetry refreshed');
    });

  window.viewBlockchain = () =>
    guard('Blockchain', async () => {
      const data = await request('/api/stats');
      const q = data.quantum || {};

      const blocks =
        Number(q.blockchainBlocks || 0);

      setResult(
        'quantumResult',
        [
          'CIWU LEDGER STATUS',
          '',
          `Ledger blocks reported: ${blocks}`,
          `State: ${q.quantumState ?? 'unknown'}`,
          '',
          blocks > 0
            ? 'Ledger contains persisted application records.'
            : 'Ledger service is reachable; no persisted blocks are currently reported.',
          '',
          'This status does not represent a public blockchain confirmation unless independently verified.'
        ].join('\n')
      );

      toast('Ledger status loaded');
    });

  /* =====================================================
     PATIENT NAVIGATION
     ===================================================== */

  function patientPayload() {
    return {
      patientName: $('patientName')?.value?.trim() || '',
      age: $('patientAge')?.value || '',
      insurance:
        $('patientInsurance')?.value?.trim() || '',
      treatment:
        $('desiredTreatment')?.value?.trim() || ''
    };
  }

  window.generatePacket = () =>
    guard('Discussion Packet', async () => {
      const data = await request(
        '/api/generate-packet',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(patientPayload())
        }
      );

      setResult('navResult', data);
      toast('Discussion packet generated');
    });

  window.generatePresentation = () =>
    guard('Presentation', async () => {
      const data = await request(
        '/api/generate-presentation',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(patientPayload())
        }
      );

      setResult('navResult', data);
      toast('Presentation generated');
    });

  window.findProviders = () =>
    guard('Providers', async () => {
      const insurance =
        $('patientInsurance')?.value?.trim() || '';

      const data = await request(
        '/api/providers?insurance=' +
        encodeURIComponent(insurance)
      );

      setResult('navResult', data);
      toast('Provider results loaded');
    });

  window.getScript = () =>
    guard('Calling Script', async () => {
      const treatment =
        $('desiredTreatment')?.value?.trim();

      if (!treatment) {
        throw new Error(
          'Enter a treatment or topic first.'
        );
      }

      const data = await request(
        '/api/scripts/' +
        encodeURIComponent(treatment)
      );

      setResult('navResult', data);
      toast('Calling script loaded');
    });

  /* =====================================================
     VIDEO
     ===================================================== */

  window.analyzeVideo = () =>
    guard('Video Analysis', async () => {
      const input = $('videoInput');

      const file =
        window.uploadedVideo ||
        input?.files?.[0];

      if (!file) {
        throw new Error('Select a video first.');
      }

      const fd = new FormData();
      fd.append('video', file);

      setResult(
        'videoAnalysisResult',
        'Uploading and analyzing video...'
      );

      const data = await request(
        '/api/analyze-video',
        {
          method: 'POST',
          body: fd
        }
      );

      setResult(
        'videoAnalysisResult',
        data.analysis || data
      );

      toast('Video analysis completed');
    });

  /* =====================================================
     MAIN CHAT / ABIJAH
     ===================================================== */

  async function chatRequest(message, files = []) {
    if (!message && !files.length) {
      throw new Error(
        'Enter a message or attach a file.'
      );
    }

    const fd = new FormData();

    fd.append('message', message || '');

    for (const file of files) {
      fd.append('images', file);
    }

    return request(
      '/api/chat',
      {
        method: 'POST',
        body: fd
      }
    );
  }

  window.uploadWithAbijah = () =>
    guard('Abijah', async () => {
      const input = $('chatInput');

      const message =
        input?.value?.trim() || '';

      const files =
        Array.isArray(window.uploadedFiles)
          ? window.uploadedFiles
          : [];

      const out = $('chatOut');

      if (out) {
        out.textContent =
          'Abijah is processing your request...';
      }

      const data =
        await chatRequest(message, files);

      const answer =
        data.response ||
        data.analysis ||
        data.message ||
        JSON.stringify(data, null, 2);

      if (out) {
        out.textContent = answer;
      }

      if (input) input.value = '';

      toast('Abijah response received');
    });

  window.sendMessage = window.uploadWithAbijah;

  window.sendAbijah = () =>
    guard('Abijah Chat', async () => {
      const input = $('abijah-input');

      const message =
        input?.value?.trim() || '';

      if (!message) {
        throw new Error('Enter a message first.');
      }

      if (typeof window.addMessage === 'function') {
        window.addMessage(message, true);
      }

      input.value = '';

      const data =
        await chatRequest(message);

      const answer =
        data.response ||
        data.analysis ||
        data.message ||
        JSON.stringify(data, null, 2);

      if (typeof window.addMessage === 'function') {
        window.addMessage(answer, false);
      }

      toast('Abijah replied');
    });

  /* =====================================================
     M3 PLAN / BUILD / TEST
     Adaptive bridge to existing governance API
     ===================================================== */

  function findM3Input() {
    const selectors = [
      '#m3-console textarea',
      '.m3-console textarea',
      '#m3Console textarea',
      '[data-m3-console] textarea',
      '[id*="m3-console"] textarea',
      '#m3-console input[type="text"]',
      '.m3-console input[type="text"]'
    ];

    for (const selector of selectors) {
      const node = document.querySelector(selector);

      if (node?.value?.trim()) {
        return node;
      }
    }

    return null;
  }

  function findM3Output() {
    return (
      document.querySelector(
        '#m3-console pre, .m3-console pre, #m3Console pre'
      ) ||
      document.querySelector(
        '#m3-console [class*="output"], .m3-console [class*="output"]'
      )
    );
  }

  async function runM3(mode) {
    const input = findM3Input();

    const task =
      input?.value?.trim() || '';

    if (!task) {
      toast(
        'Enter an M3 task first.',
        false
      );
      return;
    }

    const map = {
      PLAN: '/api/m3/plan',
      BUILD: '/api/m3/intake',
      TEST: '/api/m3/verify'
    };

    const endpoint = map[mode];

    if (!endpoint) return;

    const output = findM3Output();

    if (output) {
      output.textContent =
        `${mode}: processing...`;
    }

    try {
      const data = await request(
        endpoint,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            task,
            request: task,
            input: task,
            mode: mode.toLowerCase()
          })
        }
      );

      if (output) {
        output.textContent =
          JSON.stringify(data, null, 2);
      }

      toast(`M3 ${mode} completed`);
    } catch (error) {
      if (output) {
        output.textContent =
          `${mode} failed:\n${error.message}`;
      }

      toast(
        `M3 ${mode}: ${error.message}`,
        false
      );
    }
  }

  /*
   * Intercept only the M3 PLAN/BUILD/TEST buttons.
   * Capture phase prevents old broken handlers from
   * firing before this bridge.
   */
  document.addEventListener(
    'click',
    (event) => {
      const button =
        event.target.closest('button');

      if (!button) return;

      const label =
        button.textContent.trim().toUpperCase();

      if (
        !['PLAN','BUILD','TEST'].includes(label)
      ) {
        return;
      }

      const container =
        button.closest(
          '#m3-console,.m3-console,#m3Console,[data-m3-console],[id*="m3-console"]'
        );

      if (!container) return;

      event.preventDefault();
      event.stopImmediatePropagation();

      runM3(label);
    },
    true
  );

  /* =====================================================
     HEALTH
     ===================================================== */

  async function health() {
    let badge = $('m2-health');

    if (!badge) {
      badge = document.createElement('div');
      badge.id = 'm2-health';
      badge.textContent = 'CIWU CHECKING';
      document.body.appendChild(badge);
    }

    try {
      const [
        eons,
        models
      ] = await Promise.all([
        request('/api/eons/status'),
        request('/api/eons-models/status')
      ]);

      badge.textContent =
        eons.status === 'ONLINE'
          ? '● CIWU ONLINE'
          : '● CIWU READY';

      badge.title =
        `M2 ${M2.version} • EONS + Model Router reachable`;

      return { eons, models };
    } catch (error) {
      badge.textContent =
        '● CIWU DEGRADED';

      badge.style.color =
        '#ff647c';

      console.error(
        '[M2 health]',
        error
      );
    }
  }

  window.CIWU_M2 = {
    version: M2.version,
    request,
    health,
    runM3
  };

  document.addEventListener(
    'DOMContentLoaded',
    health
  );

  if (document.readyState !== 'loading') {
    health();
  }

  console.log(
    `%cCIWU OMNI M2 ${M2.version} frontend repair active`,
    'color:#20e39a;font-weight:bold'
  );
})();
