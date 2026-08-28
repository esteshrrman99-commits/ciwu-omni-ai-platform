(() => {
  'use strict';

  const state = {
    health: null,
    m3: null,
    activeView: 'overview'
  };

  const $ = (selector, root=document) =>
    root.querySelector(selector);

  const $$ = (selector, root=document) =>
    [...root.querySelectorAll(selector)];

  function escapeHtml(value='') {
    return String(value)
      .replaceAll('&','&amp;')
      .replaceAll('<','&lt;')
      .replaceAll('>','&gt;')
      .replaceAll('"','&quot;')
      .replaceAll("'","&#039;");
  }

  async function jsonFetch(url, options={}) {
    const response = await fetch(url, {
      headers: {
        'Content-Type':'application/json',
        ...(options.headers || {})
      },
      ...options
    });

    let body = null;

    try {
      body = await response.json();
    } catch (_) {
      body = {
        ok:false,
        error:'INVALID_JSON_RESPONSE'
      };
    }

    return {
      status:response.status,
      body
    };
  }

  function setView(name) {
    state.activeView = name;

    $$('.ciwu-view').forEach(el => {
      el.classList.toggle(
        'active',
        el.dataset.view === name
      );
    });

    $$('.ciwu-nav button').forEach(el => {
      el.classList.toggle(
        'active',
        el.dataset.target === name
      );
    });

    const labels = {
      overview:[
        'Command Center',
        'Sovereign system overview'
      ],
      m3:[
        'M3 Intelligence',
        'Provider-neutral AI workspace'
      ],
      federation:[
        'Model Federation',
        'Provider and certification truth'
      ],
      codex:[
        'Code Intelligence',
        'CODEX / XEON controlled workspace'
      ],
      neurotex:[
        'NEUROTEX',
        'Evidence and learning state'
      ],
      safety:[
        'Safety & Authorization',
        'Fail-closed control plane'
      ]
    };

    const [title,sub] =
      labels[name] || labels.overview;

    $('#ciwu-page-title').textContent = title;
    $('#ciwu-page-subtitle').textContent = sub;

    $('#ciwu-sidebar')?.classList.remove('open');
  }

  function renderHealth(health) {
    state.health = health;

    const online = Boolean(health?.ok);

    $('#ciwu-live-dot')
      ?.classList.toggle('online', online);

    $('#ciwu-live-text').textContent =
      online
        ? 'Sovereign API online'
        : 'API status unknown';

    const generation =
      health?.generation || 'UNKNOWN';

    const commit =
      health?.renderGitCommit
        ? String(health.renderGitCommit).slice(0,10)
        : 'UNKNOWN';

    $('#ciwu-generation').textContent =
      generation.replace('OMEGA120_','');

    $('#ciwu-commit').textContent = commit;
  }

  function renderM3Health(m3) {
    state.m3 = m3;

    const configured =
      m3?.configured === true;

    $('#ciwu-m3-provider').textContent =
      configured
        ? 'Provider configured'
        : 'No active inference';

    $('#ciwu-m3-state').textContent =
      configured
        ? 'Configured'
        : 'Fail-closed';

    $('#ciwu-m3-state-detail').textContent =
      configured
        ? 'Provider credentials detected'
        : 'No certified execution route';
  }

  function addMessage(role, text) {
    const box = $('#ciwu-messages');

    if (!box) return;

    const div = document.createElement('div');

    div.className =
      `ciwu-message ${role}`;

    div.textContent = text;

    box.appendChild(div);

    box.scrollTop = box.scrollHeight;
  }

  async function sendM3() {
    const input = $('#ciwu-prompt');
    const button = $('#ciwu-send');

    const message =
      input?.value?.trim();

    if (!message) return;

    addMessage('user', message);

    input.value = '';
    button.disabled = true;

    addMessage(
      'system',
      'Routing through the M3 provider boundary...'
    );

    const result = await jsonFetch(
      '/api/m3/chat',
      {
        method:'POST',
        body:JSON.stringify({
          message,
          mode:
            $('#ciwu-mode')?.value ||
            'CHAT'
        })
      }
    );

    const systems =
      $$('.ciwu-message.system');

    systems.at(-1)?.remove();

    if (result.status === 200 && result.body?.ok) {
      const text =
        result.body.output_text ||
        result.body.output ||
        result.body.message ||
        JSON.stringify(result.body,null,2);

      addMessage('assistant', text);
    } else {
      const error =
        result.body?.detail ||
        result.body?.error ||
        `HTTP ${result.status}`;

      addMessage(
        'assistant',
        `M3 did not execute this request.\n\n${error}`
      );
    }

    button.disabled = false;
  }

  function bindEvents() {
    $$('.ciwu-nav button').forEach(button => {
      button.addEventListener('click', () => {
        setView(button.dataset.target);
      });
    });

    $('#ciwu-menu')?.addEventListener(
      'click',
      () => {
        $('#ciwu-sidebar')
          ?.classList.toggle('open');
      }
    );

    $('#ciwu-send')?.addEventListener(
      'click',
      sendM3
    );

    $('#ciwu-prompt')?.addEventListener(
      'keydown',
      event => {
        if (
          event.key === 'Enter' &&
          !event.shiftKey
        ) {
          event.preventDefault();
          sendM3();
        }
      }
    );

    $$('[data-open-view]').forEach(button => {
      button.addEventListener('click', () => {
        setView(button.dataset.openView);
      });
    });
  }

  async function boot() {
    bindEvents();
    setView('overview');

    const [health,m3] =
      await Promise.allSettled([
        jsonFetch('/api/sovereign/health'),
        jsonFetch('/api/m3/health')
      ]);

    if (health.status === 'fulfilled') {
      renderHealth(health.value.body);
    }

    if (m3.status === 'fulfilled') {
      renderM3Health(m3.value.body);
    }
  }

  window.CIWU = {
    state,
    setView,
    jsonFetch
  };

  document.addEventListener(
    'DOMContentLoaded',
    boot
  );
})();
