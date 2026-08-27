'use strict';

const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const router = express.Router();

router.use(
  express.json({
    limit: '4mb'
  })
);

const ROOT =
  path.join(__dirname, '..', '..');

const FILES = {
  suppliers:
    path.join(
      ROOT,
      'data',
      'product-engine',
      'supplier-intake',
      'registry.json'
    ),

  rfqs:
    path.join(
      ROOT,
      'data',
      'product-engine',
      'rfq',
      'registry.json'
    ),

  manufacturers:
    path.join(
      ROOT,
      'data',
      'product-engine',
      'manufacturers',
      'registry.json'
    ),

  formulas:
    path.join(
      ROOT,
      'data',
      'product-engine',
      'formula-intake',
      'registry.json'
    ),

  coaBindings:
    path.join(
      ROOT,
      'data',
      'product-engine',
      'coa',
      'lot-bindings',
      'registry.json'
    ),

  labelReviews:
    path.join(
      ROOT,
      'data',
      'product-engine',
      'labels',
      'reviews',
      'registry.json'
    ),

  quotes:
    path.join(
      ROOT,
      'data',
      'product-engine',
      'quotes',
      'registry.json'
    ),

  procurement:
    path.join(
      ROOT,
      'data',
      'product-engine',
      'procurement',
      'readiness.json'
    ),

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
    )
};

function read(file) {
  return JSON.parse(
    fs.readFileSync(file, 'utf8')
  );
}

function write(file, value) {
  const tmp =
    `${file}.tmp-${process.pid}`;

  fs.writeFileSync(
    tmp,
    JSON.stringify(
      value,
      null,
      2
    ) + '\n',
    'utf8'
  );

  fs.renameSync(
    tmp,
    file
  );
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
    .update(
      JSON.stringify(value)
    )
    .digest('hex');
}

function integer(value) {
  return (
    Number.isInteger(value) &&
    value >= 0
  );
}

function findVerifiedEvidence(type) {
  const registry =
    read(FILES.evidence);

  return registry.evidence.filter(
    item =>
      item.type === type &&
      item.verified === true
  );
}

function procurementEvaluation() {
  const suppliers =
    read(FILES.suppliers).suppliers;

  const manufacturers =
    read(FILES.manufacturers)
      .manufacturers;

  const formulas =
    read(FILES.formulas)
      .specifications;

  const coaBindings =
    read(FILES.coaBindings)
      .bindings;

  const labelReviews =
    read(FILES.labelReviews)
      .reviews;

  const quotes =
    read(FILES.quotes)
      .quotes;

  const supplier =
    suppliers.find(
      item =>
        item.selected === true
    );

  const manufacturer =
    manufacturers.find(
      item =>
        item.selected === true
    );

  const formula =
    formulas.find(
      item =>
        item.selected === true
    );

  const coaBinding =
    coaBindings.find(
      item =>
        item.selected === true
    );

  const label =
    labelReviews.find(
      item =>
        item.selected === true
    );

  const quote =
    quotes.find(
      item =>
        item.selected === true
    );

  const gates = {
    supplier_verified:
      supplier?.verified === true,

    supplier_authorized:
      supplier?.private_label_authorized === true,

    manufacturer_verified:
      manufacturer?.verified === true,

    gmp_verified:
      manufacturer?.gmp_verified === true,

    formula_verified:
      formula?.verified === true,

    coa_lot_bound:
      coaBinding?.verified === true,

    label_release_approved:
      label?.release_approved === true,

    quote_verified:
      quote?.verified === true,

    moq_verified:
      Number.isInteger(
        quote?.moq
      ) &&
      quote.moq > 0,

    unit_economics_acceptable:
      quote?.economics_acceptable === true
  };

  const ready =
    Object.values(gates)
      .every(Boolean);

  return {
    gates,

    procurement_ready:
      ready,

    state:
      ready
        ? 'PROCUREMENT_READY'
        : 'BLOCKED',

    sales_enabled:
      false,

    notice:
      ready
        ? 'Procurement gates passed. Sales remain separately disabled.'
        : 'Critical supplier or product evidence remains incomplete.'
  };
}

