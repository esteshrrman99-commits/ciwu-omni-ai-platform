'use strict';

const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();

router.use(
  express.json({
    limit: '2mb'
  })
);

const ROOT =
  path.join(__dirname, '..', '..');

const PROHEALTH =
  path.join(
    ROOT,
    'data',
    'product-engine',
    'acquisition',
    'suppliers',
    'prohealth.json'
  );

const TARGET =
  path.join(
    ROOT,
    'data',
    'product-engine',
    'acquisition',
    'target-spec',
    'ciwu-cellular-vitality.json'
  );

function read(file) {
  return JSON.parse(
    fs.readFileSync(file, 'utf8')
  );
}

router.get('/health', (req, res) => {
  try {
    const supplier =
      read(PROHEALTH);

    res.json({
      ok: true,

      module:
        'CIWU_REAL_SUPPLIER_ACQUISITION',

      supplier:
        supplier.name,

      public_private_label_capability:
        supplier
          .public_capabilities
          .private_label_inquiry,

      ciwu_authorization:
        supplier
          .ciwu_relationship
          .private_label_authorization_verified,

      email_send_enabled:
        false,

      procurement_enabled:
        false,

      sales_enabled:
        false,

      timestamp:
        new Date().toISOString()
    });

  } catch {
    res.status(500).json({
      ok: false,
      error:
        'M7_ENGINE_UNAVAILABLE'
    });
  }
});

router.get('/suppliers/prohealth', (req, res) => {
  res.json(
    read(PROHEALTH)
  );
});

router.get('/target-spec', (req, res) => {
  res.json(
    read(TARGET)
  );
});

router.get('/rfq/prohealth', (req, res) => {

  const supplier =
    read(PROHEALTH);

  const target =
    read(TARGET);

  const body = [
    'Subject: Private Label / Wholesale Inquiry — CIWU Cellular Vitality',
    '',
    'Hello ProHealth Wholesale Team,',
    '',
    'CIWU is evaluating a private-label longevity supplement product currently in development under the working name CIWU Cellular Vitality.',
    '',
    'We are interested in learning about ProHealth Longevity wholesale, private-label, co-branding, and custom formulation opportunities.',
    '',
    'Please provide information regarding:',
    ...target.requested_supplier_information.map(
      item => `- ${item}`
    ),
    '',
    'We are especially interested in understanding which existing formulations may be available for private label and whether custom formulation is available.',
    '',
    'Please also provide any application requirements or business qualification criteria that must be completed before pricing and product documentation can be released.',
    '',
    'Any specifications, COAs, certifications, pricing, or authorization documents supplied will be reviewed and independently verified before procurement or commercial release.',
    '',
    'Thank you,',
    'CIWU Product Development'
  ].join('\n');

  res.json({
    supplier:
      supplier.name,

    to:
      supplier.wholesale_email,

    subject:
      'Private Label / Wholesale Inquiry — CIWU Cellular Vitality',

    body,

    state:
      'DRAFT_NOT_SENT',

    human_approval_required:
      true,

    sent:
      false
  });
});

router.post('/rfq/prohealth/send', (req, res) => {
  res.status(403).json({
    error:
      'EXTERNAL_EMAIL_SEND_DISABLED',

    state:
      'DRAFT_ONLY',

    human_approval_required:
      true
  });
});

router.get('/readiness', (req, res) => {

  const supplier =
    read(PROHEALTH);

  const gates = {
    public_private_label_capability:
      supplier
        .public_capabilities
        .private_label_inquiry
        === 'VERIFIED_PUBLIC',

    application_submitted:
      supplier
        .ciwu_relationship
        .application_submitted === true,

    ciwu_authorization:
      supplier
        .ciwu_relationship
        .private_label_authorization_verified === true,

    quote_received:
      supplier
        .ciwu_relationship
        .quote_received === true,

    formula_received:
      supplier
        .ciwu_relationship
        .formula_received === true,

    coa_received:
      supplier
        .ciwu_relationship
        .coa_received === true,

    gmp_evidence_received:
      supplier
        .ciwu_relationship
        .gmp_evidence_received === true,

    manufacturer_identity_received:
      supplier
        .ciwu_relationship
        .manufacturer_identity_received === true
  };

  const procurementReady =
    Object.values(gates)
      .every(Boolean);

  res.json({
    gates,

    supplier_contact_ready:
      gates.public_private_label_capability,

    procurement_ready:
      procurementReady,

    procurement_state:
      procurementReady
        ? 'READY_FOR_VERIFICATION_REVIEW'
        : 'BLOCKED',

    purchase_authorized:
      false,

    sales_enabled:
      false
  });
});

module.exports = router;
