'use strict';

const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const router = express.Router();
router.use(express.json({ limit: '2mb' }));

const ROOT = path.join(__dirname, '..', '..');

const op = (...x) =>
  path.join(
    ROOT,
    'data',
    'product-engine',
    'operations',
    ...x
  );

const files = {
  contacts: op('contacts','registry.json'),
  outbox: op('outbox','registry.json'),
  documents: op('documents','registry.json'),
  quotes: op('quotes','registry.json'),
  scorecards: op('scorecards','registry.json'),
  crosschecks: op('crosschecks','registry.json'),
  traceability: op('traceability','registry.json'),
  decisions: op('decisions','registry.json'),
  pos: op('purchase-orders','registry.json'),

  suppliers:
    path.join(
      ROOT,
      'data/product-engine/supplier-intake/registry.json'
    ),

  manufacturers:
    path.join(
      ROOT,
      'data/product-engine/manufacturers/registry.json'
    ),

  formulas:
    path.join(
      ROOT,
      'data/product-engine/formula-intake/registry.json'
    ),

  bindings:
    path.join(
      ROOT,
      'data/product-engine/coa/lot-bindings/registry.json'
    ),

  labels:
    path.join(
      ROOT,
      'data/product-engine/labels/reviews/registry.json'
    ),

  supplierQuotes:
    path.join(
      ROOT,
      'data/product-engine/quotes/registry.json'
    ),

  lots:
    path.join(
      ROOT,
      'data/product-engine/lots/registry.json'
    )
};

function read(file) {
  return JSON.parse(
    fs.readFileSync(file,'utf8')
  );
}

function write(file,data) {
  const tmp =
    `${file}.tmp-${process.pid}`;

  fs.writeFileSync(
    tmp,
    JSON.stringify(data,null,2) + '\n'
  );

  fs.renameSync(tmp,file);
}