router.get('/health', (req, res) => {
  try {
    const suppliers =
      read(FILES.suppliers);

    const quotes =
      read(FILES.quotes);

    const readiness =
      procurementEvaluation();

    res.json({
      ok: true,

      module:
        'CIWU_SUPPLIER_INTAKE_AND_PROCUREMENT_ENGINE',

      suppliers:
        suppliers.suppliers.length,

      quotes:
        quotes.quotes.length,

      procurement_state:
        readiness.state,

      sales_enabled:
        false,

      timestamp:
        new Date().toISOString()
    });

  } catch {
    res.status(500).json({
      ok: false,
      error:
        'M5_ENGINE_UNAVAILABLE'
    });
  }
});

router.get('/suppliers', (req, res) => {
  res.json(
    read(FILES.suppliers)
  );
});

router.post('/suppliers', (req, res) => {
  const {
    name,
    website,
    contact_name,
    contact_email,
    private_label_claimed,
    notes
  } = req.body || {};

  if (
    typeof name !== 'string' ||
    !name.trim()
  ) {
    return res.status(400).json({
      error:
        'SUPPLIER_NAME_REQUIRED'
    });
  }

  const registry =
    read(FILES.suppliers);

  const supplier = {
    id:
      uid('supplier'),

    name:
      name.trim(),

    website:
      website || null,

    contact_name:
      contact_name || null,

    contact_email:
      contact_email || null,

    private_label_claimed:
      private_label_claimed === true,

    private_label_authorized:
      false,

    verified:
      false,

    selected:
      false,

    state:
      'REVIEW_REQUIRED',

    notes:
      notes || null,

    created_at:
      new Date().toISOString()
  };

  supplier.record_sha256 =
    sha(supplier);

  registry.suppliers.push(
    supplier
  );

  write(
    FILES.suppliers,
    registry
  );

  res
    .status(201)
    .json(supplier);
});

