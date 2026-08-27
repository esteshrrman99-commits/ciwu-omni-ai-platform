'use strict';

const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();

const ROOT =
  path.join(__dirname, '..', '..');

function read(relativePath) {
  return JSON.parse(
    fs.readFileSync(
      path.join(ROOT, relativePath),
      'utf8'
    )
  );
}

const PATHS = {
  suppliers:
    'data/product-engine/acquisition/m8/suppliers/matrix.json',

  responses:
    'data/product-engine/acquisition/m9/responses/registry.json',

  documents:
    'data/product-engine/acquisition/m9/documents/registry.json',

  verification:
    'data/product-engine/acquisition/m9/verification/registry.json',

  quotes:
    'data/product-engine/acquisition/m9/quotes/registry.json',

  formulas:
    'data/product-engine/acquisition/m9/formulas/registry.json',

  reviews:
    'data/product-engine/acquisition/m11/review-ledger/ledger.json'
};

function evidenceFor(supplierId) {
  const responses =
    read(PATHS.responses)
      .responses
      .filter(
        x => x.supplier_id === supplierId
      );

  const documents =
    read(PATHS.documents)
      .documents
      .filter(
        x => x.supplier_id === supplierId
      );

  const verification =
    read(PATHS.verification);

  const manufacturerVerified =
    verification
      .manufacturer_verifications
      .some(
        x =>
          x.supplier_id === supplierId &&
          x.verified === true
      );

  const gmpVerified =
    verification
      .gmp_verifications
      .some(
        x =>
          x.supplier_id === supplierId &&
          x.verified === true
      );

  const coaVerified =
    verification
      .coa_verifications
      .some(
        x =>
          x.supplier_id === supplierId &&
          x.verified === true
      );

  const quote =
    read(PATHS.quotes)
      .quotes
      .find(
        x => x.supplier_id === supplierId
      ) || null;

  const formula =
    read(PATHS.formulas)
      .formulas
      .find(
        x => x.supplier_id === supplierId
      ) || null;

  const gates = {
    response_received:
      responses.length > 0,

    manufacturer_verified:
      manufacturerVerified,

    gmp_verified:
      gmpVerified,

    coa_verified:
      coaVerified,

    quote_received:
      Boolean(quote),

    formula_received:
      Boolean(formula)
  };

  const complete =
    Object.values(gates)
      .every(Boolean);

  return {
    responses:
      responses.length,

    documents:
      documents.length,

    gates,

    quote,

    formula,

    evidence_complete:
      complete
  };
}

function supplierRows() {
  return read(PATHS.suppliers)
    .suppliers
    .map(supplier => {
      const evidence =
        evidenceFor(
          supplier.id
        );

      let score = 0;

      if (
        evidence.gates
          .response_received
      ) score += 10;

      if (
        evidence.gates
          .manufacturer_verified
      ) score += 20;

      if (
        evidence.gates
          .gmp_verified
      ) score += 20;

      if (
        evidence.gates
          .coa_verified
      ) score += 20;

      if (
        evidence.gates
          .quote_received
      ) score += 15;

      if (
        evidence.gates
          .formula_received
      ) score += 15;

      return {
        id:
          supplier.id,

        name:
          supplier.name,

        website:
          supplier.website,

        research_state:
          supplier.research_state,

        advertised_moq:
          supplier.public_moq_units,

        evidence_score:
          score,

        evidence_complete:
          evidence.evidence_complete,

        responses:
          evidence.responses,

        documents:
          evidence.documents,

        gates:
          evidence.gates,

        purchase_authorized:
          false
      };
    })
    .sort(
      (a, b) =>
        b.evidence_score -
        a.evidence_score
    );
}

router.get('/health', (req, res) => {
  try {
    const rows =
      supplierRows();

    res.json({
      ok: true,

      module:
        'CIWU_SUPPLIER_OPERATIONS_UI',

      supplier_count:
        rows.length,

      evidence_complete_suppliers:
        rows.filter(
          x => x.evidence_complete
        ).length,

      email_send_enabled:
        false,

      application_submission_enabled:
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
        'M12_UI_ENGINE_UNAVAILABLE'
    });
  }
});