function id(prefix) {
  return (
    `${prefix}-` +
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

function selected(list) {
  return (
    list.find(
      x => x.selected === true
    ) || null
  );
}

function reality() {

  const supplier =
    selected(
      read(files.suppliers)
        .suppliers
    );

  const manufacturer =
    selected(
      read(files.manufacturers)
        .manufacturers
    );

  const formula =
    selected(
      read(files.formulas)
        .specifications
    );

  const binding =
    selected(
      read(files.bindings)
        .bindings
    );

  const label =
    selected(
      read(files.labels)
        .reviews
    );

  const quote =
    selected(
      read(files.supplierQuotes)
        .quotes
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
      binding?.verified === true,

    label_release_approved:
      label?.release_approved === true,

    quote_verified:
      quote?.verified === true,

    economics_acceptable:
      quote?.economics_acceptable === true
  };

  const ready =
    Object.values(gates)
      .every(Boolean);

  return {
    gates,
    supplier,
    manufacturer,
    formula,
    binding,
    label,
    quote,

    procurement_ready:
      ready,

    procurement_state:
      ready
        ? 'PROCUREMENT_READY'
        : 'BLOCKED',

    email_send_enabled:
      false,

    purchase_authorized:
      false,

    po_submission_enabled:
      false,

    payment_enabled:
      false,

    sales_enabled:
      false
  };
}

router.get('/health',(req,res)=>{
  try {
    const r = reality();

    res.json({
      ok:true,
      module:
        'CIWU_SUPPLIER_OPERATIONS_COMMAND_CENTER',

      procurement_state:
        r.procurement_state,

      email_send_enabled:false,
      po_submission_enabled:false,
      payment_enabled:false,
      sales_enabled:false,

      timestamp:
        new Date().toISOString()
    });

  } catch {
    res.status(500).json({
      ok:false,
      error:'M6_ENGINE_UNAVAILABLE'
    });
  }
});

router.get('/reality',(req,res)=>{
  res.json(reality());
});

router.post('/contacts',(req,res)=>{

  const {
    supplier_id,
    name,
    role,
    email,
    phone,
    source
  } = req.body || {};

  if (
    typeof name !== 'string' ||
    !name.trim()
  ) {
    return res.status(400).json({
      error:'CONTACT_NAME_REQUIRED'
    });
  }

  if (
    typeof source !== 'string' ||
    !source.trim()
  ) {
    return res.status(400).json({
      error:'CONTACT_SOURCE_REQUIRED'
    });
  }

  const db = read(files.contacts);

  const record = {
    id:id('contact'),
    supplier_id:supplier_id || null,
    name:name.trim(),
    role:role || null,
    email:email || null,
    phone:phone || null,
    source:source.trim(),
    state:'UNVERIFIED',
    verified:false,
    created_at:new Date().toISOString()
  };

  record.sha256 = hash(record);

  db.contacts.push(record);
  write(files.contacts,db);

  res.status(201).json(record);
});

router.post('/outbox/rfq-draft',(req,res)=>{

  const {
    supplier_name,
    contact_name,
    contact_email,
    target_quantity
  } = req.body || {};

  if (
    typeof supplier_name !== 'string' ||
    !supplier_name.trim()
  ) {
    return res.status(400).json({
      error:'SUPPLIER_NAME_REQUIRED'
    });
  }

  if (
    !Number.isInteger(target_quantity) ||
    target_quantity <= 0
  ) {
    return res.status(400).json({
      error:'VALID_TARGET_QUANTITY_REQUIRED'
    });
  }

  const message = {
    id:id('rfq'),

    supplier_name:
      supplier_name.trim(),

    contact_name:
      contact_name || null,

    contact_email:
      contact_email || null,

    subject:
      'Private Label RFQ — CIWU Cellular Vitality',

    body:[
      `Hello ${contact_name || supplier_name},`,
      '',
      'CIWU is evaluating qualified private-label manufacturing for CIWU Cellular Vitality.',
      '',
      `Target initial quantity: ${target_quantity} units.`,
      '',
      'Please provide:',
      '- written private-label authorization',
      '- exact product/formula specification',
      '- manufacturer identity',
      '- GMP documentation',
      '- representative or lot-specific COA',
      '- MOQ',
      '- unit pricing',
      '- setup/tooling charges',
      '- packaging options',
      '- testing costs',
      '- lead time',
      '- label support',
      '',
      'All documentation remains subject to independent verification.',
      '',
      'CIWU Product Development'
    ].join('\n'),

    state:'DRAFT_NOT_SENT',
    human_approval_required:true,
    sent:false,
    created_at:new Date().toISOString()
  };

  message.sha256 = hash(message);

  const db = read(files.outbox);

  db.messages.push(message);
  write(files.outbox,db);

  res.status(201).json(message);
});

router.post('/outbox/:id/send',(req,res)=>{
  res.status(403).json({
    error:'EXTERNAL_EMAIL_SEND_DISABLED',
    human_approval_required:true
  });
});

router.post('/documents/classify',(req,res)=>{

  const {
    filename,
    sha256,
    source
  } = req.body || {};

  if (
    typeof filename !== 'string' ||
    !filename.trim()
  ) {
    return res.status(400).json({
      error:'FILENAME_REQUIRED'
    });
  }

  if (
    typeof sha256 !== 'string' ||
    !/^[a-f0-9]{64}$/i.test(sha256)
  ) {
    return res.status(400).json({
      error:'VALID_SHA256_REQUIRED'
    });
  }

  if (
    typeof source !== 'string' ||
    !source.trim()
  ) {
    return res.status(400).json({
      error:'SOURCE_REQUIRED'
    });
  }

  const n = filename.toLowerCase();

  let type = 'OTHER';

  if (n.includes('coa'))
    type='COA';
  else if (n.includes('gmp'))
    type='GMP_DOCUMENT';
  else if (
    n.includes('formula') ||
    n.includes('spec')
  )
    type='FORMULA_SPECIFICATION';
  else if (
    n.includes('quote') ||
    n.includes('price')
  )
    type='PRICING';
  else if (n.includes('label'))
    type='LABEL_REVIEW';

  const record = {
    id:id('document'),
    filename:filename.trim(),
    sha256:sha256.toLowerCase(),
    source:source.trim(),
    derived_type:type,
    classification_state:'DERIVED',
    verification_state:'REVIEW_REQUIRED',
    verified:false,
    created_at:new Date().toISOString()
  };

  const db = read(files.documents);

  db.documents.push(record);
  write(files.documents,db);

  res.status(201).json(record);
});

router.post('/quotes/normalize',(req,res)=>{

  const names = [
    'moq',
    'unit_cost_cents',
    'packaging_cents',
    'freight_total_cents',
    'setup_total_cents',
    'testing_total_cents',
    'lead_time_days',
    'retail_price_cents'
  ];

  for (const name of names) {

    const value = req.body?.[name];

    if (
      !Number.isInteger(value) ||
      value < 0
    ) {
      return res.status(400).json({
        error:'INVALID_QUOTE_FIELD',
        field:name
      });
    }
  }

  const {
    moq,
    unit_cost_cents,
    packaging_cents,
    freight_total_cents,
    setup_total_cents,
    testing_total_cents,
    lead_time_days,
    retail_price_cents
  } = req.body;

  if (moq <= 0) {
    return res.status(400).json({
      error:'MOQ_MUST_BE_POSITIVE'
    });
  }

  const allocated =
    Math.ceil(
      (
        freight_total_cents +
        setup_total_cents +
        testing_total_cents
      ) / moq
    );

  const landed =
    unit_cost_cents +
    packaging_cents +
    allocated;

  const profit =
    retail_price_cents -
    landed;

  const margin =
    Number(
      (
        profit /
        retail_price_cents *
        100
      ).toFixed(2)
    );

  const result = {
    id:id('normalized-quote'),
    moq,
    unit_cost_cents,
    packaging_cents,
    allocated_shared_cost_cents:allocated,
    landed_unit_cost_cents:landed,
    lead_time_days,
    retail_price_cents,
    estimated_gross_profit_cents:profit,
    estimated_gross_margin_percent:margin,
    verified:false,
    state:'DERIVED',
    created_at:new Date().toISOString()
  };

  const db = read(files.quotes);

  db.quotes.push(result);
  write(files.quotes,db);

  res.json(result);
});

router.post('/scorecards/evaluate',(req,res)=>{

  const r = reality();

  const passed =
    Object.values(r.gates)
      .filter(Boolean)
      .length;

  const total =
    Object.keys(r.gates)
      .length;

  const card = {
    id:id('scorecard'),
    hard_gates:r.gates,
    score:
      Math.round(
        passed / total * 100
      ),
    all_hard_gates_pass:
      Object.values(r.gates)
        .every(Boolean),
    procurement_ready:
      r.procurement_ready,
    purchase_authorized:false,
    sales_enabled:false,
    state:
      r.procurement_ready
        ? 'QUALIFIED'
        : 'BLOCKED',
    created_at:new Date().toISOString()
  };

  const db = read(files.scorecards);

  db.scorecards.push(card);
  write(files.scorecards,db);

  res.json(card);
});

router.post('/crosscheck/formula-label',(req,res)=>{

  const a =
    req.body?.formula_ingredients;

  const b =
    req.body?.label_ingredients;

  if (
    !Array.isArray(a) ||
    !Array.isArray(b)
  ) {
    return res.status(400).json({
      error:'FORMULA_AND_LABEL_ARRAYS_REQUIRED'
    });
  }

  const canon = list =>
    list.map(x=>({
      name:String(x.name || '')
        .trim()
        .toLowerCase(),
      amount:x.amount ?? null,
      unit:x.unit ?? null
    }));

  const formula = canon(a);
  const label = canon(b);

  const names =
    new Set([
      ...formula.map(x=>x.name),
      ...label.map(x=>x.name)
    ]);

  const differences = [];

  for (const name of names) {

    const f =
      formula.find(
        x=>x.name===name
      );

    const l =
      label.find(
        x=>x.name===name
      );

    if (!f || !l) {

      differences.push({
        ingredient:name,
        issue:
          !f
            ? 'LABEL_ONLY'
            : 'FORMULA_ONLY'
      });

      continue;
    }

    if (
      f.amount !== l.amount ||
      f.unit !== l.unit
    ) {

      differences.push({
        ingredient:name,
        issue:'AMOUNT_OR_UNIT_MISMATCH',
        formula:f,
        label:l
      });
    }
  }

  const result = {
    id:id('crosscheck'),
    pass:
      differences.length===0,
    differences,
    state:
      differences.length===0
        ? 'DERIVED_MATCH'
        : 'DERIVED_MISMATCH',
    regulatory_approval:false,
    commercial_release:false,
    created_at:new Date().toISOString()
  };

  const db = read(files.crosschecks);

  db.crosschecks.push(result);
  write(files.crosschecks,db);

  res.json(result);
});

router.post('/traceability/build',(req,res)=>{

  const {
    lot_id,
    coa_binding_id
  } = req.body || {};

  const lot =
    read(files.lots)
      .lots
      .find(
        x=>x.id===lot_id
      );

  const binding =
    read(files.bindings)
      .bindings
      .find(
        x=>x.id===coa_binding_id
      );

  if (!lot) {
    return res.status(404).json({
      error:'LOT_NOT_FOUND'
    });
  }

  if (!binding) {
    return res.status(404).json({
      error:'COA_BINDING_NOT_FOUND'
    });
  }

  if (
    binding.verified !== true ||
    binding.lot_id !== lot.id
  ) {
    return res.status(409).json({
      error:'VERIFIED_MATCHING_COA_BINDING_REQUIRED'
    });
  }

  const record = {
    id:id('trace'),
    lot_id:lot.id,
    lot_number:lot.lot_number,
    coa_binding_id:binding.id,
    coa_evidence_id:binding.coa_evidence_id,
    verified_binding:true,
    state:'TRACEABLE',
    created_at:new Date().toISOString()
  };

  record.sha256=hash(record);

  const db=read(files.traceability);

  db.records.push(record);
  write(files.traceability,db);

  res.json(record);
});

router.post('/decision-packets/generate',(req,res)=>{

  const r=reality();

  const packet={
    id:id('decision'),
    product:'CIWU Cellular Vitality',
    procurement_state:r.procurement_state,
    procurement_ready:r.procurement_ready,
    purchase_authorized:false,
    gates:r.gates,
    supplier:r.supplier,
    manufacturer:r.manufacturer,
    formula:r.formula,
    coa_binding:r.binding,
    label:r.label,
    quote:r.quote,
    warnings:[],
    created_at:new Date().toISOString()
  };

  if (!r.procurement_ready)
    packet.warnings.push(
      'PROCUREMENT_GATES_INCOMPLETE'
    );

  packet.warnings.push(
    'PURCHASE_AUTHORIZATION_NOT_GRANTED'
  );

  packet.warnings.push(
    'SALES_REMAIN_DISABLED'
  );

  packet.sha256=hash(packet);

  const db=read(files.decisions);

  db.packets.push(packet);
  write(files.decisions,db);

  res.json(packet);
});

router.post('/purchase-orders/draft',(req,res)=>{

  const r=reality();

  if (!r.procurement_ready) {

    return res.status(409).json({
      error:'PROCUREMENT_NOT_READY'
    });
  }

  return res.status(403).json({
    error:
      'PO_DRAFT_REQUIRES_SEPARATE_APPROVAL_WORKFLOW',
    purchase_authorized:false
  });
});

router.post('/purchase-orders/:id/submit',(req,res)=>{

  res.status(403).json({
    error:
      'PURCHASE_ORDER_SUBMISSION_DISABLED',
    human_approval_required:true
  });
});

module.exports=router;
