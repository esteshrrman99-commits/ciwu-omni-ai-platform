'use strict';

const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();
router.use(express.json());

const ROOT = path.join(__dirname, '..', '..');

const FILES = {
  supplier: path.join(ROOT, 'data', 'product-engine', 'supplier.json'),
  formula: path.join(ROOT, 'data', 'product-engine', 'formula.json'),
  coa: path.join(ROOT, 'data', 'product-engine', 'coa', 'requirements.json'),
  label: path.join(ROOT, 'data', 'product-engine', 'labels', 'label.json'),
  cost: path.join(ROOT, 'data', 'product-engine', 'cost.json')
};

function readJSON(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function yes(value) {
  return value === true;
}

function evaluate() {
  const supplier = readJSON(FILES.supplier);
  const formula = readJSON(FILES.formula);
  const coa = readJSON(FILES.coa);
  const label = readJSON(FILES.label);
  const cost = readJSON(FILES.cost);

  const gates = {
    supplier:
      supplier.state === 'VERIFIED' &&
      yes(supplier.authorization?.private_label_relationship_verified) &&
      yes(supplier.authorization?.authorized_for_ciwu_brand) &&
      yes(supplier.manufacturing?.manufacturer_identity_verified),

    formula:
      formula.formula_state === 'VERIFIED' &&
      yes(formula.verification?.supplier_formula_received) &&
      yes(formula.verification?.formula_matches_target) &&
      yes(formula.verification?.ingredient_amounts_verified) &&
      yes(formula.verification?.final_formula_approved),

    coa:
      coa.coa_state === 'VERIFIED' &&
      yes(coa.acceptance?.coa_received) &&
      yes(coa.acceptance?.lot_matches_product) &&
      yes(coa.acceptance?.results_within_specification) &&
      yes(coa.acceptance?.coa_approved),

    label:
      label.label_state === 'APPROVED' &&
      yes(label.approval?.formula_matches_label) &&
      yes(label.approval?.regulatory_review_complete) &&
      yes(label.approval?.label_artwork_approved) &&
      yes(label.approval?.commercial_label_release),

    cost:
      cost.state === 'COMPLETE' &&
      Number.isInteger(cost.commercial?.total_landed_cost_cents) &&
      Number.isInteger(cost.commercial?.planned_retail_price_cents)
  };

  const commercialRelease =
    Object.values(gates).every(Boolean);

  return {
    product: 'CIWU Cellular Vitality',
    state:
      commercialRelease
        ? 'RELEASE_ELIGIBLE'
        : 'DEVELOPMENT',
    gates,
    commercial_release: commercialRelease,

    // Deliberately independent from qualification.
    // Qualification must never silently enable commerce.
    sale_enabled: false,

    notice:
      commercialRelease
        ? 'Qualification complete; sales still require a separate deliberate release action.'
        : 'Qualification evidence incomplete.'
  };
}

router.get('/health', (req, res) => {
  try {
    const result = evaluate();

    res.json({
      ok: true,
      module: 'CIWU_PRODUCT_QUALIFICATION_ENGINE',
      product_state: result.state,
      commercial_release: result.commercial_release,
      sale_enabled: result.sale_enabled,
      timestamp: new Date().toISOString()
    });
  } catch {
    res.status(500).json({
      ok: false,
      module: 'CIWU_PRODUCT_QUALIFICATION_ENGINE',
      error: 'PRODUCT_ENGINE_UNAVAILABLE'
    });
  }
});

router.get('/qualification', (req, res) => {
  res.json(evaluate());
});

router.get('/supplier', (req, res) => {
  res.json(readJSON(FILES.supplier));
});

router.get('/formula', (req, res) => {
  res.json(readJSON(FILES.formula));
});

router.get('/coa', (req, res) => {
  res.json(readJSON(FILES.coa));
});

router.get('/label', (req, res) => {
  res.json(readJSON(FILES.label));
});

router.get('/cost', (req, res) => {
  res.json(readJSON(FILES.cost));
});

router.post('/cost/calculate', (req, res) => {
  const input = req.body || {};

  const fields = [
    'manufacturing_unit',
    'bottle_or_container',
    'closure',
    'label',
    'carton',
    'testing_allocated',
    'freight_allocated',
    'fulfillment',
    'payment_processing',
    'other'
  ];

  const values = {};

  for (const field of fields) {
    const value = input[field];

    if (!Number.isInteger(value) || value < 0) {
      return res.status(400).json({
        error: 'INVALID_COST_INPUT',
        field,
        requirement: 'non-negative integer cents'
      });
    }

    values[field] = value;
  }

  const retail = input.planned_retail_price_cents;

  if (!Number.isInteger(retail) || retail <= 0) {
    return res.status(400).json({
      error: 'INVALID_RETAIL_PRICE'
    });
  }

  const landed =
    Object.values(values)
      .reduce((sum, value) => sum + value, 0);

  const grossProfit = retail - landed;

  const margin =
    Number(
      ((grossProfit / retail) * 100)
        .toFixed(2)
    );

  res.json({
    currency: 'USD',
    inputs_cents: values,
    planned_retail_price_cents: retail,
    total_landed_cost_cents: landed,
    gross_profit_cents: grossProfit,
    gross_margin_percent: margin,
    state: 'DERIVED',
    warning:
      'Calculation only; supplier pricing and assumptions remain subject to verification.'
  });
});

module.exports = router;
