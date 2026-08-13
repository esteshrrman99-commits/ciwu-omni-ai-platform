(() => {
  'use strict';

  const rootId =
    'eons-m54-orchestration';

  function text(value) {
    if (
      value === null ||
      value === undefined ||
      value === ''
    ) {
      return 'NOT REPORTED';
    }

    return String(value);
  }

  function card(metric) {
    const el =
      document.createElement('div');

    el.className =
      'm54-card';

    const label =
      document.createElement('div');

    label.className =
      'm54-label';

    label.textContent =
      metric.label ||
      metric.id ||
      'Metric';

    const value =
      document.createElement('div');

    value.className =
      'm54-value';

    value.textContent =
      text(metric.value);

    const state =
      document.createElement('div');

    state.className =
      'm54-state';

    state.dataset.state =
      metric.state ||
      'UNVERIFIED';

    state.textContent =
      metric.state ||
      'UNVERIFIED';

    el.append(
      label,
      value,
      state
    );

    if (
      metric.note ||
      metric.source
    ) {
      const note =
        document.createElement('div');

      note.className =
        'm54-note';

      note.textContent =
        metric.note ||
        `Source: ${metric.source}`;

      el.append(note);
    }

    return el;
  }

  async function refresh() {
    const root =
      document.getElementById(
        rootId
      );

    if (!root) {
      return;
    }

    const grid =
      root.querySelector(
        '.m54-grid'
      );

    if (!grid) {
      return;
    }

    grid.innerHTML =
      '<div class="m54-card">Loading verified runtime evidence…</div>';

    try {
      const response =
        await fetch(
          '/api/eons/production-truth/status',
          {
            cache: 'no-store'
          }
        );

      if (!response.ok) {
        throw new Error(
          `HTTP ${response.status}`
        );
      }

      const data =
        await response.json();

      const metrics =
        Array.isArray(data.metrics)
          ? data.metrics
          : [];

      grid.innerHTML = '';

      if (!metrics.length) {
        grid.innerHTML =
          '<div class="m54-card">No verified runtime metrics returned.</div>';

        return;
      }

      metrics.forEach(
        metric =>
          grid.append(
            card(metric)
          )
      );

    } catch (error) {
      grid.innerHTML =
        '<div class="m54-card">Production truth endpoint unavailable. No values were fabricated.</div>';
    }
  }

  function mount() {
    if (
      document.getElementById(
        rootId
      )
    ) {
      refresh();
      return;
    }

    const root =
      document.createElement(
        'section'
      );

    root.id =
      rootId;

    root.innerHTML = `
      <div class="m54-kicker">
        EONS • M5.4
      </div>

      <h2 class="m54-title">
        Evidence Orchestration Matrix
      </h2>

      <p class="m54-subtitle">
        Runtime facts are separated from
        research, simulation and
        unverified claims. Missing data
        remains missing instead of being
        converted into fake metrics.
      </p>

      <div class="m54-grid"></div>

      <button
        class="m54-refresh"
        type="button"
      >
        REFRESH VERIFIED EVIDENCE
      </button>
    `;

    const target =
      document.querySelector(
        'main'
      ) ||
      document.body;

    target.prepend(root);

    root
      .querySelector(
        '.m54-refresh'
      )
      ?.addEventListener(
        'click',
        refresh
      );

    refresh();
  }

  if (
    document.readyState ===
    'loading'
  ) {
    document.addEventListener(
      'DOMContentLoaded',
      mount
    );
  } else {
    mount();
  }

  window.CIWUM54 = {
    refresh
  };
})();
