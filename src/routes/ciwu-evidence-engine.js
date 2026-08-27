'use strict';

const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const router = express.Router();
router.use(express.json({ limit: '2mb' }));

const ROOT = path.join(__dirname, '..', '..');

const FILES = {
  evidence:
    path.join(
      ROOT,
      'data',
      'product-engine',
      'evidence',
      'registry.json'
    ),

  lots:
    path.join(
      ROOT,
      'data',
      'product-engine',
      'lots',
      'registry.json'
    ),

  locks:
    path.join(
      ROOT,
      'data',
      'product-engine',
      'formula-locks',
      'registry.json'
    ),

  ledger:
    path.join(
      ROOT,
      'data',
      'product-engine',
      'release-ledger',
      'ledger.json'
    ),

  formula:
    path.join(
      ROOT,
      'data',
      'product-engine',
      'formula.json'
    ),

  supplier:
    path.join(
      ROOT,
      'data',
      'product-engine',
      'supplier.json'
    ),

  coa:
    path.join(
      ROOT,
      'data',
      'product-engine',
      'coa',
      'requirements.json'
    ),

  label:
    path.join(
      ROOT,
      'data',
      'product-engine',
      'labels',
      'label.json'
    ),

  cost:
    path.join(
      ROOT,
      'data',
      'product-engine',
      'cost.json'
    )
};

function read(file) {
  return JSON.parse(
    fs.readFileSync(file, 'utf8')
  );
}

function write(file, value) {
  const temp = `${file}.tmp-${process.pid}`;

  fs.writeFileSync(
    temp,
    JSON.stringify(value, null, 2) + '\n',
    'utf8'
  );

  fs.renameSync(temp, file);
}

function id(prefix) {
  return (
    prefix +
    '-' +
    crypto.randomBytes(8).toString('hex')
  );
}

function digest(value) {
  return crypto
    .createHash('sha256')
    .update(
      JSON.stringify(value)
    )
    .digest('hex');
}

function qualification() {
  const supplier = read(FILES.supplier);
  const formula = read(FILES.formula);
  const coa = read(FILES.coa);
  const label = read(FILES.label);
  const cost = read(FILES.cost);

  const gates = {
    supplier:
      supplier.state === 'VERIFIED' &&
      supplier.authorization
        ?.private_label_relationship_verified === true &&
      supplier.authorization
        ?.authorized_for_ciwu_brand === true &&
      supplier.manufacturing
        ?.manufacturer_identity_verified === true,

    formula:
      formula.formula_state === 'VERIFIED' &&
      formula.verification
        ?.supplier_formula_received === true &&
      formula.verification
        ?.formula_matches_target === true &&
      formula.verification
        ?.ingredient_amounts_verified === true &&
      formula.verification
        ?.final_formula_approved === true,

    coa:
      coa.coa_state === 'VERIFIED' &&
      coa.acceptance
        ?.coa_received === true &&
      coa.acceptance
        ?.lot_matches_product === true &&
      coa.acceptance
        ?.results_within_specification === true &&
      coa.acceptance
        ?.coa_approved === true,

    label:
      label.label_state === 'APPROVED' &&
      label.approval
        ?.formula_matches_label === true &&
      label.approval
        ?.regulatory_review_complete === true &&
      label.approval
        ?.label_artwork_approved === true &&
      label.approval
        ?.commercial_label_release === true,

    cost:
      cost.state === 'COMPLETE' &&
      Number.isInteger(
        cost.commercial
          ?.total_landed_cost_cents
      ) &&
      Number.isInteger(
        cost.commercial
          ?.planned_retail_price_cents
      )
  };

  return {
    gates,
    release_eligible:
      Object.values(gates).every(Boolean)
  };
}