router.post(
  '/suppliers/:id/verify',
  (req, res) => {
    const {
      reviewer,
      authorization_verified,
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

    const supplierEvidence =
      findVerifiedEvidence(
        'SUPPLIER_AUTHORIZATION'
      );

    if (
      authorization_verified === true &&
      supplierEvidence.length === 0
    ) {
      return res.status(409).json({
        error:
          'VERIFIED_SUPPLIER_AUTHORIZATION_EVIDENCE_REQUIRED'
      });
    }

    const registry =
      read(FILES.suppliers);

    const supplier =
      registry.suppliers.find(
        item =>
          item.id ===
          req.params.id
      );

    if (!supplier) {
      return res.status(404).json({
        error:
          'SUPPLIER_NOT_FOUND'
      });
    }

    supplier.verified = true;

    supplier.private_label_authorized =
      authorization_verified === true;

    supplier.state =
      authorization_verified === true
        ? 'VERIFIED'
        : 'VERIFIED_IDENTITY_AUTHORIZATION_PENDING';

    supplier.reviewer =
      reviewer.trim();

    supplier.verification_notes =
      verification_notes.trim();

    supplier.verified_at =
      new Date().toISOString();

    write(
      FILES.suppliers,
      registry
    );

    res.json(supplier);
  }
);

router.post(
  '/suppliers/:id/select',
  (req, res) => {
    const registry =
      read(FILES.suppliers);

    const supplier =
      registry.suppliers.find(
        item =>
          item.id ===
          req.params.id
      );

    if (!supplier) {
      return res.status(404).json({
        error:
          'SUPPLIER_NOT_FOUND'
      });
    }

    if (
      supplier.verified !== true ||
      supplier.private_label_authorized !== true
    ) {
      return res.status(409).json({
        error:
          'VERIFIED_AUTHORIZED_SUPPLIER_REQUIRED'
      });
    }

    for (
      const item
      of registry.suppliers
    ) {
      item.selected = false;
    }

    supplier.selected = true;

    write(
      FILES.suppliers,
      registry
    );

    res.json(supplier);
  }
);

router.get('/rfqs', (req, res) => {
  res.json(read(FILES.rfqs));
});

router.post('/rfqs', (req, res) => {
  const {
    supplier_id,
    target_quantity,
    dosage_form,
    packaging,
    requested_documents
  } = req.body || {};

  if (
    typeof supplier_id !== 'string' ||
    !supplier_id
  ) {
    return res.status(400).json({
      error:
        'SUPPLIER_ID_REQUIRED'
    });
  }

  if (
    !Number.isInteger(
      target_quantity
    ) ||
    target_quantity <= 0
  ) {
    return res.status(400).json({
      error:
        'VALID_TARGET_QUANTITY_REQUIRED'
    });
  }

  const supplierRegistry =
    read(FILES.suppliers);

  const supplier =
    supplierRegistry.suppliers.find(
      item =>
        item.id === supplier_id
    );

  if (!supplier) {
    return res.status(404).json({
      error:
        'SUPPLIER_NOT_FOUND'
    });
  }

  const registry =
    read(FILES.rfqs);

  const rfq = {
    id:
      uid('rfq'),

    supplier_id,

    target_quantity,

    dosage_form:
      dosage_form || null,

    packaging:
      packaging || null,

    requested_documents:
      Array.isArray(
        requested_documents
      )
        ? requested_documents
        : [
            'PRIVATE_LABEL_AUTHORIZATION',
            'FORMULA_SPECIFICATION',
            'COA',
            'GMP_DOCUMENTATION',
            'MANUFACTURER_IDENTITY',
            'PRICING',
            'MOQ',
            'LEAD_TIME'
          ],

    status:
      'DRAFT',

    created_at:
      new Date().toISOString()
  };

  registry.rfqs.push(rfq);

  write(
    FILES.rfqs,
    registry
  );

  res
    .status(201)
    .json(rfq);
});

router.get(
  '/manufacturers',
  (req, res) => {
    res.json(
      read(FILES.manufacturers)
    );
  }
);

router.post(
  '/manufacturers',
  (req, res) => {
    const {
      name,
      facility_address,
      country,
      gmp_claimed,
      supplier_id
    } = req.body || {};

    if (
      typeof name !== 'string' ||
      !name.trim()
    ) {
      return res.status(400).json({
        error:
          'MANUFACTURER_NAME_REQUIRED'
      });
    }

    const registry =
      read(FILES.manufacturers);

    const manufacturer = {
      id:
        uid('manufacturer'),

      name:
        name.trim(),

      facility_address:
        facility_address || null,

      country:
        country || null,

      supplier_id:
        supplier_id || null,

      gmp_claimed:
        gmp_claimed === true,

      gmp_verified:
        false,

      verified:
        false,

      selected:
        false,

      state:
        'REVIEW_REQUIRED',

      created_at:
        new Date().toISOString()
    };

    registry.manufacturers.push(
      manufacturer
    );

    write(
      FILES.manufacturers,
      registry
    );

    res
      .status(201)
      .json(manufacturer);
  }
);

router.post(
  '/manufacturers/:id/verify',
  (req, res) => {
    const {
      reviewer,
      gmp_verified,
      verification_notes
    } = req.body || {};

    const manufacturerEvidence =
      findVerifiedEvidence(
        'MANUFACTURER_IDENTITY'
      );

    const gmpEvidence =
      findVerifiedEvidence(
        'GMP_DOCUMENT'
      );

    if (
      manufacturerEvidence.length === 0
    ) {
      return res.status(409).json({
        error:
          'VERIFIED_MANUFACTURER_EVIDENCE_REQUIRED'
      });
    }

    if (
      gmp_verified === true &&
      gmpEvidence.length === 0
    ) {
      return res.status(409).json({
        error:
          'VERIFIED_GMP_EVIDENCE_REQUIRED'
      });
    }

    const registry =
      read(FILES.manufacturers);

    const manufacturer =
      registry.manufacturers.find(
        item =>
          item.id ===
          req.params.id
      );

    if (!manufacturer) {
      return res.status(404).json({
        error:
          'MANUFACTURER_NOT_FOUND'
      });
    }

    manufacturer.verified = true;
    manufacturer.gmp_verified =
      gmp_verified === true;

    manufacturer.reviewer =
      reviewer || null;

    manufacturer.verification_notes =
      verification_notes || null;

    manufacturer.state =
      manufacturer.gmp_verified
        ? 'VERIFIED'
        : 'MANUFACTURER_VERIFIED_GMP_PENDING';

    manufacturer.verified_at =
      new Date().toISOString();

    write(
      FILES.manufacturers,
      registry
    );

    res.json(manufacturer);
  }
);

router.post(
  '/manufacturers/:id/select',
  (req, res) => {
    const registry =
      read(FILES.manufacturers);

    const manufacturer =
      registry.manufacturers.find(
        item =>
          item.id ===
          req.params.id
      );

    if (!manufacturer) {
      return res.status(404).json({
        error:
          'MANUFACTURER_NOT_FOUND'
      });
    }

    if (
      manufacturer.verified !== true ||
      manufacturer.gmp_verified !== true
    ) {
      return res.status(409).json({
        error:
          'VERIFIED_GMP_MANUFACTURER_REQUIRED'
      });
    }

    registry.manufacturers
      .forEach(
        item =>
          item.selected = false
      );

    manufacturer.selected = true;

    write(
      FILES.manufacturers,
      registry
    );

    res.json(manufacturer);
  }
);

router.get(
  '/formula-specifications',
  (req, res) => {
    res.json(
      read(FILES.formulas)
    );
  }
);

router.post(
  '/formula-specifications',
  (req, res) => {
    const {
      version,
      supplier_id,
      ingredients,
      source_evidence_id
    } = req.body || {};

    if (
      typeof version !== 'string' ||
      !version.trim()
    ) {
      return res.status(400).json({
        error:
          'FORMULA_VERSION_REQUIRED'
      });
    }

    if (
      !Array.isArray(ingredients)
    ) {
      return res.status(400).json({
        error:
          'INGREDIENTS_REQUIRED'
      });
    }

    const registry =
      read(FILES.formulas);

    const record = {
      id:
        uid('formula-spec'),

      version:
        version.trim(),

      supplier_id:
        supplier_id || null,

      ingredients,

      source_evidence_id:
        source_evidence_id || null,

      verified:
        false,

      selected:
        false,

      state:
        'REVIEW_REQUIRED',

      formula_sha256:
        sha(ingredients),

      created_at:
        new Date().toISOString()
    };

    registry.specifications.push(
      record
    );

    write(
      FILES.formulas,
      registry
    );

    res
      .status(201)
      .json(record);
  }
);

router.post(
  '/formula-specifications/:id/verify',
  (req, res) => {
    const evidence =
      findVerifiedEvidence(
        'FORMULA_SPECIFICATION'
      );

    if (evidence.length === 0) {
      return res.status(409).json({
        error:
          'VERIFIED_FORMULA_EVIDENCE_REQUIRED'
      });
    }

    const registry =
      read(FILES.formulas);

    const formula =
      registry.specifications.find(
        item =>
          item.id ===
          req.params.id
      );

    if (!formula) {
      return res.status(404).json({
        error:
          'FORMULA_SPEC_NOT_FOUND'
      });
    }

    formula.verified = true;
    formula.state = 'VERIFIED';
    formula.reviewer =
      req.body?.reviewer || null;

    formula.verified_at =
      new Date().toISOString();

    write(
      FILES.formulas,
      registry
    );

    res.json(formula);
  }
);

router.post(
  '/formula-specifications/:id/select',
  (req, res) => {
    const registry =
      read(FILES.formulas);

    const formula =
      registry.specifications.find(
        item =>
          item.id ===
          req.params.id
      );

    if (!formula) {
      return res.status(404).json({
        error:
          'FORMULA_SPEC_NOT_FOUND'
      });
    }

    if (formula.verified !== true) {
      return res.status(409).json({
        error:
          'VERIFIED_FORMULA_REQUIRED'
      });
    }

    registry.specifications
      .forEach(
        item =>
          item.selected = false
      );

    formula.selected = true;

    write(
      FILES.formulas,
      registry
    );

    res.json(formula);
  }
);

router.get(
  '/coa-bindings',
  (req, res) => {
    res.json(
      read(FILES.coaBindings)
    );
  }
);

router.post(
  '/coa-bindings',
  (req, res) => {
    const {
      lot_id,
      coa_evidence_id,
      supplier_id
    } = req.body || {};

    const evidence =
      read(FILES.evidence);

    const coa =
      evidence.evidence.find(
        item =>
          item.id === coa_evidence_id &&
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
          'VERIFIED_COA_REQUIRED'
      });
    }

    const lots =
      read(FILES.lots);

    const lot =
      lots.lots.find(
        item =>
          item.id === lot_id
      );

    if (!lot) {
      return res.status(404).json({
        error:
          'LOT_NOT_FOUND'
      });
    }

    const registry =
      read(FILES.coaBindings);

    const binding = {
      id:
        uid('coa-binding'),

      lot_id,

      lot_number:
        lot.lot_number,

      coa_evidence_id,

      supplier_id:
        supplier_id || null,

      verified:
        true,

      selected:
        false,

      state:
        'VERIFIED_BINDING',

      bound_at:
        new Date().toISOString()
    };

    registry.bindings.push(
      binding
    );

    write(
      FILES.coaBindings,
      registry
    );

    res
      .status(201)
      .json(binding);
  }
);

