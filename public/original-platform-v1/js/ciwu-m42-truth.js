(() => {
  'use strict';

  const VERSION = '4.2.0';

  const state = {
    endpoints: {},
    lastRefresh: null,
    refreshing: false
  };

  const endpointMap = {
    stats: '/api/stats',
    eons: '/api/eons/status',
    models: '/api/eons-models/status',
    availableModels: '/api/eons-models/available',
    abijah: '/api/abijah/status'
  };

  function esc(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function num(value) {
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  }

  function firstNumber(...values) {
    for (const value of values) {
      const n = num(value);
      if (n !== null) return n;
    }
    return null;
  }

  function label(value) {
    if (
      value === undefined ||
      value === null ||
      value === ''
    ) {
      return 'NOT REPORTED';
    }

    return String(value);
  }

  async function getJSON(url) {
    const controller =
      new AbortController();

    const timer =
      setTimeout(
        () => controller.abort(),
        8000
      );

    try {
      const response =
        await fetch(
          url,
          {
            cache: 'no-store',
            headers: {
              Accept: 'application/json'
            },
            signal: controller.signal
          }
        );

      const text =
        await response.text();

      let json = null;

      try {
        json =
          text
            ? JSON.parse(text)
            : null;
      } catch (_) {}

      return {
        ok: response.ok,
        status: response.status,
        json,
        text
      };
    } catch (error) {
      return {
        ok: false,
        status: 0,
        json: null,
        text: '',
        error:
          error?.name === 'AbortError'
            ? 'TIMEOUT'
            : String(
                error?.message ||
                'UNAVAILABLE'
              )
      };
    } finally {
      clearTimeout(timer);
    }
  }

  function statusClass(item) {
    if (item?.ok) {
      return 'm42-live';
    }

    if (item?.status > 0) {
      return 'm42-degraded';
    }

    return 'm42-offline';
  }

  function statusText(item) {
    if (item?.ok) {
      return 'LIVE';
    }

    if (item?.status > 0) {
      return `HTTP ${item.status}`;
    }

    return 'UNAVAILABLE';
  }

  function modelCount() {
    const a =
      state.endpoints.availableModels?.json;

    const b =
      state.endpoints.models?.json;

    if (Array.isArray(a)) {
      return a.length;
    }

    if (Array.isArray(a?.models)) {
      return a.models.length;
    }

    if (Array.isArray(a?.available)) {
      return a.available.length;
    }

    return firstNumber(
      a?.count,
      a?.modelCount,
      b?.count,
      b?.modelCount,
      b?.models?.length
    );
  }

  function providerCount() {
    const a =
      state.endpoints.availableModels?.json;

    const b =
      state.endpoints.models?.json;

    return firstNumber(
      a?.providerCount,
      a?.providers?.length,
      b?.providerCount,
      b?.providers?.length
    );
  }

  function statsEntityCount() {
    const x =
      state.endpoints.stats?.json;

    return firstNumber(
      x?.entities,
      x?.entityCount,
      x?.stats?.entities,
      x?.knowledge?.entities
    );
  }

  function statsRelationCount() {
    const x =
      state.endpoints.stats?.json;

    return firstNumber(
      x?.relations,
      x?.relationCount,
      x?.stats?.relations,
      x?.knowledge?.relations
    );
  }

  function capabilityCount() {
    const a =
      state.endpoints.abijah?.json;

    const b =
      state.endpoints.eons?.json;

    if (
      a?.abijah?.capabilities &&
      typeof a.abijah.capabilities === 'object'
    ) {
      return Object.values(
        a.abijah.capabilities
      ).filter(Boolean).length;
    }

    return firstNumber(
      b?.capabilities?.length,
      b?.capabilityCount
    );
  }

  function evidenceRows() {
    return Object.entries(
      endpointMap
    ).map(([key, url]) => {
      const item =
        state.endpoints[key] || {};

      return `
        <div class="m42-endpoint-row">
          <div>
            <strong>${esc(key)}</strong>
            <small>${esc(url)}</small>
          </div>
          <span class="${statusClass(item)}">
            ${esc(statusText(item))}
          </span>
        </div>
      `;
    }).join('');
  }

  function metric(
    title,
    value,
    fallback = 'NOT REPORTED'
  ) {
    const shown =
      value === null ||
      value === undefined
        ? fallback
        : value;

    const verified =
      value !== null &&
      value !== undefined;

    return `
      <div class="m42-metric">
        <span>${esc(title)}</span>
        <strong>${esc(shown)}</strong>
        <small>
          ${
            verified
              ? 'API-DERIVED'
              : 'NO VERIFIED VALUE'
          }
        </small>
      </div>
    `;
  }

  function installPanel() {
    let panel =
      document.getElementById(
        'ciwu-m42-truth-panel'
      );

    if (panel) {
      return panel;
    }

    panel =
      document.createElement('section');

    panel.id =
      'ciwu-m42-truth-panel';

    panel.setAttribute(
      'aria-label',
      'CIWU live evidence telemetry'
    );

    panel.innerHTML = `
      <div class="m42-shell">
        <div class="m42-head">
          <div>
            <small>
              CIWU OMNI • M4.2
            </small>

            <h2>
              EVIDENCE INTELLIGENCE
            </h2>

            <p>
              Live runtime truth from connected
              CIWU services.
            </p>
          </div>

          <div class="m42-live-pill">
            <span></span>
            TRUTH TELEMETRY
          </div>
        </div>

        <div
          id="m42-metrics"
          class="m42-grid"
        ></div>

        <div class="m42-evidence">
          <div class="m42-section-title">
            SERVICE PROVENANCE
          </div>

          <div id="m42-endpoints">
            Loading…
          </div>
        </div>

        <div class="m42-foot">
          <span id="m42-refresh-time">
            Waiting for live evidence…
          </span>

          <button
            type="button"
            id="m42-refresh"
          >
            ↻ REFRESH TRUTH
          </button>
        </div>
      </div>
    `;

    const preferredAnchor =
      document.querySelector(
        '#abijah-workspace, ' +
        '.abijah-workspace, ' +
        '#abijahWorkspace'
      );

    if (preferredAnchor) {
      preferredAnchor.parentNode
        .insertBefore(
          panel,
          preferredAnchor
        );
    } else {
      document.body.appendChild(
        panel
      );
    }

    document
      .getElementById('m42-refresh')
      ?.addEventListener(
        'click',
        refresh
      );

    return panel;
  }

  function render() {
    installPanel();

    const metrics =
      document.getElementById(
        'm42-metrics'
      );

    if (metrics) {
      metrics.innerHTML =
        metric(
          'MODELS',
          modelCount()
        ) +
        metric(
          'PROVIDERS',
          providerCount()
        ) +
        metric(
          'ENTITIES',
          statsEntityCount()
        ) +
        metric(
          'RELATIONS',
          statsRelationCount()
        ) +
        metric(
          'ABIJAH CAPABILITIES',
          capabilityCount()
        );
    }

    const endpoints =
      document.getElementById(
        'm42-endpoints'
      );

    if (endpoints) {
      endpoints.innerHTML =
        evidenceRows();
    }

    const stamp =
      document.getElementById(
        'm42-refresh-time'
      );

    if (stamp) {
      stamp.textContent =
        state.lastRefresh
          ? `Evidence refreshed ${state.lastRefresh.toLocaleTimeString()}`
          : 'Waiting for live evidence…';
    }
  }

  function suppressUnsupportedCounters() {
    const nodes =
      Array.from(
        document.querySelectorAll(
          'body *'
        )
      );

    for (const el of nodes) {
      if (
        el.children.length !== 0
      ) {
        continue;
      }

      const text =
        String(
          el.textContent || ''
        ).trim();

      if (
        /^(MODELS|PROVIDERS|ENTITIES|RELATIONS|FACTS|NODES|UNITS)\s*:\s*0$/i
          .test(text)
      ) {
        el.dataset.m42LegacyMetric =
          'suppressed';

        el.textContent =
          text.replace(
            /:\s*0$/,
            ': NOT VERIFIED'
          );
      }
    }
  }

  async function refresh() {
    if (state.refreshing) {
      return;
    }

    state.refreshing = true;

    const button =
      document.getElementById(
        'm42-refresh'
      );

    if (button) {
      button.disabled = true;
      button.textContent =
        '↻ VERIFYING…';
    }

    const results =
      await Promise.all(
        Object.entries(
          endpointMap
        ).map(
          async ([key, url]) => {
            const result =
              await getJSON(url);

            return [
              key,
              result
            ];
          }
        )
      );

    state.endpoints =
      Object.fromEntries(
        results
      );

    state.lastRefresh =
      new Date();

    state.refreshing = false;

    suppressUnsupportedCounters();
    render();

    if (button) {
      button.disabled = false;
      button.textContent =
        '↻ REFRESH TRUTH';
    }

    window.dispatchEvent(
      new CustomEvent(
        'ciwu:m42-truth-updated',
        {
          detail: {
            version: VERSION,
            endpoints:
              state.endpoints
          }
        }
      )
    );
  }

  function boot() {
    installPanel();

    suppressUnsupportedCounters();

    refresh();

    setInterval(
      refresh,
      60000
    );
  }

  window.CIWUM42Truth = {
    version: VERSION,
    refresh,
    state
  };

  if (
    document.readyState ===
    'loading'
  ) {
    document.addEventListener(
      'DOMContentLoaded',
      boot,
      { once: true }
    );
  } else {
    boot();
  }
})();
