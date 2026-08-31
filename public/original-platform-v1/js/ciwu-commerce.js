(() => {
  'use strict';

  const escapeHTML = value =>
    String(value ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');

  async function loadProducts() {
    const grid =
      document.getElementById(
        'ciwu-commerce-products'
      );

    const status =
      document.getElementById(
        'ciwu-commerce-status'
      );

    if (!grid) return;

    try {
      const response =
        await fetch('/api/commerce/products');

      if (!response.ok) {
        throw new Error(
          `HTTP ${response.status}`
        );
      }

      const payload =
        await response.json();

      grid.innerHTML =
        payload.products.map(product => {

          const available =
            product.sale_enabled === true &&
            product.state === 'ACTIVE';

          return `
            <article class="ciwu-product-card">

              <span class="ciwu-product-state">
                ${escapeHTML(product.state)}
              </span>

              <h3>
                ${escapeHTML(product.name)}
              </h3>

              <p class="ciwu-product-meta">

                ${escapeHTML(product.subtitle)}

                <br><br>

                SKU:
                <strong>
                  ${escapeHTML(product.sku)}
                </strong>

                <br>

                Supplier:
                <strong>
                  ${escapeHTML(
                    product.supplier?.relationship
                  )}
                </strong>

                <br>

                Formula:
                <strong>
                  ${escapeHTML(
                    product.formula_state
                  )}
                </strong>

              </p>

              <button
                class="ciwu-buy"
                data-product="${escapeHTML(product.id)}"
                ${available ? '' : 'disabled'}>

                ${
                  available
                    ? 'Purchase'
                    : 'Verification Required'
                }

              </button>

            </article>
          `;
        }).join('');

      status.textContent =
        `Catalog: ${payload.state}`;

    } catch (error) {
      grid.innerHTML =
        '<article class="ciwu-product-card">' +
        'Product catalog unavailable.' +
        '</article>';

      status.textContent =
        'Commerce API: OFFLINE';
    }
  }

  document.addEventListener(
    'click',
    async event => {

      const button =
        event.target.closest(
          '.ciwu-buy[data-product]'
        );

      if (!button || button.disabled)
        return;

      const response =
        await fetch(
          '/api/commerce/checkout',
          {
            method: 'POST',
            headers: {
              'Content-Type':
                'application/json'
            },
            body: JSON.stringify({
              productId:
                button.dataset.product
            })
          }
        );

      const payload =
        await response.json();

      if (!response.ok) {
        alert(
          payload.message ||
          payload.error ||
          'Checkout unavailable.'
        );
        return;
      }

      if (payload.checkout_url) {
        location.href =
          payload.checkout_url;
      }
    }
  );

  document.addEventListener(
    'DOMContentLoaded',
    loadProducts
  );
})();
