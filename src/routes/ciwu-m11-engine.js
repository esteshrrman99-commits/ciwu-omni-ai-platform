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

const base = (...parts) =>
  path.join(
    ROOT,
    'data',
    'product-engine',
    'acquisition',
    'm11',
    ...parts
  );

const FILES = {
  packets:
    base(
      'packets',
      'registry.json'
    ),

  intakeCommands:
    base(
      'intake-commands',
      'registry.json'
    ),

  checklists:
    base(
      'checklists',
      'registry.json'
    ),

  dashboard:
    base(
      'dashboard',
      'state.json'
    ),

  reviewPackets:
    base(
      'review-packets',
      'registry.json'
    ),

  reviewLedger:
    base(
      'review-ledger',
      'ledger.json'
    ),

  suppliers:
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
    fs.readFileSync(
      file,
      'utf8'
    )
  );
}

function write(file, data) {
  const tmp =
    `${file}.tmp-${process.pid}`;

  fs.writeFileSync(
    tmp,
    JSON.stringify(
      data,
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

function supplierById(id) {
  return (
    read(FILES.suppliers)
      .suppliers
      .find(
        supplier =>
          supplier.id === id
      ) || null
  );
}

function supplierEvidence(id) {
  const responses =
    read(FILES.m9Responses)
      .responses
      .filter(
        x =>
          x.supplier_id === id
      );

  const documents =
    read(FILES.m9Documents)
      .documents
      .filter(
        x =>
          x.supplier_id === id
      );

  const verification =
    read(FILES.m9Verification);

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

  const quote =
    read(FILES.m9Quotes)
      .quotes
      .find(
        x =>
          x.supplier_id === id
      ) || null;

  const formula =
    read(FILES.m9Formulas)
      .formulas
      .find(
        x =>
          x.supplier_id === id
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

  const evidenceComplete =
    Object.values(gates)
      .every(Boolean);

  return {
    responses,
    documents,
    manufacturer_verified:
      manufacturerVerified,
    gmp_verified:
      gmpVerified,
    coa_verified:
      coaVerified,
    quote,
    formula,
    gates,
    evidence_complete:
      evidenceComplete
  };
}

function comparisonRows() {
  const suppliers =
    read(FILES.suppliers)
      .suppliers;

  return suppliers
    .map(supplier => {
      const evidence =
        supplierEvidence(
          supplier.id
        );

      let score = 0;

      if (
        evidence.gates
          .response_received
      ) {
        score += 10;
      }

      if (
        evidence
          .manufacturer_verified
      ) {
        score += 20;
      }

      if (
        evidence
          .gmp_verified
      ) {
        score += 20;
      }

      if (
        evidence
          .coa_verified
      ) {
        score += 20;
      }

      if (
        evidence.quote
      ) {
        score += 15;
      }

      if (
        evidence.formula
      ) {
        score += 15;
      }

      return {
        supplier_id:
          supplier.id,

        supplier_name:
          supplier.name,

        research_state:
          supplier.research_state,

        advertised_moq:
          supplier.public_moq_units,

        gates:
          evidence.gates,

        evidence_score:
          score,

        evidence_complete:
          evidence.evidence_complete,

        eligible_for_human_procurement_review:
          evidence.evidence_complete,

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

router.get(
  '/health',
  (req, res) => {
    try {
      const ledger =
        read(FILES.reviewLedger);

      res.json({
        ok: true,

        module:
          'CIWU_SUPPLIER_PACKET_OUTREACH_CONTROL',

        human_reviews:
          ledger.entries.length,

        email_send_enabled:
          false,

        application_submission_enabled:
          false,

        quote_acceptance_enabled:
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
          'M11_ENGINE_UNAVAILABLE'
      });
    }
  }
);

router.post(
  '/packets/generate',
  (req, res) => {
    const {
      supplier_id,
      contact_name,
      contact_email,
      target_quantity
    } = req.body || {};

    const supplier =
      supplierById(
        supplier_id
      );

    if (!supplier) {
      return res.status(404).json({
        error:
          'SUPPLIER_NOT_FOUND'
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

    const lines = [
      'CIWU CELLULAR VITALITY',
      'PRIVATE-LABEL / CUSTOM MANUFACTURING RFQ',
      '',
      `Supplier: ${supplier.name}`,
      `Contact: ${contact_name || 'UNVERIFIED'}`,
      `Email: ${contact_email || 'UNVERIFIED'}`,
      `Target quantity: ${target_quantity}`,
      '',
      'REQUESTED COMMERCIAL INFORMATION',
      '- private-label availability',
      '- custom formulation availability',
      '- minimum order quantity',
      '- unit pricing',
      '- packaging cost',
      '- setup/tooling cost',
      '- testing cost',
      '- freight terms',
      '- production lead time',
      '- payment terms',
      '',
      'REQUESTED QUALITY / MANUFACTURING EVIDENCE',
      '- manufacturer legal identity',
      '- manufacturing facility address',
      '- current GMP documentation',
      '- exact formula/specification',
      '- ingredient quantities per serving',
      '- ingredient source information',
      '- representative COA',
      '- lot-specific COA policy',
      '- identity testing',
      '- potency testing',
      '- microbial testing',
      '- heavy-metal testing',
      '- stability/shelf-life information',
      '',
      'LABEL / PACKAGING',
      '- label design support',
      '- Supplement Facts support',
      '- bottle/count options',
      '- closure/seal options',
      '- lot coding',
      '- expiration dating',
      '',
      'CIWU CONTROL NOTICE',
      'Receipt of this RFQ does not create a purchase commitment.',
      'All supplier statements remain subject to evidence verification.',
      'No purchase order or commercial release is authorized by this packet.'
    ];

    const packet = {
      id:
        uid('supplier-packet'),

      supplier_id:
        supplier.id,

      supplier_name:
        supplier.name,

      contact_name:
        contact_name || null,

      contact_email:
        contact_email || null,

      target_quantity,

      text:
        lines.join('\n'),

      packet_sha256:
        sha(lines),

      state:
        'READY_NOT_SENT',

      external_send_enabled:
        false,

      created_at:
        new Date().toISOString()
    };

    const db =
      read(FILES.packets);

    db.packets.push(
      packet
    );

    write(
      FILES.packets,
      db
    );

    res.status(201).json(
      packet
    );
  }
);

router.post(
  '/packets/:id/send',
  (req, res) => {
    res.status(403).json({
      error:
        'SUPPLIER_SEND_DISABLED',

      human_action_required:
        true
    });
  }
);

router.post(
  '/intake-command/generate',
  (req, res) => {
    const {
      supplier_id,
      source_type
    } = req.body || {};

    const supplier =
      supplierById(
        supplier_id
      );

    if (!supplier) {
      return res.status(404).json({
        error:
          'SUPPLIER_NOT_FOUND'
      });
    }

    const template = {
      id:
        uid('intake-template'),

      supplier_id:
        supplier.id,

      supplier_name:
        supplier.name,

      source_type:
        source_type ||
        'SUPPLIER_RESPONSE',

      instructions: [
        '1. Save the supplier response/document locally.',
        '2. Calculate SHA-256 before review.',
        '3. Record supplier identity and original source.',
        '4. Register response through M9 response intake.',
        '5. Register each attached document separately.',
        '6. Do not mark any document verified during intake.',
        '7. Route GMP, manufacturer and COA documents to review.',
        '8. Enter quote/formula only from source-backed documents.',
        '9. Run comparison matrix after verification.',
        '10. Preserve original evidence.'
      ],

      state:
        'TEMPLATE_ONLY',

      created_at:
        new Date().toISOString()
    };

    const db =
      read(FILES.intakeCommands);

    db.templates.push(
      template
    );

    write(
      FILES.intakeCommands,
      db
    );

    res.status(201).json(
      template
    );
  }
);

router.post(
  '/checklists/generate',
  (req, res) => {
    const {
      supplier_id
    } = req.body || {};

    const supplier =
      supplierById(
        supplier_id
      );

    if (!supplier) {
      return res.status(404).json({
        error:
          'SUPPLIER_NOT_FOUND'
      });
    }

    const checklist = {
      id:
        uid('checklist'),

      supplier_id:
        supplier.id,

      supplier_name:
        supplier.name,

      sections: {
        identity: [
          'Supplier legal identity',
          'Manufacturer legal identity',
          'Manufacturing facility address',
          'Business contact verification'
        ],

        quality: [
          'Current GMP evidence',
          'COA authenticity',
          'Lot number present',
          'Identity test result',
          'Potency test result',
          'Microbial test result',
          'Heavy-metal test result'
        ],

        formula: [
          'Complete ingredient list',
          'Quantity per serving',
          'Units normalized',
          'Formula source document',
          'Formula-to-label match'
        ],

        commercial: [
          'MOQ',
          'Unit price',
          'Packaging cost',
          'Testing cost',
          'Setup/tooling cost',
          'Freight',
          'Lead time',
          'Payment terms'
        ],

        release: [
          'Label review',
          'Lot traceability',
          'Verified supplier authorization',
          'Procurement review completed'
        ]
      },

      completion_state:
        'NOT_COMPLETED',

      verification_state:
        'NOT_VERIFIED',

      created_at:
        new Date().toISOString()
    };

    const db =
      read(FILES.checklists);

    db.checklists.push(
      checklist
    );

    write(
      FILES.checklists,
      db
    );

    res.status(201).json(
      checklist
    );
  }
);

router.get(
  '/dashboard',
  (req, res) => {
    const rows =
      comparisonRows();

    const complete =
      rows.filter(
        row =>
          row.evidence_complete
      );

    res.json({
      state:
        complete.length > 0
          ? 'SUPPLIERS_READY_FOR_HUMAN_REVIEW'
          : 'NO_VERIFIED_SUPPLIER',

      supplier_count:
        rows.length,

      review_ready_count:
        complete.length,

      rows,

      purchase_authorization_enabled:
        false,

      purchase_order_submission_enabled:
        false,

      payment_enabled:
        false,

      sales_enabled:
        false,

      generated_at:
        new Date().toISOString()
    });
  }
);

router.post(
  '/review-packets/generate',
  (req, res) => {
    const {
      supplier_id
    } = req.body || {};

    const supplier =
      supplierById(
        supplier_id
      );

    if (!supplier) {
      return res.status(404).json({
        error:
          'SUPPLIER_NOT_FOUND'
      });
    }

    const evidence =
      supplierEvidence(
        supplier_id
      );

    const packet = {
      id:
        uid('review-packet'),

      supplier_id,

      supplier_name:
        supplier.name,

      evidence_gates:
        evidence.gates,

      evidence_complete:
        evidence.evidence_complete,

      response_count:
        evidence.responses.length,

      document_count:
        evidence.documents.length,

      quote:
        evidence.quote,

      formula:
        evidence.formula,

      recommendation_state:
        evidence.evidence_complete
          ? 'READY_FOR_HUMAN_REVIEW'
          : 'EVIDENCE_INCOMPLETE',

      human_review_status:
        'PENDING',

      purchase_authorized:
        false,

      po_submission_enabled:
        false,

      payment_enabled:
        false,

      sales_enabled:
        false,

      generated_at:
        new Date().toISOString()
    };

    packet.sha256 =
      sha(packet);

    const db =
      read(FILES.reviewPackets);

    db.packets.push(
      packet
    );

    write(
      FILES.reviewPackets,
      db
    );

    res.status(201).json(
      packet
    );
  }
);

router.post(
  '/review',
  (req, res) => {
    const {
      review_packet_id,
      reviewer,
      decision,
      rationale
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
      ![
        'APPROVE_FOR_PROCUREMENT_PLANNING',
        'REJECT',
        'NEEDS_MORE_EVIDENCE'
      ].includes(decision)
    ) {
      return res.status(400).json({
        error:
          'VALID_REVIEW_DECISION_REQUIRED'
      });
    }

    const packets =
      read(FILES.reviewPackets);

    const packet =
      packets.packets.find(
        item =>
          item.id ===
          review_packet_id
      );

    if (!packet) {
      return res.status(404).json({
        error:
          'REVIEW_PACKET_NOT_FOUND'
      });
    }

    if (
      decision ===
        'APPROVE_FOR_PROCUREMENT_PLANNING' &&
      packet.evidence_complete !== true
    ) {
      return res.status(409).json({
        error:
          'EVIDENCE_COMPLETE_REQUIRED_FOR_APPROVAL'
      });
    }

    const entry = {
      id:
        uid('human-review'),

      review_packet_id,

      supplier_id:
        packet.supplier_id,

      reviewer:
        reviewer.trim(),

      decision,

      rationale:
        rationale || null,

      procurement_planning_approved:
        decision ===
        'APPROVE_FOR_PROCUREMENT_PLANNING',

      purchase_authorized:
        false,

      purchase_order_submission_enabled:
        false,

      payment_enabled:
        false,

      sales_enabled:
        false,

      reviewed_at:
        new Date().toISOString()
    };

    entry.sha256 =
      sha(entry);

    const ledger =
      read(FILES.reviewLedger);

    ledger.entries.push(
      entry
    );

    ledger.purchase_authorization_enabled =
      false;

    write(
      FILES.reviewLedger,
      ledger
    );

    res.status(201).json(
      entry
    );
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