router.get('/health', (req, res) => {
  try {
    const evidence = read(FILES.evidence);
    const lots = read(FILES.lots);
    const locks = read(FILES.locks);
    const ledger = read(FILES.ledger);

    res.json({
      ok: true,
      module:
        'CIWU_PRODUCT_EVIDENCE_CONTROL_PLANE',

      evidence_count:
        evidence.evidence.length,

      lot_count:
        lots.lots.length,

      active_formula_lock:
        locks.active_lock,

      release_state:
        ledger.release_state,

      timestamp:
        new Date().toISOString()
    });

  } catch {
    res.status(500).json({
      ok: false,
      error:
        'EVIDENCE_ENGINE_UNAVAILABLE'
    });
  }
});

router.get('/evidence', (req, res) => {
  res.json(read(FILES.evidence));
});

router.post('/evidence', (req, res) => {
  const {
    type,
    title,
    source,
    reference,
    notes
  } = req.body || {};

  const allowed = new Set([
    'SUPPLIER_AUTHORIZATION',
    'FORMULA_SPECIFICATION',
    'COA',
    'GMP_DOCUMENT',
    'MANUFACTURER_IDENTITY',
    'QUALITY_AGREEMENT',
    'INSURANCE',
    'LABEL_REVIEW',
    'PRICING',
    'PACKAGING_SPECIFICATION',
    'OTHER'
  ]);

  if (!allowed.has(type)) {
    return res.status(400).json({
      error:
        'INVALID_EVIDENCE_TYPE'
    });
  }

  if (
    typeof title !== 'string' ||
    !title.trim()
  ) {
    return res.status(400).json({
      error:
        'TITLE_REQUIRED'
    });
  }

  if (
    typeof source !== 'string' ||
    !source.trim()
  ) {
    return res.status(400).json({
      error:
        'SOURCE_PROVENANCE_REQUIRED'
    });
  }

  const registry =
    read(FILES.evidence);

  const record = {
    id: id('evidence'),
    product_id:
      'ciwu-cellular-vitality-001',

    type,
    title: title.trim(),
    source: source.trim(),

    reference:
      typeof reference === 'string'
        ? reference.trim()
        : null,

    notes:
      typeof notes === 'string'
        ? notes.trim()
        : null,

    state:
      'REVIEW_REQUIRED',

    verified:
      false,

    received_at:
      new Date().toISOString(),

    verified_at:
      null,

    verification_notes:
      null
  };

  record.record_sha256 =
    digest(record);

  registry.evidence.push(record);
  registry.state = 'ACTIVE';

  write(
    FILES.evidence,
    registry
  );

  res.status(201).json(record);
});

router.post(
  '/evidence/:id/verify',
  (req, res) => {

    const {
      reviewer,
      verification_notes
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
      typeof verification_notes !== 'string' ||
      !verification_notes.trim()
    ) {
      return res.status(400).json({
        error:
          'VERIFICATION_NOTES_REQUIRED'
      });
    }

    const registry =
      read(FILES.evidence);

    const record =
      registry.evidence.find(
        item =>
          item.id === req.params.id
      );

    if (!record) {
      return res.status(404).json({
        error:
          'EVIDENCE_NOT_FOUND'
      });
    }

    record.state =
      'VERIFIED';

    record.verified =
      true;

    record.verified_at =
      new Date().toISOString();

    record.reviewer =
      reviewer.trim();

    record.verification_notes =
      verification_notes.trim();

    record.verification_sha256 =
      digest({
        id: record.id,
        reviewer: record.reviewer,
        verification_notes:
          record.verification_notes,
        verified_at:
          record.verified_at
      });

    write(
      FILES.evidence,
      registry
    );

    res.json(record);
  }
);

router.get('/formula-locks', (req, res) => {
  res.json(read(FILES.locks));
});

