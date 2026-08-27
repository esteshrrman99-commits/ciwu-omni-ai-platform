'use strict';

const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const router = express.Router();
router.use(express.json({ limit: '4mb' }));

const ROOT = path.join(__dirname, '..', '..');

const base = (...parts) =>
  path.join(
    ROOT,
    'data',
    'product-engine',
    'acquisition',
    'm10',
    ...parts
  );

const FILES = {
  rfqExports:
    base('rfq-exports', 'registry.json'),

  responses:
    base('responses', 'registry.json'),

  ledger:
    base('verification-ledger', 'ledger.json'),

  reviews:
    base('reviews', 'registry.json'),

  matrices:
    base('decision-matrix', 'registry.json'),

  dueDiligence:
    base('due-diligence', 'registry.json'),

  recommendations:
    base('recommendations', 'registry.json'),

  supplierMatrix:
    path.join(
      ROOT,
      'data',
      'product-engine',
      'acquisition',
      'm8',
      'suppliers',
      'matrix.json'
    ),

  m9Responses:
    path.join(
      ROOT,
      'data',
      'product-engine',
      'acquisition',
      'm9',
      'responses',
      'registry.json'
    ),

  m9Documents:
    path.join(
      ROOT,
      'data',
      'product-engine',
      'acquisition',
      'm9',
      'documents',
      'registry.json'
    ),

  m9Verification:
    path.join(
      ROOT,
      'data',
      'product-engine',
      'acquisition',
      'm9',
      'verification',
      'registry.json'
    ),

  m9Quotes:
    path.join(
      ROOT,
      'data',
      'product-engine',
      'acquisition',
      'm9',
      'quotes',
      'registry.json'
    ),

  m9Formulas:
    path.join(
      ROOT,
      'data',
      'product-engine',
      'acquisition',
      'm9',
      'formulas',
      'registry.json'
    )
};

function read(file) {
  return JSON.parse(
    fs.readFileSync(file, 'utf8')
  );
}

function write(file, data) {
  const tmp = `${file}.tmp-${process.pid}`;

  fs.writeFileSync(
    tmp,
    JSON.stringify(data, null, 2) + '\n',
    'utf8'
  );

  fs.renameSync(tmp, file);
}

function uid(prefix) {
  return (
    prefix +
    '-' +
    crypto.randomBytes(8)
      .toString('hex')
  );
}

function hash(value) {
  return crypto
    .createHash('sha256')
    .update(JSON.stringify(value))
    .digest('hex');
}

function supplierExists(id) {
  return read(FILES.supplierMatrix)
    .suppliers
    .some(x => x.id === id);
}

function supplierSnapshot(id) {
  const suppliers =
    read(FILES.supplierMatrix)
      .suppliers;

  const responses =
    read(FILES.m9Responses)
      .responses
      .filter(x => x.supplier_id === id);

  const documents =
    read(FILES.m9Documents)
      .documents
      .filter(x => x.supplier_id === id);

  const verification =
    read(FILES.m9Verification);

  const quote =
    read(FILES.m9Quotes)
      .quotes
      .find(x => x.supplier_id === id) || null;

  const formula =
    read(FILES.m9Formulas)
      .formulas
      .find(x => x.supplier_id === id) || null;

  const manufacturerVerified =
    verification
      .manufacturer_verifications
      .some(
        x =>
          x.supplier_id === id &&
          x.verified === true
      );

  const gmpVerified =
    verification
      .gmp_verifications
      .some(
        x =>
          x.supplier_id === id &&
          x.verified === true
      );

  const coaVerified =
    verification
      .coa_verifications
      .some(
        x =>
          x.supplier_id === id &&
          x.verified === true
      );

  const supplier =
    suppliers.find(
      x => x.id === id
    ) || null;

  return {
    supplier,
    responses,
    documents,
    manufacturer_verified:
      manufacturerVerified,
    gmp_verified:
      gmpVerified,
    coa_verified:
      coaVerified,
    quote,
    formula
  };
}

router.get('/health', (req, res) => {
  try {
    const recs =
      read(FILES.recommendations);

    res.json({
      ok: true,

      module:
        'CIWU_REAL_SUPPLIER_EXECUTION_WORKBENCH',

      recommendations:
        recs.recommendations.length,

      recommendation_can_authorize_purchase:
        false,

      purchase_authorization_enabled:
        false,

      purchase_order_submission_enabled:
        false,

      payment_enabled:
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
        'M10_ENGINE_UNAVAILABLE'
    });
  }
});

