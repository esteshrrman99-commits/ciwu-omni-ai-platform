(() => {
  'use strict';

  async function loadProductEngine() {
    const gates =
      document.getElementById(
        'ciwu-product-engine-gates'
      );

    const status =
      document.getElementById(
        'ciwu-product-engine-status'
      );

    if (!gates) return;

    try {
      const response =
        await fetch(
          '/api/product-engine/qualification'
        );

      if (!response.ok) {
        throw new Error(
          `HTTP ${response.status}`
        );
      }

      const data =
        await response.json();

      gates.innerHTML =
        Object.entries(data.gates)
          .map(([name, pass]) => `
            <div class="ciwu-engine-card">
              <strong>
                ${name.toUpperCase()}
              </strong>
              <div class="${
                pass
                  ? 'ciwu-engine-pass'
                  : 'ciwu-engine-fail'
              }">
                ${
                  pass
                    ? 'VERIFIED'
                    : 'NOT VERIFIED'
                }
              </div>
            </div>
          `)
          .join('');

      status.textContent =
        `Product: ${data.state} • ` +
        `Commercial release: ${
          data.commercial_release
            ? 'ELIGIBLE'
            : 'BLOCKED'
        } • Sales: DISABLED`;

    } catch {
      gates.innerHTML =
        '<div class="ciwu-engine-card">' +
        'Qualification engine unavailable.' +
        '</div>';

      status.textContent =
        'Product engine: OFFLINE';
    }
  }

  document.addEventListener(
    'DOMContentLoaded',
    loadProductEngine
  );
})();
