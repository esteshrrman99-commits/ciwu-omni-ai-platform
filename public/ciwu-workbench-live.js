(() => {
  'use strict';

  const state = {
    runtime:null,
    repository:null,
    symbols:null,
    providers:null,
    neurotex:null,
    activity:null
  };

  const $ = (selector, root=document) =>
    root.querySelector(selector);

  function text(selector, value) {
    const el = $(selector);
    if (el)
      el.textContent = value ?? 'UNKNOWN';
  }

  async function get(path) {
    const response = await fetch(
      `/api/workbench${path}`,
      {
        headers:{Accept:'application/json'},
        cache:'no-store'
      }
    );

    const body = await response.json();

    if (!response.ok || body?.ok === false) {
      throw new Error(
        body?.error || `HTTP_${response.status}`
      );
    }

    return body;
  }

  function renderRuntime(data) {
    state.runtime = data;

    text('#ciwu-live-project', data.project);
    text(
      '#ciwu-live-generation',
      data.release?.generation
    );
    text(
      '#ciwu-live-milestone',
      data.release?.milestoneEnd
    );
    text(
      '#ciwu-live-render-commit',
      data.renderGitCommit
        ? String(data.renderGitCommit).slice(0,12)
        : 'UNKNOWN'
    );
  }

  function renderRepository(data) {
    state.repository = data;

    const entries = data.entries || [];
    const files = entries.filter(x => x.type === 'file');

    text('#ciwu-live-file-count', files.length);

    const root = $('#ciwu-live-repository-tree');
    if (!root) return;

    root.replaceChildren();

    for (const item of files.slice(0,150)) {
      const row = document.createElement('button');
      row.type = 'button';
      row.dataset.filePath = item.path;

      const icon = document.createElement('span');
      icon.textContent = '◇';

      const label = document.createElement('span');
      label.textContent =
        `${item.path} · ${item.language || 'Other'}`;

      row.append(icon,label);
      root.appendChild(row);
    }
  }

  function renderSymbols(data) {
    state.symbols = data;

    text(
      '#ciwu-live-symbol-count',
      data.symbolCount || 0
    );

    const root = $('#ciwu-live-symbol-list');
    if (!root) return;

    root.replaceChildren();

    for (const item of (data.symbols || []).slice(0,150)) {
      const row = document.createElement('div');
      row.className = 'ciwu-row';

      const left = document.createElement('span');
      left.textContent = `${item.kind} · ${item.name}`;

      const right = document.createElement('strong');
      right.textContent = `${item.file}:${item.line}`;

      row.append(left,right);
      root.appendChild(row);
    }
  }

  function renderProviders(data) {
    state.providers = data;

    const root = $('#ciwu-live-provider-grid');
    if (!root) return;

    root.replaceChildren();

    for (const item of data.providers || []) {
      const card = document.createElement('article');
      card.className =
        'ciwu-card ciwu-provider-card';

      const title = document.createElement('strong');
      title.textContent = item.provider;

      const configured = document.createElement('p');
      configured.textContent =
        item.configured
          ? 'Credential configuration detected'
          : 'Credential not configured';

      const warning = document.createElement('p');
      warning.textContent =
        'Configured does not equal certified.';

      const chip = document.createElement('span');
      chip.className = 'ciwu-chip';
      chip.textContent = item.costClass;

      card.append(
        title,
        configured,
        warning,
        chip
      );

      root.appendChild(card);
    }
  }

  function renderNeurotex(data) {
    state.neurotex = data;

    text(
      '#ciwu-live-neurotex-count',
      data.sourceCount || 0
    );

    const root = $('#ciwu-live-neurotex-list');
    if (!root) return;

    root.replaceChildren();

    for (const item of (data.records || []).slice(0,80)) {
      const record = document.createElement('div');
      record.className = 'ciwu-evidence-record';

      const title = document.createElement('strong');
      title.textContent =
        item.generation ||
        item.schema ||
        item.file;

      const body = document.createElement('p');
      body.textContent =
        item.marker ||
        item.file;

      record.append(title,body);
      root.appendChild(record);
    }
  }

  function renderActivity(data) {
    state.activity = data;

    text(
      '#ciwu-live-event-count',
      data.eventCount || 0
    );

    const root = $('#ciwu-live-activity');
    if (!root) return;

    root.replaceChildren();

    for (const event of (data.events || []).slice(0,80)) {
      const row = document.createElement('div');
      row.className = 'ciwu-timeline-event';

      const title = document.createElement('strong');
      title.textContent =
        event.generation || event.type;

      const body = document.createElement('p');
      body.textContent =
        `Milestones ${event.milestoneStart ?? '?'} → ${event.milestoneEnd ?? '?'}`;

      row.append(title,body);
      root.appendChild(row);
    }
  }

  function renderError(error) {
    const el = $('#ciwu-workbench-live-status');
    if (!el) return;

    el.textContent =
      `Live telemetry unavailable: ${error.message}`;

    el.classList.remove('online');
  }

  async function boot() {
    try {
      const [
        runtime,
        repository,
        symbols,
        providers,
        neurotex,
        activity
      ] = await Promise.all([
        get('/runtime'),
        get('/repository'),
        get('/symbols'),
        get('/providers'),
        get('/neurotex'),
        get('/activity')
      ]);

      renderRuntime(runtime);
      renderRepository(repository);
      renderSymbols(symbols);
      renderProviders(providers);
      renderNeurotex(neurotex);
      renderActivity(activity);

      const status = $('#ciwu-workbench-live-status');

      if (status) {
        status.textContent =
          'Live read-only project telemetry online';
        status.classList.add('online');
      }
    } catch (error) {
      renderError(error);
    }
  }

  window.CIWU_WORKBENCH_LIVE = {
    state,
    refresh:boot
  };

  document.addEventListener(
    'DOMContentLoaded',
    boot
  );
})();
