'use strict';

const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const router = express.Router();
router.use(express.json({ limit: '3mb' }));

const ROOT = path.join(__dirname, '..', '..');

const base = (...x) =>
  path.join(
    ROOT,
    'data',
    'product-engine',
    'acquisition',
    'm8',
    ...x
  );

const FILES = {
  suppliers:
    base('suppliers', 'matrix.json'),

  application:
    base('applications', 'prohealth.json'),

  documents:
    base('documents', 'registry.json'),

  quotes:
    base('quotes', 'registry.json'),

  formulas:
    base('formulas', 'registry.json'),

  shortlist:
    base('shortlist', 'registry.json')
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

function id(prefix) {
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

router.get('/health', (req, res) => {
  try {
    const suppliers =
      read(FILES.suppliers);

    res.json({
      ok: true,

      module:
        'CIWU_ALTERNATIVE_SUPPLIER_SELECTION_ENGINE',

      supplier_candidates:
        suppliers.suppliers.length,

      public_claims_are_verified_credentials:
        false,

      application_submission_enabled:
        false,

      quote_acceptance_enabled:
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
        'M8_ENGINE_UNAVAILABLE'
    });
  }
});

router.get('/suppliers', (req, res) => {
  res.json(
    read(FILES.suppliers)
  );
});

router.get(
  '/applications/prohealth',
  (req, res) => {
    res.json(
      read(FILES.application)
    );
  }
);

router.post(
  '/applications/prohealth',
  (req, res) => {
    const application =
      read(FILES.application);

    const allowed =
      Object.keys(
        application.fields
      );

    for (const field of allowed) {
      if (
        Object.prototype.hasOwnProperty.call(
          req.body || {},
          field
        )
      ) {
        application.fields[field] =
          req.body[field];
      }
    }

    application.state =
      'DRAFT_NOT_SUBMITTED';

    application.submission_enabled =
      false;

    write(
      FILES.application,
      application
    );

    res.json(application);
  }
);

router.post(
  '/applications/prohealth/submit',
  (req, res) => {
    res.status(403).json({
      error:
        'WHOLESALE_APPLICATION_SUBMISSION_DISABLED',

      state:
        'DRAFT_ONLY',

      human_action_required:
        true
    });
  }
);

router.post(
  '/documents',
  (req, res) => {
    const {
      supplier_id,
      filename,
      sha256,
      document_type,
      source,
      notes
    } = req.body || {};

    if (
      typeof supplier_id !== 'string' ||
      !supplier_id.trim()
    ) {
      return res.status(400).json({
        error:
          'SUPPLIER_ID_REQUIRED'
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
      typeof sha256 !== 'string' ||
      !/^[a-f0-9]{64}$/i.test(
        sha256
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

    const db =
      read(FILES.documents);

    const record = {
      id:
        id('document'),

      supplier_id:
        supplier_id.trim(),

      filename:
        filename.trim(),

      sha256:
        sha256.toLowerCase(),

      document_type:
        document_type.trim(),

      source:
        source.trim(),

      notes:
        notes || null,

      received:
        true,

      verified:
        false,

      verification_state:
        'REVIEW_REQUIRED',

      created_at:
        new Date().toISOString()
    };

    db.documents.push(record);

    write(
      FILES.documents,
      db
    );

    res.status(201).json(record);
  }
);

router.post(
  '/quotes',
  (req, res) => {
    const {
      supplier_id,
      currency,
      moq,
      unit_cost_cents,
      packaging_cents,
      setup_total_cents,
      freight_total_cents,
      testing_total_cents,
      lead_time_days,
      retail_price_cents,
      source_document_id
    } = req.body || {};

    const numbers = {
      moq,
      unit_cost_cents,
      packaging_cents,
      setup_total_cents,
      freight_total_cents,
      testing_total_cents,
      lead_time_days,
      retail_price_cents
    };

    for (
      const [field, value]
      of Object.entries(numbers)
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
      freight_total_cents +
      testing_total_cents;

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

    const db =
      read(FILES.quotes);

    const quote = {
      id:
        id('quote'),

      supplier_id,

      currency:
        currency || 'USD',

      moq,

      unit_cost_cents,

      packaging_cents,

      setup_total_cents,

      freight_total_cents,

      testing_total_cents,

      lead_time_days,

      retail_price_cents,

      landed_unit_cost_cents:
        landed,

      estimated_gross_profit_cents:
        gross,

      estimated_gross_margin_percent:
        margin,

      source_document_id:
        source_document_id || null,

      verified:
        false,

      selected:
        false,

      state:
        'RECEIVED_UNVERIFIED',

      created_at:
        new Date().toISOString()
    };

    db.quotes.push(quote);

    write(
      FILES.quotes,
      db
    );

    res.status(201).json(quote);
  }
);

router.post(
  '/formulas',
  (req, res) => {
    const {
      supplier_id,
      version,
      ingredients,
      source_document_id
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
      typeof version !== 'string' ||
      !version.trim()
    ) {
      return res.status(400).json({
        error:
          'FORMULA_VERSION_REQUIRED'
      });
    }

    if (!Array.isArray(ingredients)) {
      return res.status(400).json({
        error:
          'INGREDIENTS_REQUIRED'
      });
    }

    const db =
      read(FILES.formulas);

    const formula = {
      id:
        id('formula'),

      supplier_id,

      version:
        version.trim(),

      ingredients,

      formula_sha256:
        sha(ingredients),

      source_document_id:
        source_document_id || null,

      verified:
        false,

      selected:
        false,

      state:
        'RECEIVED_UNVERIFIED',

      created_at:
        new Date().toISOString()
    };

    db.formulas.push(formula);

    write(
      FILES.formulas,
      db
    );

    res.status(201).json(formula);
  }
);

router.get(
  '/compare',
  (req, res) => {
    const suppliers =
      read(FILES.suppliers)
        .suppliers;

    const quotes =
      read(FILES.quotes)
        .quotes;

    const documents =
      read(FILES.documents)
        .documents;

    const formulas =
      read(FILES.formulas)
        .formulas;

    const rows =
      suppliers.map(supplier => {
        const quote =
          quotes.find(
            q =>
              q.supplier_id ===
              supplier.id
          );

        const supplierDocs =
          documents.filter(
            d =>
              d.supplier_id ===
              supplier.id
          );

        const verifiedDocs =
          supplierDocs.filter(
            d =>
              d.verified === true
          );

        const formula =
          formulas.find(
            f =>
              f.supplier_id ===
              supplier.id
          );

        let score = 0;

        // Public capability/research signal only.
        if (
          supplier.public_claims
            ?.private_label === true ||
          supplier.public_claims
            ?.private_label_inquiry === true
        ) {
          score += 10;
        }

        if (
          supplier.public_claims
            ?.custom_formulation === true
        ) {
          score += 10;
        }

        // Real received information.
        if (quote) {
          score += 10;
        }

        if (
          quote?.verified === true
        ) {
          score += 20;
        }

        if (formula) {
          score += 10;
        }

        if (
          formula?.verified === true
        ) {
          score += 20;
        }

        score +=
          Math.min(
            20,
            verifiedDocs.length * 5
          );

        return {
          supplier_id:
            supplier.id,

          supplier_name:
            supplier.name,

          research_state:
            supplier.research_state,

          advertised_moq:
            supplier.public_moq_units,

          ciwu_quote_received:
            Boolean(quote),

          ciwu_quote_verified:
            quote?.verified === true,

          formula_received:
            Boolean(formula),

          formula_verified:
            formula?.verified === true,

          documents_received:
            supplierDocs.length,

          documents_verified:
            verifiedDocs.length,

          evidence_weighted_score:
            score,

          procurement_authorized:
            false
        };
      });

    rows.sort(
      (a, b) =>
        b.evidence_weighted_score -
        a.evidence_weighted_score
    );

    res.json({
      state:
        'DERIVED_COMPARISON',

      rows,

      warning:
        'Public claims are research inputs only and do not count as independently verified supplier credentials.',

      procurement_authorized:
        false,

      sales_enabled:
        false
    });
  }
);

router.post(
  '/shortlist/generate',
  (req, res) => {
    const suppliers =
      read(FILES.suppliers)
        .suppliers;

    const quotes =
      read(FILES.quotes)
        .quotes;

    const documents =
      read(FILES.documents)
        .documents;

    const formulas =
      read(FILES.formulas)
        .formulas;

    const shortlist =
      suppliers.map(supplier => {
        const quote =
          quotes.find(
            q =>
              q.supplier_id ===
              supplier.id &&
              q.verified === true
          );

        const formula =
          formulas.find(
            f =>
              f.supplier_id ===
              supplier.id &&
              f.verified === true
          );

        const verifiedDocs =
          documents.filter(
            d =>
              d.supplier_id ===
                supplier.id &&
              d.verified === true
          );

        const eligible =
          Boolean(quote) &&
          Boolean(formula) &&
          verifiedDocs.length > 0 &&
          supplier.ciwu_authorized === true;

        return {
          supplier_id:
            supplier.id,

          supplier_name:
            supplier.name,

          eligible_for_procurement_review:
            eligible,

          reason:
            eligible
              ? 'EVIDENCE_GATES_PRESENT'
              : 'VERIFIED_EVIDENCE_INCOMPLETE'
        };
      });

    const db =
      read(FILES.shortlist);

    db.state =
      'DERIVED_ONLY';

    db.shortlist =
      shortlist;

    write(
      FILES.shortlist,
      db
    );

    res.json({
      ...db,

      procurement_authorized:
        false,

      purchase_order_submission_enabled:
        false,

      sales_enabled:
        false
    });
  }
);

module.exports = router;
