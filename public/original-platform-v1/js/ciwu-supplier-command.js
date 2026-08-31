(() => {
  'use strict';

  const $ = id =>
    document.getElementById(id);

  const esc = value =>
    String(value ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');

  function boolLabel(value) {
    return value ? 'PASS' : 'PENDING';
  }

  async function loadDashboard() {
    const status =
      $('ciwu-sc-status');

    const rows =
      $('ciwu-sc-rows');

    try {
      const response =
        await fetch(
          '/api/m12/dashboard',
          {
            headers: {
              Accept:
                'application/json'
            }
          }
        );

      if (!response.ok) {
        throw new Error(
          `HTTP ${response.status}`
        );
      }

      const data =
        await response.json();

      $('ciwu-sc-suppliers').textContent =
        data.suppliers.length;

      $('ciwu-sc-verified').textContent =
        data.suppliers.filter(
          x => x.evidence_complete
        ).length;

      $('ciwu-sc-responses').textContent =
        data.suppliers.reduce(
          (sum,x) =>
            sum + x.responses,
          0
        );

      $('ciwu-sc-documents').textContent =
        data.suppliers.reduce(
          (sum,x) =>
            sum + x.documents,
          0
        );

      $('ciwu-sc-purchase').textContent =
        data.controls
          .purchase_authorization;

      $('ciwu-sc-sales').textContent =
        data.controls.sales;

      rows.innerHTML =
        data.suppliers.map(
          supplier => {
            const gates =
              supplier.gates || {};

            return `
              <tr>
                <td>
                  <strong>
                    ${esc(supplier.name)}
                  </strong>
                </td>

                <td>
                  <span class="ciwu-sc-state">
                    ${esc(supplier.research_state)}
                  </span>
                </td>

                <td>
                  ${supplier.advertised_moq ?? 'UNVERIFIED'}
                </td>

                <td>
                  ${supplier.responses}
                </td>

                <td>
                  ${supplier.documents}
                </td>

                <td>
                  ${boolLabel(gates.gmp_verified)}
                </td>

                <td>
                  ${boolLabel(gates.coa_verified)}
                </td>

                <td>
                  <span class="ciwu-sc-score">
                    ${supplier.evidence_score}/100
                  </span>
                </td>

                <td>
                  <button
                    class="ciwu-sc-btn"
                    data-rfq="${esc(supplier.id)}">
                    RFQ
                  </button>
                </td>
              </tr>
            `;
          }
        ).join('');

      document
        .querySelectorAll(
          '[data-rfq]'
        )
        .forEach(button => {
          button.addEventListener(
            'click',
            () =>
              loadRFQ(
                button.dataset.rfq
              )
          );
        });

      status.textContent =
        `Command center: ${data.state}`;

    } catch (error) {
      status.textContent =
        'Supplier command center unavailable.';

      rows.innerHTML =
        '<tr><td colspan="9">API OFFLINE</td></tr>';
    }
  }

  async function loadRFQ(
    supplierId
  ) {
    const output =
      $('ciwu-sc-rfq-output');

    output.textContent =
      'Loading RFQ...';

    try {
      const response =
        await fetch(
          `/api/m12/rfq/${encodeURIComponent(supplierId)}?quantity=1000`
        );

      if (!response.ok) {
        throw new Error(
          `HTTP ${response.status}`
        );
      }

      output.textContent =
        await response.text();

      $('ciwu-sc-rfq-open')
        .setAttribute(
          'href',
          `/api/m12/rfq/${encodeURIComponent(supplierId)}?quantity=1000`
        );

    } catch {
      output.textContent =
        'RFQ unavailable.';
    }
  }

  async function loadReviewBoard() {
    const output =
      $('ciwu-sc-review-output');

    try {
      const response =
        await fetch(
          '/api/m12/review-board'
        );

      const data =
        await response.json();

      output.textContent =
        JSON.stringify(
          {
            suppliers_ready_for_review:
              data
                .suppliers_ready_for_review
                .map(x => x.name),

            completed_reviews:
              data.review_ledger.length,

            purchase_authorization:
              'DISABLED',

            po_submission:
              'DISABLED',

            payment:
              'DISABLED',

            sales:
              'DISABLED'
          },
          null,
          2
        );

    } catch {
      output.textContent =
        'Review board unavailable.';
    }
  }

  document.addEventListener(
    'DOMContentLoaded',
    () => {
      loadDashboard();
      loadReviewBoard();

      const refresh =
        $('ciwu-sc-refresh');

      if (refresh) {
        refresh.addEventListener(
          'click',
          () => {
            loadDashboard();
            loadReviewBoard();
          }
        );
      }

      loadRFQ('prohealth');
    }
  );
})();