router.get('/dashboard', (req, res) => {
  const rows =
    supplierRows();

  const reviews =
    read(PATHS.reviews)
      .entries;

  res.json({
    product:
      'CIWU Cellular Vitality',

    state:
      rows.some(
        x => x.evidence_complete
      )
        ? 'SUPPLIER_REVIEW_READY'
        : 'NO_VERIFIED_SUPPLIER',

    suppliers:
      rows,

    review_ledger_entries:
      reviews.length,

    controls: {
      email_send:
        'DISABLED',

      application_submission:
        'DISABLED',

      purchase_authorization:
        'DISABLED',

      purchase_order_submission:
        'DISABLED',

      payment:
        'DISABLED',

      sales:
        'HARD_DISABLED'
    }
  });
});

router.get(
  '/rfq/:supplierId',
  (req, res) => {
    const supplier =
      read(PATHS.suppliers)
        .suppliers
        .find(
          s =>
            s.id ===
            req.params.supplierId
        );

    if (!supplier) {
      return res.status(404).json({
        error:
          'SUPPLIER_NOT_FOUND'
      });
    }

    const rawQuantity =
      Number(
        req.query.quantity || 1000
      );

    const quantity =
      Number.isInteger(rawQuantity) &&
      rawQuantity > 0
        ? rawQuantity
        : 1000;

    const text = [
      'CIWU CELLULAR VITALITY',
      'PRIVATE-LABEL / CUSTOM MANUFACTURING RFQ',
      '',
      `Supplier: ${supplier.name}`,
      `Website: ${supplier.website || 'UNAVAILABLE'}`,
      `Target quantity: ${quantity} units`,
      '',
      'COMMERCIAL INFORMATION REQUESTED',
      '- Private-label availability',
      '- Custom formulation availability',
      '- MOQ',
      '- Unit price',
      '- Packaging price',
      '- Setup/tooling fees',
      '- Testing fees',
      '- Freight terms',
      '- Lead time',
      '- Payment terms',
      '',
      'QUALITY / MANUFACTURING EVIDENCE REQUESTED',
      '- Manufacturer legal identity',
      '- Manufacturing facility address',
      '- Current GMP documentation',
      '- Exact formula/specification',
      '- Ingredient quantities per serving',
      '- Ingredient source information',
      '- Representative COA',
      '- Lot-specific COA policy',
      '- Identity testing',
      '- Potency testing',
      '- Microbial testing',
      '- Heavy-metal testing',
      '- Stability/shelf-life information',
      '',
      'PACKAGING / LABEL',
      '- Bottle/count options',
      '- Label design support',
      '- Supplement Facts support',
      '- Tamper-evident closure options',
      '- Lot coding',
      '- Expiration dating',
      '',
      'CIWU CONTROL NOTICE',
      'This request is for evaluation only.',
      'No purchase commitment is created.',
      'Supplier statements require verification.',
      'Purchase authorization remains separately disabled.'
    ].join('\n');

    res
      .type('text/plain')
      .set(
        'Content-Disposition',
        `inline; filename="ciwu-${supplier.id}-rfq.txt"`
      )
      .send(text);
  }
);

router.get(
  '/review-board',
  (req, res) => {
    const rows =
      supplierRows();

    const ledger =
      read(PATHS.reviews);

    res.json({
      suppliers_ready_for_review:
        rows.filter(
          x => x.evidence_complete
        ),

      review_ledger:
        ledger.entries,

      purchase_authorization_enabled:
        false,

      po_submission_enabled:
        false,

      payment_enabled:
        false,

      sales_enabled:
        false
    });
  }
);

router.post(
  '/purchase-authorize',
  (req, res) => {

    res.status(403).json({
      error:
        'PURCHASE_AUTHORIZATION_DISABLED',

      policy:
        'SEPARATE_EXPLICIT_CONTROL_REQUIRED'
    });
  }
);

module.exports = router;
