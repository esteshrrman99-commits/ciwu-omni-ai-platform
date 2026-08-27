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
    'm9',
    ...parts
  );

const FILES = {
  outreach:
    base('outreach', 'registry.json'),

  responses:
    base('responses', 'registry.json'),

  documents:
    base('documents', 'registry.json'),

  verification:
    base('verification', 'registry.json'),

  quotes:
    base('quotes', 'registry.json'),

  formulas:
    base('formulas', 'registry.json'),

  reviewBoard:
    base('review-board', 'registry.json'),

  supplierMatrix:
    path.join(
      ROOT,
      'data',
      'product-engine',
      'acquisition',
      'm8',
      'suppliers',
      'matrix.json'
    )
};

function read(file) {
  return JSON.parse(
    fs.readFileSync(file, 'utf8')
  );
}

function write(file, data) {
  const tmp =
    `${file}.tmp-${process.pid}`;

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

function sha(value) {
  return crypto
    .createHash('sha256')
    .update(JSON.stringify(value))
    .digest('hex');
}

function supplierExists(id) {
  const db =
    read(FILES.supplierMatrix);

  return db.suppliers.some(
    s => s.id === id
  );
}

function findDocument(id) {
  return (
    read(FILES.documents)
      .documents
      .find(
        item => item.id === id
      ) || null
  );
}

router.get('/health', (req, res) => {
  try {
    const responses =
      read(FILES.responses);

    const documents =
      read(FILES.documents);

    const verification =
      read(FILES.verification);

    res.json({
      ok: true,

      module:
        'CIWU_REAL_SUPPLIER_RESPONSE_INTAKE',

      responses:
        responses.responses.length,

      documents:
        documents.documents.length,

      verified_gmp:
        verification
          .gmp_verifications
          .filter(
            x => x.verified === true
          ).length,

      verified_coa:
        verification
          .coa_verifications
          .filter(
            x => x.verified === true
          ).length,

      email_send_enabled:
        false,

      application_submission_enabled:
        false,

      quote_acceptance_enabled:
        false,

      procurement_authorized:
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
        'M9_ENGINE_UNAVAILABLE'
    });
  }
});

router.post('/outreach/rfq', (req, res) => {
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

  const message = {
    id:
      uid('rfq'),

    supplier_id,

    supplier_name:
      supplier_name || supplier_id,

    contact_email:
      contact_email || null,

    subject:
      'Private Label Manufacturing RFQ — CIWU Cellular Vitality',

    body: [
      `Hello ${supplier_name || supplier_id},`,
      '',
      'CIWU is evaluating private-label or custom manufacturing options for CIWU Cellular Vitality.',
      '',
      `Target initial quantity: ${target_quantity} units.`,
      '',
      'Please provide:',
      '- private-label eligibility/authorization',
      '- manufacturer legal identity',
      '- manufacturing facility address',
      '- GMP documentation',
      '- available stock formula or custom formulation options',
      '- complete ingredient specification',
      '- representative COA',
      '- lot-specific COA policy',
      '- identity/potency/microbial/heavy-metal testing information',
      '- MOQ',
      '- unit price',
      '- packaging costs',
      '- setup/tooling fees',
      '- testing fees',
      '- freight terms',
      '- lead time',
      '- label and artwork support',
      '- shelf-life/stability information',
      '',
      'All submitted information remains subject to CIWU verification before procurement or commercial release.',
      '',
      'CIWU Product Development'
    ].join('\n'),

    state:
      'DRAFT_NOT_SENT',

    human_approval_required:
      true,

    sent:
      false,

    created_at:
      new Date().toISOString()
  };

  message.sha256 =
    sha(message);

  const db =
    read(FILES.outreach);

  db.messages.push(message);

  write(
    FILES.outreach,
    db
  );

  res.status(201).json(message);
});

router.post(
  '/outreach/:id/send',
  (req, res) => {

    res.status(403).json({
      error:
        'EXTERNAL_EMAIL_SEND_DISABLED',

      human_approval_required:
        true
    });
  }
);

router.post('/responses', (req, res) => {
  const {
    supplier_id,
    channel,
    subject,
    source,
    received_at,
    summary
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

  const response = {
    id:
      uid('response'),

    supplier_id,

    channel:
      channel || 'UNKNOWN',

    subject:
      subject || null,

    source:
      source.trim(),

    summary:
      summary || null,

    received_at:
      received_at ||
      new Date().toISOString(),

    state:
      'RECEIVED_UNVERIFIED',

    verified:
      false
  };

  response.sha256 =
    sha(response);

  const db =
    read(FILES.responses);

  db.responses.push(response);

  write(
    FILES.responses,
    db
  );

  res.status(201).json(response);
});

router.post('/documents', (req, res) => {
  const {
    supplier_id,
    response_id,
    filename,
    content_sha256,
    document_type,
    source,
    lot_number,
    notes
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
    typeof filename !== 'string' ||
    !filename.trim()
  ) {
    return res.status(400).json({
      error:
        'FILENAME_REQUIRED'
    });
  }

  if (
    typeof content_sha256 !== 'string' ||
    !/^[a-f0-9]{64}$/i.test(
      content_sha256
    )
  ) {
    return res.status(400).json({
      error:
        'VALID_SHA256_REQUIRED'
    });
  }

  if (
    typeof document_type !== 'string' ||
    !document_type.trim()
  ) {
    return res.status(400).json({
      error:
        'DOCUMENT_TYPE_REQUIRED'
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

  const record = {
    id:
      uid('document'),

    supplier_id,

    response_id:
      response_id || null,

    filename:
      filename.trim(),

    content_sha256:
      content_sha256.toLowerCase(),

    document_type:
      document_type.trim(),

    source:
      source.trim(),

    lot_number:
      lot_number || null,

    notes:
      notes || null,

    received:
      true,

    verified:
      false,

    state:
      'REVIEW_REQUIRED',

    created_at:
      new Date().toISOString()
  };

  const db =
    read(FILES.documents);

  db.documents.push(record);

  write(
    FILES.documents,
    db
  );

  res.status(201).json(record);
});

router.post(
  '/verify/manufacturer',
  (req, res) => {
    const {
      supplier_id,
      document_id,
      manufacturer_name,
      facility_address,
      reviewer,
      finding
    } = req.body || {};

    const doc =
      findDocument(document_id);

    if (
      !doc ||
      doc.supplier_id !== supplier_id
    ) {
      return res.status(404).json({
        error:
          'SOURCE_DOCUMENT_NOT_FOUND'
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

    const record = {
      id:
        uid('manufacturer-verification'),

      supplier_id,

      document_id,

      manufacturer_name:
        manufacturer_name || null,

      facility_address:
        facility_address || null,

      reviewer:
        reviewer.trim(),

      finding:
        finding || null,

      verified:
        true,

      verified_at:
        new Date().toISOString()
    };

    const db =
      read(FILES.verification);

    db.manufacturer_verifications
      .push(record);

    write(
      FILES.verification,
      db
    );

    res.json(record);
  }
);

router.post('/verify/gmp', (req, res) => {
  const {
    supplier_id,
    document_id,
    reviewer,
    certificate_number,
    issuer,
    expiration_date,
    finding
  } = req.body || {};

  const doc =
    findDocument(document_id);

  if (
    !doc ||
    doc.supplier_id !== supplier_id
  ) {
    return res.status(404).json({
      error:
        'SOURCE_DOCUMENT_NOT_FOUND'
    });
  }

  if (
    doc.document_type !==
    'GMP_DOCUMENT'
  ) {
    return res.status(409).json({
      error:
        'GMP_DOCUMENT_REQUIRED'
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

  const record = {
    id:
      uid('gmp-verification'),

    supplier_id,

    document_id,

    reviewer:
      reviewer.trim(),

    certificate_number:
      certificate_number || null,

    issuer:
      issuer || null,

    expiration_date:
      expiration_date || null,

    finding:
      finding || null,

    verified:
      true,

    verified_at:
      new Date().toISOString()
  };

  const db =
    read(FILES.verification);

  db.gmp_verifications.push(
    record
  );

  write(
    FILES.verification,
    db
  );

  res.json(record);
});

router.post('/verify/coa', (req, res) => {
  const {
    supplier_id,
    document_id,
    reviewer,
    lot_number,
    identity_pass,
    potency_pass,
    microbial_pass,
    heavy_metals_pass,
    finding
  } = req.body || {};

  const doc =
    findDocument(document_id);

  if (
    !doc ||
    doc.supplier_id !== supplier_id
  ) {
    return res.status(404).json({
      error:
        'SOURCE_DOCUMENT_NOT_FOUND'
    });
  }

  if (doc.document_type !== 'COA') {
    return res.status(409).json({
      error:
        'COA_DOCUMENT_REQUIRED'
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
      uid('coa-verification'),

    supplier_id,

    document_id,

    lot_number:
      lot_number.trim(),

    reviewer:
      reviewer || null,

    gates,

    finding:
      finding || null,

    verified,

    state:
      verified
        ? 'VERIFIED'
        : 'FAILED',

    verified_at:
      new Date().toISOString()
  };

  const db =
    read(FILES.verification);

  db.coa_verifications.push(
    record
  );

  write(
    FILES.verification,
    db
  );

  res.json(record);
});

router.post('/quotes', (req, res) => {
  const {
    supplier_id,
    source_document_id,
    currency,
    moq,
    unit_cost_cents,
    packaging_cents,
    setup_total_cents,
    testing_total_cents,
    freight_total_cents,
    lead_time_days,
    retail_price_cents
  } = req.body || {};

  const source =
    findDocument(source_document_id);

  if (!source) {
    return res.status(409).json({
      error:
        'SOURCE_DOCUMENT_REQUIRED'
    });
  }

  const numeric = {
    moq,
    unit_cost_cents,
    packaging_cents,
    setup_total_cents,
    testing_total_cents,
    freight_total_cents,
    lead_time_days,
    retail_price_cents
  };

  for (
    const [field, value]
    of Object.entries(numeric)
  ) {
    if (
      !Number.isInteger(value) ||
      value < 0
    ) {
      return res.status(400).json({
        error:
          'INVALID_QUOTE_FIELD',
        field
      });
    }
  }

  if (moq <= 0) {
    return res.status(400).json({
      error:
        'MOQ_MUST_BE_POSITIVE'
    });
  }

  const shared =
    setup_total_cents +
    testing_total_cents +
    freight_total_cents;

  const allocated =
    Math.ceil(
      shared / moq
    );

  const landed =
    unit_cost_cents +
    packaging_cents +
    allocated;

  const gross =
    retail_price_cents -
    landed;

  const margin =
    retail_price_cents > 0
      ? Number(
          (
            gross /
            retail_price_cents *
            100
          ).toFixed(2)
        )
      : null;

  const quote = {
    id:
      uid('quote'),

    supplier_id,

    source_document_id,

    currency:
      currency || 'USD',

    moq,

    unit_cost_cents,

    packaging_cents,

    allocated_shared_cost_cents:
      allocated,

    landed_unit_cost_cents:
      landed,

    lead_time_days,

    retail_price_cents,

    estimated_gross_profit_cents:
      gross,

    estimated_gross_margin_percent:
      margin,

    verified:
      false,

    selected:
      false,

    state:
      'RECEIVED_UNVERIFIED',

    created_at:
      new Date().toISOString()
  };

  const db =
    read(FILES.quotes);

  db.quotes.push(quote);

  write(
    FILES.quotes,
    db
  );

  res.status(201).json(quote);
});

router.post('/formulas', (req, res) => {
  const {
    supplier_id,
    source_document_id,
    version,
    ingredients
  } = req.body || {};

  const source =
    findDocument(source_document_id);

  if (!source) {
    return res.status(409).json({
      error:
        'SOURCE_DOCUMENT_REQUIRED'
    });
  }

  if (
    typeof version !== 'string' ||
    !version.trim()
  ) {
    return res.status(400).json({
      error:
        'VERSION_REQUIRED'
    });
  }

  if (!Array.isArray(ingredients)) {
    return res.status(400).json({
      error:
        'INGREDIENTS_REQUIRED'
    });
  }

  const formula = {
    id:
      uid('formula'),

    supplier_id,

    source_document_id,

    version:
      version.trim(),

    ingredients,

    formula_sha256:
      sha(ingredients),

    verified:
      false,

    selected:
      false,

    state:
      'RECEIVED_UNVERIFIED',

    created_at:
      new Date().toISOString()
  };

  const db =
    read(FILES.formulas);

  db.formulas.push(formula);

  write(
    FILES.formulas,
    db
  );

  res.status(201).json(formula);
});

router.get('/rank', (req, res) => {
  const supplierMatrix =
    read(FILES.supplierMatrix)
      .suppliers;

  const responses =
    read(FILES.responses)
      .responses;

  const documents =
    read(FILES.documents)
      .documents;

  const verification =
    read(FILES.verification);

  const quotes =
    read(FILES.quotes)
      .quotes;

  const formulas =
    read(FILES.formulas)
      .formulas;

  const rows =
    supplierMatrix.map(supplier => {

      const supplierResponses =
        responses.filter(
          x =>
            x.supplier_id ===
            supplier.id
        );

      const supplierDocuments =
        documents.filter(
          x =>
            x.supplier_id ===
            supplier.id
        );

      const manufacturerVerified =
        verification
          .manufacturer_verifications
          .some(
            x =>
              x.supplier_id ===
                supplier.id &&
              x.verified === true
          );

      const gmpVerified =
        verification
          .gmp_verifications
          .some(
            x =>
              x.supplier_id ===
                supplier.id &&
              x.verified === true
          );

      const coaVerified =
        verification
          .coa_verifications
          .some(
            x =>
              x.supplier_id ===
                supplier.id &&
              x.verified === true
          );

      const quote =
        quotes.find(
          x =>
            x.supplier_id ===
            supplier.id
        );

      const formula =
        formulas.find(
          x =>
            x.supplier_id ===
            supplier.id
        );

      let score = 0;

      if (
        supplierResponses.length > 0
      ) {
        score += 5;
      }

      score += Math.min(
        10,
        supplierDocuments.length * 2
      );

      if (manufacturerVerified) {
        score += 20;
      }

      if (gmpVerified) {
        score += 20;
      }

      if (coaVerified) {
        score += 20;
      }

      if (quote) {
        score += 10;
      }

      if (formula) {
        score += 10;
      }

      const hardGatePass =
        manufacturerVerified &&
        gmpVerified &&
        coaVerified &&
        Boolean(quote) &&
        Boolean(formula);

      return {
        supplier_id:
          supplier.id,

        supplier_name:
          supplier.name,

        responses:
          supplierResponses.length,

        documents:
          supplierDocuments.length,

        manufacturer_verified:
          manufacturerVerified,

        gmp_verified:
          gmpVerified,

        coa_verified:
          coaVerified,

        quote_received:
          Boolean(quote),

        formula_received:
          Boolean(formula),

        evidence_score:
          score,

        eligible_for_procurement_review:
          hardGatePass,

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
      'EVIDENCE_WEIGHTED_RANKING',

    rows,

    procurement_authorized:
      false,

    purchase_order_submission_enabled:
      false,

    payment_enabled:
      false,

    sales_enabled:
      false
  });
});

router.post(
  '/review-board/evaluate',
  (req, res) => {

    const ranking =
      read(FILES.reviewBoard);

    const packet = {
      id:
        uid('review'),

      state:
        'HUMAN_REVIEW_REQUIRED',

      procurement_authorized:
        false,

      purchase_order_submission_enabled:
        false,

      payment_enabled:
        false,

      sales_enabled:
        false,

      evaluated_at:
        new Date().toISOString()
    };

    ranking.reviews.push(packet);

    ranking.procurement_authorized =
      false;

    write(
      FILES.reviewBoard,
      ranking
    );

    res.json(packet);
  }
);

module.exports = router;
