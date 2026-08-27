'use strict';

const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();

const ROOT =
  path.join(__dirname, '..', '..');

const POLICY =
  path.join(
    ROOT,
    'data',
    'product-engine',
    'acquisition',
    'm18',
    'policy.json'
  );

const STATE =
  path.join(
    ROOT,
    'data',
    'product-engine',
    'acquisition',
    'm18',
    'state',
    'runtime.json'
  );

function read(file) {
  return JSON.parse(
    fs.readFileSync(file, 'utf8')
  );
}

router.get('/health', (req, res) => {
  try {
    const policy = read(POLICY);
    const state = read(STATE);

    res.json({
      ok: true,

      module:
        'CIWU_SUPPLIER_RESPONSE_LIFECYCLE',

      transaction_id:
        state.transaction_id,

      supplier:
        state.supplier,

      transmission:
        state.transmission,

      delivery:
        state.delivery,

      read:
        state.read,

      response:
        state.response,

      evidence_complete:
        state.evidence_complete,

      supplier_qualified:
        state.supplier_qualified,

      procurement_authorized:
        false,

      purchase_authorized:
        false,

      po_submission_enabled:
        false,

      payment_enabled:
        false,

      sales_enabled:
        false,

      hard_gate_count:
        policy.qualification_gates.length,

      timestamp:
        new Date().toISOString()
    });

  } catch {
    res.status(500).json({
      ok: false,
      error:
        'M18_RESPONSE_LIFECYCLE_UNAVAILABLE'
    });
  }
});

router.get('/status', (req, res) => {
  const state = read(STATE);

  res.json({
    ...state,

    truth_model: {
      sent_is_delivered:
        false,

      sent_is_received:
        false,

      sent_is_response:
        false,

      response_requires_real_artifact:
        true,

      qualification_requires_verified_evidence:
        true
    },

    commercial_controls: {
      quote_acceptance:
        'DISABLED',

      purchase_authorization:
        'DISABLED',

      po_submission:
        'DISABLED',

      payment:
        'DISABLED',

      sales:
        'HARD_DISABLED'
    }
  });
});

router.post('/response/fabricate', (req, res) => {
  res.status(403).json({
    error:
      'FABRICATED_RESPONSE_FORBIDDEN'
  });
});

router.post('/purchase-authorize', (req, res) => {
  res.status(403).json({
    error:
      'PURCHASE_AUTHORIZATION_DISABLED'
  });
});

module.exports = router;
