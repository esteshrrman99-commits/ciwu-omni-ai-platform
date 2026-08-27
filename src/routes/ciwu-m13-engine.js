'use strict';

const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();

const ROOT =
  path.join(__dirname, '..', '..');

const CONFIG =
  path.join(
    ROOT,
    'config',
    'm13-contact-workflow.json'
  );

const SUPPLIERS =
  path.join(
    ROOT,
    'data',
    'product-engine',
    'acquisition',
    'm8',
    'suppliers',
    'matrix.json'
  );

const RESPONSES =
  path.join(
    ROOT,
    'data',
    'product-engine',
    'acquisition',
    'm9',
    'responses',
    'registry.json'
  );

const DOCUMENTS =
  path.join(
    ROOT,
    'data',
    'product-engine',
    'acquisition',
    'm9',
    'documents',
    'registry.json'
  );

const VERIFICATION =
  path.join(
    ROOT,
    'data',
    'product-engine',
    'acquisition',
    'm9',
    'verification',
    'registry.json'
  );

const QUOTES =
  path.join(
    ROOT,
    'data',
    'product-engine',
    'acquisition',
    'm9',
    'quotes',
    'registry.json'
  );

const FORMULAS =
  path.join(
    ROOT,
    'data',
    'product-engine',
    'acquisition',
    'm9',
    'formulas',
    'registry.json'
  );

function read(file) {
  return JSON.parse(
    fs.readFileSync(
      file,
      'utf8'
    )
  );
}

function evidenceRows() {
  const suppliers =
    read(SUPPLIERS)
      .suppliers;

  const responses =
    read(RESPONSES)
      .responses;

  const documents =
    read(DOCUMENTS)
      .documents;

  const verification =
    read(VERIFICATION);

  const quotes =
    read(QUOTES)
      .quotes;

  const formulas =
    read(FORMULAS)
      .formulas;

  return suppliers.map(
    supplier => {
      const id =
        supplier.id;

      const supplierResponses =
        responses.filter(
          x =>
            x.supplier_id === id
        );

      const supplierDocuments =
        documents.filter(
          x =>
            x.supplier_id === id
        );

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
        quotes.find(
          x =>
            x.supplier_id === id
        );

      const formula =
        formulas.find(
          x =>
            x.supplier_id === id
        );

      return {
        supplier_id:
          id,

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

        evidence_complete:
          Boolean(
            manufacturerVerified &&
            gmpVerified &&
            coaVerified &&
            quote &&
            formula
          ),

        purchase_authorized:
          false
      };
    }
  );
}

router.get(
  '/health',
  (req, res) => {
    try {
      const config =
        read(CONFIG);

      res.json({
        ok: true,

        module:
          'CIWU_REAL_SUPPLIER_CONTACT_WORKFLOW',

        official_wholesale_contact:
          'VERIFIED_PUBLIC',

        private_business_profile:
          'LOCAL_ONLY_NOT_PUBLIC',

        application_submission_enabled:
          false,

        email_send_enabled:
          false,

        purchase_authorization_enabled:
          false,

        purchase_order_submission_enabled:
          false,

        payment_enabled:
          false,

        sales_enabled:
          false,

        version:
          config.version,

        timestamp:
          new Date().toISOString()
      });

    } catch {
      res.status(500).json({
        ok: false,
        error:
          'M13_ENGINE_UNAVAILABLE'
      });
    }
  }
);

router.get(
  '/contacts',
  (req, res) => {
    const config =
      read(CONFIG);

    res.json({
      supplier:
        config.prohealth
          .supplier_name,

      website:
        config.prohealth
          .website,

      application:
        config.prohealth
          .wholesale_application,

      wholesale:
        config.prohealth
          .wholesale_contact,

      bulk_ingredient:
        config.prohealth
          .bulk_ingredient_contact,

      ciwu_authorization:
        'UNVERIFIED',

      external_send_enabled:
        false
    });
  }
);

router.get(
  '/application-schema',
  (req, res) => {
    const config =
      read(CONFIG);

    res.json({
      supplier:
        'ProHealth Longevity',

      required_fields:
        config
          .application_required_fields,

      private_profile_storage:
        'LOCAL_ONLY',

      private_profile_exposed:
        false,

      submission_enabled:
        false
    });
  }
);

router.get(
  '/evidence-console',
  (req, res) => {
    const rows =
      evidenceRows();

    res.json({
      state:
        rows.some(
          x =>
            x.evidence_complete
        )
          ? 'EVIDENCE_REVIEW_READY'
          : 'NO_EVIDENCE_COMPLETE_SUPPLIER',

      rows,

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
  '/application/submit',
  (req, res) => {
    res.status(403).json({
      error:
        'APPLICATION_SUBMISSION_DISABLED',

      human_action_required:
        true
    });
  }
);

router.post(
  '/email/send',
  (req, res) => {
    res.status(403).json({
      error:
        'SUPPLIER_EMAIL_SEND_DISABLED',

      human_action_required:
        true
    });
  }
);

router.post(
  '/purchase-authorize',
  (req, res) => {
    res.status(403).json({
      error:
        'PURCHASE_AUTHORIZATION_DISABLED'
    });
  }
);

module.exports = router;
