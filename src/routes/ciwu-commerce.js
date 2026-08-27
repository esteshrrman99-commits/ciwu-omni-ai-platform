'use strict';

const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();
router.use(express.json());

const ROOT = path.join(__dirname, '..', '..');

const PRODUCTS =
  path.join(ROOT, 'data', 'commerce', 'products.json');

function readCatalog() {
  return JSON.parse(
    fs.readFileSync(PRODUCTS, 'utf8')
  );
}

function sanitize(p) {
  return {
    id: p.id,
    sku: p.sku,
    name: p.name,
    subtitle: p.subtitle,
    category: p.category,
    state: p.state,
    sale_enabled: Boolean(p.sale_enabled),
    currency: p.currency,
    price_cents: p.price_cents,
    supplier: p.supplier,
    formula_state: p.formula?.state || 'UNKNOWN',
    quality: p.quality,
    release: p.release
  };
}

router.get('/health', (req, res) => {
  try {
    const catalog = readCatalog();

    res.json({
      ok: true,
      module: 'CIWU_PRIVATE_LABEL_COMMERCE',
      catalog_state: catalog.catalog_state,
      product_count: catalog.products.length,
      payment_provider:
        process.env.STRIPE_SECRET_KEY
          ? 'CONFIGURED'
          : 'UNCONFIGURED',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    res.status(500).json({
      ok: false,
      error: 'COMMERCE_CATALOG_UNAVAILABLE'
    });
  }
});

router.get('/products', (req, res) => {
  try {
    const catalog = readCatalog();

    res.json({
      state: catalog.catalog_state,
      products: catalog.products.map(sanitize)
    });

  } catch (error) {
    res.status(500).json({
      error: 'PRODUCT_CATALOG_UNAVAILABLE'
    });
  }
});

router.get('/products/:id', (req, res) => {
  try {
    const product =
      readCatalog().products.find(
        item => item.id === req.params.id
      );

    if (!product) {
      return res.status(404).json({
        error: 'PRODUCT_NOT_FOUND'
      });
    }

    res.json(sanitize(product));

  } catch (error) {
    res.status(500).json({
      error: 'PRODUCT_CATALOG_UNAVAILABLE'
    });
  }
});

router.post('/checkout', async (req, res) => {
  try {
    const productId = req.body?.productId;

    const product =
      readCatalog().products.find(
        item => item.id === productId
      );

    if (!product) {
      return res.status(404).json({
        error: 'PRODUCT_NOT_FOUND'
      });
    }

    const r = product.release || {};

    const releaseVerified =
      product.state === 'ACTIVE' &&
      product.sale_enabled === true &&
      r.supplier_authorized === true &&
      r.formula_verified === true &&
      r.coa_verified === true &&
      r.manufacturer_verified === true &&
      r.label_verified === true &&
      r.commercial_release_verified === true;

    if (!releaseVerified) {
      return res.status(409).json({
        error: 'PRODUCT_NOT_RELEASED',
        state: product.state,
        message:
          'Product remains in development and cannot be purchased yet.'
      });
    }

    const stripeSecret =
      process.env.STRIPE_SECRET_KEY;

    const stripePrice =
      process.env[product.stripe_price_env];

    if (!stripeSecret || !stripePrice) {
      return res.status(503).json({
        error: 'PAYMENT_PROVIDER_UNCONFIGURED'
      });
    }

    const Stripe = require('stripe');
    const stripe = new Stripe(stripeSecret);

    const baseUrl =
      process.env.PUBLIC_BASE_URL ||
      `${req.protocol}://${req.get('host')}`;

    const session =
      await stripe.checkout.sessions.create({
        mode: 'payment',

        line_items: [
          {
            price: stripePrice,
            quantity: 1
          }
        ],

        success_url:
          `${baseUrl}/?commerce=success`,

        cancel_url:
          `${baseUrl}/?commerce=cancelled`
      });

    res.json({
      checkout_url: session.url
    });

  } catch (error) {
    console.error(
      '[CIWU COMMERCE]',
      error.message
    );

    res.status(500).json({
      error: 'CHECKOUT_FAILED'
    });
  }
});

module.exports = router;