router.post('/rfq/export', (req, res) => {
  const {
    supplier_id,
    supplier_name,
    contact_email,
    target_quantity
  } = req.body || {};

  if (
    typeof supplier_id !== 'string' ||
    !supplierExists(supplier_id)
  ) {
    return res.status(400).json({
      error:
        'KNOWN_SUPPLIER_REQUIRED'
    });
  }

  if (
    !Number.isInteger(target_quantity) ||
    target_quantity <= 0
  ) {
    return res.status(400).json({
      error:
        'VALID_TARGET_QUANTITY_REQUIRED'
    });
  }

  const body = [
    `Supplier: ${supplier_name || supplier_id}`,
    `Email: ${contact_email || 'UNVERIFIED'}`,
    '',
    'CIWU Cellular Vitality — Private Label Manufacturing RFQ',
    '',
    `Target quantity: ${target_quantity} units`,
    '',
    'Requested evidence and commercial information:',
    '- written private-label eligibility',
    '- manufacturer legal identity',
    '- manufacturing facility address',
    '- GMP documentation',
    '- available formula/specification',
    '- ingredient quantities per serving',
    '- ingredient sourcing information',
    '- representative COA',
    '- lot-specific COA policy',
    '- identity testing',
    '- potency testing',
    '- microbiological testing',
    '- heavy-metal testing',
    '- MOQ',
    '- unit price',
    '- packaging',
    '- setup/tooling fees',
    '- testing fees',
    '- freight terms',
    '- lead time',
    '- label/artwork support',
    '- shelf-life/stability information',
    '',
    'No commercial relationship or procurement authorization exists until CIWU verification and separate human approval.'
  ].join('\n');

  const record = {
    id:
      uid('rfq-export'),

    supplier_id,

    supplier_name:
      supplier_name || supplier_id,

    contact_email:
      contact_email || null,

    target_quantity,

    body,

    state:
      'EXPORT_READY_NOT_SENT',

    sha256:
      hash(body),

    external_send_enabled:
      false,

    created_at:
      new Date().toISOString()
  };

  const db =
    read(FILES.rfqExports);

  db.exports.push(record);

  write(
    FILES.rfqExports,
    db
  );

  res.status(201).json(record);
});

router.post('/responses/index', (req, res) => {
  const {
    supplier_id,
    source,
    subject,
    received_at,
    summary,
    content_sha256
  } = req.body || {};

  if (
    typeof supplier_id !== 'string' ||
    !supplierExists(supplier_id)
  ) {
    return res.status(400).json({
      error:
        'KNOWN_SUPPLIER_REQUIRED'
    });
  }

  if (
    typeof source !== 'string' ||
    !source.trim()
  ) {
    return res.status(400).json({
      error:
        'SOURCE_REQUIRED'
    });
  }

  if (
    typeof content_sha256 !== 'string' ||
    !/^[a-f0-9]{64}$/i.test(content_sha256)
  ) {
    return res.status(400).json({
      error:
        'VALID_SHA256_REQUIRED'
    });
  }

  const record = {
    id:
      uid('indexed-response'),

    supplier_id,

    source:
      source.trim(),

    subject:
      subject || null,

    summary:
      summary || null,

    content_sha256:
      content_sha256.toLowerCase(),

    received_at:
      received_at ||
      new Date().toISOString(),

    verified:
      false,

    state:
      'INDEXED_UNVERIFIED'
  };

  const db =
    read(FILES.responses);

  db.responses.push(record);

  write(
    FILES.responses,
    db
  );

  res.status(201).json(record);
});