router.post('/formula-locks', (req, res) => {
  const formula = read(FILES.formula);
  const evidence = read(FILES.evidence);
  const locks = read(FILES.locks);

  const verifiedFormulaEvidence =
    evidence.evidence.find(
      item =>
        item.type ===
          'FORMULA_SPECIFICATION' &&
        item.verified === true
    );

  if (!verifiedFormulaEvidence) {
    return res.status(409).json({
      error:
        'VERIFIED_FORMULA_EVIDENCE_REQUIRED'
    });
  }

  if (
    formula.formula_state !== 'VERIFIED'
  ) {
    return res.status(409).json({
      error:
        'FORMULA_NOT_VERIFIED'
    });
  }

  const lock = {
    id: id('formula-lock'),
    product_id:
      formula.product_id,

    formula_version:
      formula.version,

    formula_sha256:
      digest(formula),

    evidence_id:
      verifiedFormulaEvidence.id,

    created_at:
      new Date().toISOString(),

    state:
      'LOCKED'
  };

  locks.locks.push(lock);
  locks.active_lock = lock.id;

  write(FILES.locks, locks);

  res.status(201).json(lock);
});

router.get('/lots', (req, res) => {
  res.json(read(FILES.lots));
});

router.post('/lots', (req, res) => {
  const {
    lot_number,
    manufacturer_lot,
    manufacture_date,
    expiration_date
  } = req.body || {};

  if (
    typeof lot_number !== 'string' ||
    !lot_number.trim()
  ) {
    return res.status(400).json({
      error:
        'LOT_NUMBER_REQUIRED'
    });
  }

  const lots = read(FILES.lots);

  if (
    lots.lots.some(
      lot =>
        lot.lot_number ===
        lot_number.trim()
    )
  ) {
    return res.status(409).json({
      error:
        'LOT_ALREADY_EXISTS'
    });
  }

  const lot = {
    id: id('lot'),
    product_id:
      'ciwu-cellular-vitality-001',

    lot_number:
      lot_number.trim(),

    manufacturer_lot:
      manufacturer_lot || null,

    manufacture_date:
      manufacture_date || null,

    expiration_date:
      expiration_date || null,

    coa_evidence_id:
      null,

    coa_verified:
      false,

    release_state:
      'BLOCKED',

    created_at:
      new Date().toISOString()
  };

  lots.lots.push(lot);

  write(FILES.lots, lots);

  res.status(201).json(lot);
});

router.post(
  '/lots/:id/attach-coa',
  (req, res) => {

    const {
      evidence_id
    } = req.body || {};

    const lots = read(FILES.lots);
    const evidence =
      read(FILES.evidence);

    const lot =
      lots.lots.find(
        item =>
          item.id === req.params.id
      );

    if (!lot) {
      return res.status(404).json({
        error:
          'LOT_NOT_FOUND'
      });
    }

    const coa =
      evidence.evidence.find(
        item =>
          item.id === evidence_id &&
          item.type === 'COA'
      );

    if (!coa) {
      return res.status(404).json({
        error:
          'COA_EVIDENCE_NOT_FOUND'
      });
    }

    if (coa.verified !== true) {
      return res.status(409).json({
        error:
          'COA_NOT_VERIFIED'
      });
    }

    lot.coa_evidence_id =
      coa.id;

    lot.coa_verified =
      true;

    write(FILES.lots, lots);

    res.json(lot);
  }
);

router.get('/release', (req, res) => {
  const q = qualification();
  const ledger = read(FILES.ledger);

  res.json({
    qualification: q,
    release_state:
      ledger.release_state,

    sales_enabled:
      false,

    ledger_entries:
      ledger.entries.length
  });
});

router.post('/release/evaluate', (req, res) => {
  const q = qualification();
  const ledger = read(FILES.ledger);

  const entry = {
    id: id('release-evaluation'),
    timestamp:
      new Date().toISOString(),

    gates:
      q.gates,

    release_eligible:
      q.release_eligible,

    sales_enabled:
      false
  };

  ledger.entries.push(entry);

  ledger.release_state =
    q.release_eligible
      ? 'QUALIFIED_NOT_ACTIVATED'
      : 'BLOCKED';

  write(
    FILES.ledger,
    ledger
  );

  res.json({
    ...entry,
    release_state:
      ledger.release_state
  });
});

module.exports = router;
