(() => {
  'use strict';

  const VERSION = '3.6.0';

  const $ =
    id =>
      document.getElementById(id);

  function findM3() {
    return (
      document.querySelector(
        '#m3-console'
      ) ||
      document.querySelector(
        '.m3-console'
      ) ||
      document.querySelector(
        '#m3Console'
      ) ||
      document.querySelector(
        '[data-m3-console]'
      ) ||
      document.querySelector(
        '[id*="m3-console"]'
      )
    );
  }

  function installSystemBar() {
    if (
      $('ciwu-v36-systembar')
    ) {
      return;
    }

    const bar =
      document.createElement(
        'div'
      );

    bar.id =
      'ciwu-v36-systembar';

    bar.innerHTML = `
      <div class="ciwu-v36-brand">
        <span class="ciwu-v36-orb"></span>
        <span class="ciwu-v36-title">
          CIWU OMNI INTELLIGENCE
        </span>
      </div>

      <div
        class="ciwu-v36-status"
        id="ciwu-v36-status"
      >
        CONNECTING
      </div>
    `;

    const header =
      document.querySelector(
        '.header'
      ) ||
      document.querySelector(
        'header'
      ) ||
      document.body.firstChild;

    if (
      header &&
      header.parentNode
    ) {
      header.parentNode.insertBefore(
        bar,
        header.nextSibling
      );
    } else {
      document.body.prepend(
        bar
      );
    }

    refreshSystemStatus();
  }

  async function refreshSystemStatus() {
    const status =
      $('ciwu-v36-status');

    if (!status) {
      return;
    }

    try {
      const results =
        await Promise.all([
          fetch(
            '/api/eons/status'
          ),
          fetch(
            '/api/abijah/status'
          )
        ]);

      if (
        results.every(
          r => r.ok
        )
      ) {
        status.textContent =
          '● SYSTEM ONLINE';

        status.style.color =
          '#18e6a0';

        return;
      }

      throw new Error(
        'service unavailable'
      );

    } catch (_) {
      status.textContent =
        '● DEGRADED';

      status.style.color =
        '#ff647c';
    }
  }

  function installM3Toggle() {
    const panel =
      findM3();

    if (!panel) {
      setTimeout(
        installM3Toggle,
        500
      );

      return;
    }

    if (
      panel.dataset
        .ciwuV36Installed ===
      '1'
    ) {
      return;
    }

    panel.dataset
      .ciwuV36Installed =
      '1';

    const existing =
      document.getElementById(
        'm2-m3-toggle'
      );

    if (existing) {
      existing.remove();
    }

    const toggle =
      document.createElement(
        'button'
      );

    toggle.type =
      'button';

    toggle.id =
      'ciwu-m3-toggle';

    const mobile =
      matchMedia(
        '(max-width:720px)'
      ).matches;

    if (mobile) {
      panel.classList.add(
        'ciwu-m3-collapsed'
      );

      toggle.textContent =
        'M3 ↑';
    } else {
      toggle.textContent =
        'MINIMIZE';
    }

    toggle.addEventListener(
      'click',
      event => {
        event.preventDefault();
        event.stopPropagation();

        const collapsed =
          panel.classList.toggle(
            'ciwu-m3-collapsed'
          );

        toggle.textContent =
          collapsed
            ? 'M3 ↑'
            : 'MINIMIZE';
      }
    );

    panel.appendChild(
      toggle
    );

    moveTelemetry(panel);
  }

  function moveTelemetry(panel) {
    if (!panel) {
      return;
    }

    const candidates =
      Array.from(
        document.querySelectorAll(
          'body *'
        )
      )
      .filter(el => {
        if (
          el === panel ||
          panel.contains(el)
        ) {
          return false;
        }

        const text =
          (
            el.textContent ||
            ''
          )
            .replace(
              /\s+/g,
              ' '
            )
            .trim()
            .toUpperCase();

        return (
          text.includes(
            'EONS CORTEX: ONLINE'
          ) &&
          text.includes(
            'CAPABILITIES:'
          )
        );
      })
      .sort(
        (a,b) =>
          (
            a.textContent ||
            ''
          ).length -
          (
            b.textContent ||
            ''
          ).length
      );

    if (
      !candidates.length
    ) {
      return;
    }

    const telemetry =
      candidates[0];

    telemetry.classList.add(
      'ciwu-v36-telemetry'
    );

    panel.appendChild(
      telemetry
    );
  }

  function cleanLegacyOutput() {
    const output =
      $('chatOut');

    if (!output) {
      return;
    }

    const text =
      (
        output.textContent ||
        ''
      ).toUpperCase();

    const legacy =
      [
        'ANALYZING CONTEXT',
        'KNOWLEDGE GRAPH READY',
        'MONTHLY COST:',
        'CONFIDENCE:',
        'PRIVACY CONTROLS ACTIVE',
        'METABOLIC DISORDER PROTOCOL'
      ];

    const found =
      legacy.some(
        phrase =>
          text.includes(
            phrase
          )
      );

    if (!found) {
      return;
    }

    output.innerHTML = `
      <div class="ciwu-ready-state">
        <div class="ciwu-ready-icon">
          ✦
        </div>

        <div>
          <strong>
            Abijah is ready.
          </strong>

          <span>
            Ask a question naturally.
            I can explain health information,
            treatment categories, lab values,
            risks and next steps in plain language.
          </span>
        </div>
      </div>
    `;
  }

  function markZeroMetrics() {
    const nodes =
      Array.from(
        document.querySelectorAll(
          'body *'
        )
      );

    for (
      const el
      of nodes
    ) {
      if (
        el.children.length
      ) {
        continue;
      }

      const value =
        (
          el.textContent ||
          ''
        ).trim();

      if (
        value !== '0'
      ) {
        continue;
      }

      const parentText =
        (
          el.parentElement
            ?.textContent ||
          ''
        ).toUpperCase();

      if (
        /NODES|FACTS|ENTITIES|RELATIONS|UNITS/
          .test(parentText)
      ) {
        el.classList.add(
          'ciwu-zero-muted'
        );
      }
    }
  }

  function improveAccessibility() {
    const output =
      $('chatOut');

    if (output) {
      output.setAttribute(
        'role',
        'status'
      );

      output.setAttribute(
        'aria-live',
        'polite'
      );
    }

    document
      .querySelectorAll(
        'button'
      )
      .forEach(button => {
        if (
          !button
            .getAttribute(
              'type'
            )
        ) {
          button.setAttribute(
            'type',
            'button'
          );
        }
      });
  }

  function boot() {
    installSystemBar();

    installM3Toggle();

    cleanLegacyOutput();

    markZeroMetrics();

    improveAccessibility();

    setTimeout(
      () => {
        const panel =
          findM3();

        if (panel) {
          moveTelemetry(
            panel
          );
        }

        cleanLegacyOutput();
      },
      1100
    );

    setInterval(
      refreshSystemStatus,
      60000
    );

    window.CIWU_V36 = {
      version:
        VERSION,

      refreshSystemStatus,

      cleanLegacyOutput
    };

    console.log(
      'CIWU OMNI v3.6 UI active'
    );
  }

  if (
    document.readyState ===
    'loading'
  ) {
    document.addEventListener(
      'DOMContentLoaded',
      boot
    );
  } else {
    boot();
  }
})();