router.post(
  '/coa-bindings/:id/select',
  (req, res) => {
    const registry =
      read(FILES.coaBindings);

    const binding =
      registry.bindings.find(
        item =>
          item.id ===
          req.params.id
      );

    if (!binding) {
      return res.status(404).json({
        error:
          'COA_BINDING_NOT_FOUND'
      });
    }

    if (binding.verified !== true) {
      return res.status(409).json({
        error:
          'VERIFIED_COA_BINDING_REQUIRED'
      });
    }

    registry.bindings
      .forEach(
        item =>
          item.selected = false
      );

    binding.selected = true;

    write(
      FILES.coaBindings,
      registry
    );

    res.json(binding);
  }
);

router.get(
  '/label-reviews',
  (req, res) => {
    res.json(
      read(FILES.labelReviews)
    );
  }
);

router.post(
  '/label-reviews',
  (req, res) => {
    const {
      version,
      reviewer,
      formula_matches_label,
      required_statements_reviewed,
      claims_reviewed,
      artwork_reviewed
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

    const releaseApproved =
      formula_matches_label === true &&
      required_statements_reviewed === true &&
      claims_reviewed === true &&
      artwork_reviewed === true;

    const registry =
      read(FILES.labelReviews);

    const review = {
      id:
        uid('label-review'),

      version:
        version || 'UNSPECIFIED',

      reviewer:
        reviewer.trim(),

      formula_matches_label:
        formula_matches_label === true,

      required_statements_reviewed:
        required_statements_reviewed === true,

      claims_reviewed:
        claims_reviewed === true,

      artwork_reviewed:
        artwork_reviewed === true,

      release_approved:
        releaseApproved,

      selected:
        false,

      state:
        releaseApproved
          ? 'APPROVED_FOR_PRODUCT_RELEASE'
          : 'REVIEW_INCOMPLETE',

      reviewed_at:
        new Date().toISOString()
    };

    registry.reviews.push(
      review
    );

    write(
      FILES.labelReviews,
      registry
    );

    res
      .status(201)
      .json(review);
  }
);

router.post(
  '/label-reviews/:id/select',
  (req, res) => {
    const registry =
      read(FILES.labelReviews);

    const review =
      registry.reviews.find(
        item =>
          item.id ===
          req.params.id
      );

    if (!review) {
      return res.status(404).json({
        error:
          'LABEL_REVIEW_NOT_FOUND'
      });
    }

    if (
      review.release_approved !== true
    ) {
      return res.status(409).json({
        error:
          'APPROVED_LABEL_REVIEW_REQUIRED'
      });
    }

    registry.reviews
      .forEach(
        item =>
          item.selected = false
      );

    review.selected = true;

    write(
      FILES.labelReviews,
      registry
    );

    res.json(review);
  }
);

router.get('/quotes', (req, res) => {
  res.json(
    read(FILES.quotes)
  );
});

router.post('/quotes', (req, res) => {
  const {
    supplier_id,
    currency,
    moq,
    unit_cost_cents,
    packaging_cents,
    freight_cents,
    setup_cents,
    lead_time_days,
    retail_price_cents,
    source_evidence_id
  } = req.body || {};

  const numeric = {
    moq,
    unit_cost_cents,
    packaging_cents,
    freight_cents,
    setup_cents,
    lead_time_days,
    retail_price_cents
  };

  for (
    const [field, value]
    of Object.entries(numeric)
  ) {
    if (
      !integer(value) ||
      (
        field === 'moq' &&
        value <= 0
      )
    ) {
      return res.status(400).json({
        error:
          'INVALID_QUOTE_FIELD',
        field
      });
    }
  }

  const allocated =
    Math.ceil(
      (
        freight_cents +
        setup_cents
      ) / moq
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

  const registry =
    read(FILES.quotes);

  const quote = {
    id:
      uid('quote'),

    supplier_id:
      supplier_id || null,

    currency:
      currency || 'USD',

    moq,

    unit_cost_cents,

    packaging_cents,

    freight_cents,

    setup_cents,

    lead_time_days,

    retail_price_cents,

    landed_unit_cost_cents:
      landed,

    estimated_gross_profit_cents:
      gross,

    estimated_gross_margin_percent:
      margin,

    source_evidence_id:
      source_evidence_id || null,

    verified:
      false,

    economics_acceptable:
      false,

    selected:
      false,

    state:
      'UNVERIFIED',

    created_at:
      new Date().toISOString()
  };

  registry.quotes.push(quote);

  write(
    FILES.quotes,
    registry
  );

  res
    .status(201)
    .json(quote);
});

router.post(
  '/quotes/:id/verify',
  (req, res) => {
    const pricingEvidence =
      findVerifiedEvidence(
        'PRICING'
      );

    if (pricingEvidence.length === 0) {
      return res.status(409).json({
        error:
          'VERIFIED_PRICING_EVIDENCE_REQUIRED'
      });
    }

    const registry =
      read(FILES.quotes);

    const quote =
      registry.quotes.find(
        item =>
          item.id ===
          req.params.id
      );

    if (!quote) {
      return res.status(404).json({
        error:
          'QUOTE_NOT_FOUND'
      });
    }

    quote.verified = true;

    quote.economics_acceptable =
      req.body?.economics_acceptable === true;

    quote.reviewer =
      req.body?.reviewer || null;

    quote.state =
      'VERIFIED';

    quote.verified_at =
      new Date().toISOString();

    write(
      FILES.quotes,
      registry
    );

    res.json(quote);
  }
);

router.post(
  '/quotes/:id/select',
  (req, res) => {
    const registry =
      read(FILES.quotes);

    const quote =
      registry.quotes.find(
        item =>
          item.id ===
          req.params.id
      );

    if (!quote) {
      return res.status(404).json({
        error:
          'QUOTE_NOT_FOUND'
      });
    }

    if (
      quote.verified !== true ||
      quote.economics_acceptable !== true
    ) {
      return res.status(409).json({
        error:
          'VERIFIED_ACCEPTABLE_QUOTE_REQUIRED'
      });
    }

    registry.quotes
      .forEach(
        item =>
          item.selected = false
      );

    quote.selected = true;

    write(
      FILES.quotes,
      registry
    );

    res.json(quote);
  }
);

router.get(
  '/quotes/compare',
  (req, res) => {
    const quotes =
      read(FILES.quotes)
        .quotes;

    const ranked =
      [...quotes]
        .map(item => ({
          ...item,

          qualification_score:
            (
              item.verified
                ? 40
                : 0
            )
            +
            (
              item.economics_acceptable
                ? 30
                : 0
            )
            +
            (
              Number.isInteger(
                item.lead_time_days
              )
                ? Math.max(
                    0,
                    20 -
                    Math.floor(
                      item.lead_time_days /
                      5
                    )
                  )
                : 0
            )
            +
            (
              Number.isFinite(
                item.estimated_gross_margin_percent
              )
                ? Math.max(
                    0,
                    Math.min(
                      10,
                      Math.floor(
                        item.estimated_gross_margin_percent /
                        5
                      )
                    )
                  )
                : 0
            )
        }))
        .sort(
          (a, b) =>
            b.qualification_score -
            a.qualification_score
        );

    res.json({
      state:
        'DERIVED_COMPARISON',

      quotes:
        ranked,

      notice:
        'Ranking supports review only. It does not authorize procurement or commercial release.'
    });
  }
);

router.get(
  '/procurement/readiness',
  (req, res) => {
    res.json(
      procurementEvaluation()
    );
  }
);

router.post(
  '/procurement/evaluate',
  (req, res) => {
    const evaluation =
      procurementEvaluation();

    const state =
      read(FILES.procurement);

    state.state =
      evaluation.state;

    state.last_evaluation = {
      ...evaluation,

      evaluated_at:
        new Date().toISOString()
    };

    write(
      FILES.procurement,
      state
    );

    res.json(
      state.last_evaluation
    );
  }
);

module.exports = router;