router.post('/ledger/entry', (req, res) => {
  const {
    supplier_id,
    evidence_type,
    source_document_id,
    reviewer,
    finding,
    verified
  } = req.body || {};

  if (
    typeof supplier_id !== 'string' ||
    !supplierExists(supplier_id)
  ) {
    return res.status(400).json({
      error:
        'KNOWN_SUPPLIER_REQUIRED'
    });
  }

  if (
    typeof evidence_type !== 'string' ||
    !evidence_type.trim()
  ) {
    return res.status(400).json({
      error:
        'EVIDENCE_TYPE_REQUIRED'
    });
  }

  if (
    typeof reviewer !== 'string' ||
    !reviewer.trim()
  ) {
    return res.status(400).json({
      error:
        'REVIEWER_REQUIRED'
    });
  }

  const entry = {
    id:
      uid('ledger'),

    supplier_id,

    evidence_type:
      evidence_type.trim(),

    source_document_id:
      source_document_id || null,

    reviewer:
      reviewer.trim(),

    finding:
      finding || null,

    verified:
      verified === true,

    state:
      verified === true
        ? 'VERIFIED'
        : 'REVIEWED_NOT_VERIFIED',

    reviewed_at:
      new Date().toISOString()
  };

  entry.sha256 =
    hash(entry);

  const db =
    read(FILES.ledger);

  db.entries.push(entry);

  write(
    FILES.ledger,
    db
  );

  res.status(201).json(entry);
});

router.post('/reviews/gmp', (req, res) => {
  const {
    supplier_id,
    source_document_id,
    reviewer,
    certificate_number,
    issuer,
    expiration_date,
    verified,
    notes
  } = req.body || {};

  if (
    typeof reviewer !== 'string' ||
    !reviewer.trim()
  ) {
    return res.status(400).json({
      error:
        'REVIEWER_REQUIRED'
    });
  }

  const record = {
    id:
      uid('gmp-review'),

    supplier_id,

    source_document_id:
      source_document_id || null,

    reviewer:
      reviewer.trim(),

    certificate_number:
      certificate_number || null,

    issuer:
      issuer || null,

    expiration_date:
      expiration_date || null,

    verified:
      verified === true,

    state:
      verified === true
        ? 'VERIFIED'
        : 'NOT_VERIFIED',

    notes:
      notes || null,

    reviewed_at:
      new Date().toISOString()
  };

  const db =
    read(FILES.reviews);

  db.gmp_reviews.push(record);

  write(
    FILES.reviews,
    db
  );

  res.status(201).json(record);
});

router.post('/reviews/coa', (req, res) => {
  const {
    supplier_id,
    source_document_id,
    reviewer,
    lot_number,
    identity_pass,
    potency_pass,
    microbial_pass,
    heavy_metals_pass,
    notes
  } = req.body || {};

  if (
    typeof reviewer !== 'string' ||
    !reviewer.trim()
  ) {
    return res.status(400).json({
      error:
        'REVIEWER_REQUIRED'
    });
  }

  if (
    typeof lot_number !== 'string' ||
    !lot_number.trim()
  ) {
    return res.status(400).json({
      error:
        'LOT_NUMBER_REQUIRED'
    });
  }

  const gates = {
    identity:
      identity_pass === true,

    potency:
      potency_pass === true,

    microbial:
      microbial_pass === true,

    heavy_metals:
      heavy_metals_pass === true
  };

  const verified =
    Object.values(gates)
      .every(Boolean);

  const record = {
    id:
      uid('coa-review'),

    supplier_id,

    source_document_id:
      source_document_id || null,

    reviewer:
      reviewer.trim(),

    lot_number:
      lot_number.trim(),

    gates,

    verified,

    state:
      verified
        ? 'VERIFIED'
        : 'FAILED',

    notes:
      notes || null,

    reviewed_at:
      new Date().toISOString()
  };

  const db =
    read(FILES.reviews);

  db.coa_reviews.push(record);

  write(
    FILES.reviews,
    db
  );

  res.status(201).json(record);
});

router.get('/decision-matrix', (req, res) => {
  const suppliers =
    read(FILES.supplierMatrix)
      .suppliers;

  const rows =
    suppliers.map(supplier => {
      const snap =
        supplierSnapshot(
          supplier.id
        );

      let evidenceScore = 0;

      if (
        snap.responses.length > 0
      ) {
        evidenceScore += 5;
      }

      evidenceScore +=
        Math.min(
          10,
          snap.documents.length * 2
        );

      if (
        snap.manufacturer_verified
      ) {
        evidenceScore += 20;
      }

      if (
        snap.gmp_verified
      ) {
        evidenceScore += 20;
      }

      if (
        snap.coa_verified
      ) {
        evidenceScore += 20;
      }

      if (snap.quote) {
        evidenceScore += 10;
      }

      if (snap.formula) {
        evidenceScore += 10;
      }

      const hardGates = {
        manufacturer_verified:
          snap.manufacturer_verified,

        gmp_verified:
          snap.gmp_verified,

        coa_verified:
          snap.coa_verified,

        quote_received:
          Boolean(snap.quote),

        formula_received:
          Boolean(snap.formula)
      };

      const qualified =
        Object.values(hardGates)
          .every(Boolean);

      return {
        supplier_id:
          supplier.id,

        supplier_name:
          supplier.name,

        evidence_score:
          evidenceScore,

        hard_gates:
          hardGates,

        eligible_for_recommendation:
          qualified,

        purchase_authorized:
          false
      };
    });

  rows.sort(
    (a, b) =>
      b.evidence_score -
      a.evidence_score
  );

  res.json({
    state:
      'DERIVED_DECISION_MATRIX',

    rows,

    purchase_authorized:
      false,

    payment_enabled:
      false,

    sales_enabled:
      false
  });
});

router.post(
  '/due-diligence/generate',
  (req, res) => {
    const {
      supplier_id
    } = req.body || {};

    if (
      typeof supplier_id !== 'string' ||
      !supplierExists(supplier_id)
    ) {
      return res.status(400).json({
        error:
          'KNOWN_SUPPLIER_REQUIRED'
      });
    }

    const snap =
      supplierSnapshot(
        supplier_id
      );

    const packet = {
      id:
        uid('due-diligence'),

      supplier_id,

      supplier:
        snap.supplier,

      response_count:
        snap.responses.length,

      document_count:
        snap.documents.length,

      manufacturer_verified:
        snap.manufacturer_verified,

      gmp_verified:
        snap.gmp_verified,

      coa_verified:
        snap.coa_verified,

      quote:
        snap.quote,

      formula:
        snap.formula,

      procurement_recommendation_possible:
        (
          snap.manufacturer_verified &&
          snap.gmp_verified &&
          snap.coa_verified &&
          Boolean(snap.quote) &&
          Boolean(snap.formula)
        ),

      purchase_authorized:
        false,

      payment_enabled:
        false,

      sales_enabled:
        false,

      generated_at:
        new Date().toISOString()
    };

    packet.sha256 =
      hash(packet);

    const db =
      read(FILES.dueDiligence);

    db.packets.push(packet);

    write(
      FILES.dueDiligence,
      db
    );

    res.status(201).json(packet);
});

router.post(
  '/recommend',
  (req, res) => {
    const suppliers =
      read(FILES.supplierMatrix)
        .suppliers;

    const candidates =
      suppliers
        .map(supplier => {
          const snap =
            supplierSnapshot(
              supplier.id
            );

          const gates = {
            manufacturer_verified:
              snap.manufacturer_verified,

            gmp_verified:
              snap.gmp_verified,

            coa_verified:
              snap.coa_verified,

            quote_received:
              Boolean(snap.quote),

            formula_received:
              Boolean(snap.formula)
          };

          const eligible =
            Object.values(gates)
              .every(Boolean);

          let score = 0;

          if (
            snap.manufacturer_verified
          ) {
            score += 20;
          }

          if (
            snap.gmp_verified
          ) {
            score += 20;
          }

          if (
            snap.coa_verified
          ) {
            score += 20;
          }

          if (snap.quote) {
            score += 20;
          }

          if (snap.formula) {
            score += 20;
          }

          return {
            supplier_id:
              supplier.id,

            supplier_name:
              supplier.name,

            eligible,

            score,

            gates
          };
        })
        .sort(
          (a, b) =>
            b.score - a.score
        );

    const recommended =
      candidates.find(
        x => x.eligible === true
      ) || null;

    const recommendation = {
      id:
        uid('recommendation'),

      recommended_supplier:
        recommended,

      state:
        recommended
          ? 'RECOMMENDATION_AVAILABLE'
          : 'NO_QUALIFIED_SUPPLIER',

      purchase_authorized:
        false,

      purchase_order_submission_enabled:
        false,

      payment_enabled:
        false,

      sales_enabled:
        false,

      created_at:
        new Date().toISOString()
    };

    const db =
      read(FILES.recommendations);

    db.recommendations.push(
      recommendation
    );

    db.purchase_authorized =
      false;

    write(
      FILES.recommendations,
      db
    );

    res.json(recommendation);
});

router.post(
  '/purchase-authorize',
  (req, res) => {

    res.status(403).json({
      error:
        'PURCHASE_AUTHORIZATION_DISABLED',

      state:
        'SEPARATE_HUMAN_CONTROL_REQUIRED'
    });
  }
);

module.exports = router;
