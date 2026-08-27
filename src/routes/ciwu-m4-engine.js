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
  documents:
    path.join(
      ROOT,
      'data',
      'product-engine',
      'documents',
      'registry.json'
    ),

  formulas:
    path.join(
      ROOT,
      'data',
      'product-engine',
      'formula-versions',
      'registry.json'
    ),

  currentFormula:
    path.join(
      ROOT,
      'data',
      'product-engine',
      'formula.json'
    ),

  coaSpec:
    path.join(
      ROOT,
      'data',
      'product-engine',
      'coa',
      'specifications',
      'product-spec.json'
    ),

  label:
    path.join(
      ROOT,
      'data',
      'product-engine',
      'labels',
      'label.json'
    ),

  economics:
    path.join(
      ROOT,
      'data',
      'product-engine',
      'economics',
      'scenarios.json'
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

function write(file, value) {
  const temp =
    `${file}.tmp-${process.pid}`;

  fs.writeFileSync(
    temp,
    JSON.stringify(
      value,
      null,
      2
    ) + '\n'
  );

  fs.renameSync(
    temp,
    file
  );
}

function hash(value) {
  return crypto
    .createHash('sha256')
    .update(
      typeof value === 'string'
        ? value
        : JSON.stringify(value)
    )
    .digest('hex');
}

function id(prefix) {
  return (
    prefix +
    '-' +
    crypto.randomBytes(8)
      .toString('hex')
  );
}

function normalizeIngredients(list) {
  if (!Array.isArray(list)) {
    return [];
  }

  return list.map(item => ({
    name:
      String(
        item.name || ''
      ).trim(),

    amount:
      item.amount ?? null,

    unit:
      item.unit ?? null,

    form:
      item.form ?? null
  }));
}

function formulaDiff(before, after) {
  const a =
    new Map(
      normalizeIngredients(
        before.ingredients
      )
      .map(
        x => [x.name, x]
      )
    );

  const b =
    new Map(
      normalizeIngredients(
        after.ingredients
      )
      .map(
        x => [x.name, x]
      )
    );

  const names =
    new Set([
      ...a.keys(),
      ...b.keys()
    ]);

  const changes = [];

  for (const name of names) {
    const oldItem =
      a.get(name);

    const newItem =
      b.get(name);

    if (!oldItem) {
      changes.push({
        ingredient: name,
        change: 'ADDED',
        after: newItem
      });

      continue;
    }

    if (!newItem) {
      changes.push({
        ingredient: name,
        change: 'REMOVED',
        before: oldItem
      });

      continue;
    }

    if (
      JSON.stringify(oldItem)
      !==
      JSON.stringify(newItem)
    ) {
      changes.push({
        ingredient: name,
        change: 'MODIFIED',
        before: oldItem,
        after: newItem
      });
    }
  }

  return changes;
}

router.get(
  '/health',
  (req, res) => {
    try {
      const documents =
        read(FILES.documents);

      const formulas =
        read(FILES.formulas);

      const economics =
        read(FILES.economics);

      res.json({
        ok: true,
        module:
          'CIWU_SUPPLIER_QUALITY_CONTROL_ENGINE',

        documents:
          documents.documents.length,

        formula_versions:
          formulas.versions.length,

        economics_scenarios:
          economics.scenarios.length,

        timestamp:
          new Date().toISOString()
      });

    } catch {
      res.status(500).json({
        ok: false,
        error:
          'M4_ENGINE_UNAVAILABLE'
      });
    }
  }
);

router.get(
  '/documents',
  (req, res) => {
    res.json(
      read(FILES.documents)
    );
  }
);

router.post(
  '/documents',
  (req, res) => {
    const {
      type,
      title,
      source,
      content_sha256,
      notes
    } = req.body || {};

    if (
      typeof type !== 'string' ||
      !type.trim()
    ) {
      return res.status(400).json({
        error:
          'DOCUMENT_TYPE_REQUIRED'
      });
    }

    if (
      typeof title !== 'string' ||
      !title.trim()
    ) {
      return res.status(400).json({
        error:
          'DOCUMENT_TITLE_REQUIRED'
      });
    }

    if (
      typeof source !== 'string' ||
      !source.trim()
    ) {
      return res.status(400).json({
        error:
          'DOCUMENT_SOURCE_REQUIRED'
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

    const registry =
      read(FILES.documents);

    const record = {
      id:
        id('document'),

      type:
        type.trim(),

      title:
        title.trim(),

      source:
        source.trim(),

      content_sha256:
        content_sha256.toLowerCase(),

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
        null
    };

    registry.documents.push(
      record
    );

    write(
      FILES.documents,
      registry
    );

    res
      .status(201)
      .json(record);
  }
);

router.post(
  '/documents/:id/verify',
  (req, res) => {
    const {
      reviewer,
      finding
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
      typeof finding !== 'string' ||
      !finding.trim()
    ) {
      return res.status(400).json({
        error:
          'REVIEW_FINDING_REQUIRED'
      });
    }

    const registry =
      read(FILES.documents);

    const document =
      registry.documents.find(
        item =>
          item.id ===
          req.params.id
      );

    if (!document) {
      return res.status(404).json({
        error:
          'DOCUMENT_NOT_FOUND'
      });
    }

    document.verified = true;
    document.state = 'VERIFIED';
    document.reviewer =
      reviewer.trim();

    document.finding =
      finding.trim();

    document.verified_at =
      new Date().toISOString();

    document.verification_sha256 =
      hash({
        id: document.id,
        reviewer:
          document.reviewer,
        finding:
          document.finding,
        verified_at:
          document.verified_at
      });

    write(
      FILES.documents,
      registry
    );

    res.json(document);
  }
);

router.get(
  '/formula/versions',
  (req, res) => {
    res.json(
      read(FILES.formulas)
    );
  }
);

router.post(
  '/formula/versions',
  (req, res) => {
    const {
      version,
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
          'INGREDIENTS_ARRAY_REQUIRED'
      });
    }

    const registry =
      read(FILES.formulas);

    const current =
      read(FILES.currentFormula);

    const formula = {
      id:
        id('formula-version'),

      version:
        version.trim(),

      ingredients:
        normalizeIngredients(
          ingredients
        ),

      source_evidence_id:
        source_evidence_id || null,

      state:
        'UNVERIFIED',

      created_at:
        new Date().toISOString()
    };

    formula.formula_sha256 =
      hash(formula.ingredients);

    formula.diff_from_current =
      formulaDiff(
        current,
        formula
      );

    registry.versions.push(
      formula
    );

    write(
      FILES.formulas,
      registry
    );

    res
      .status(201)
      .json(formula);
  }
);

router.post(
  '/formula/diff',
  (req, res) => {
    const {
      before,
      after
    } = req.body || {};

    if (!before || !after) {
      return res.status(400).json({
        error:
          'BEFORE_AND_AFTER_REQUIRED'
      });
    }

    res.json({
      changes:
        formulaDiff(
          before,
          after
        )
    });
  }
);

router.post(
  '/coa/evaluate',
  (req, res) => {
    const {
      specifications,
      results
    } = req.body || {};

    if (
      !Array.isArray(specifications) ||
      !Array.isArray(results)
    ) {
      return res.status(400).json({
        error:
          'SPECIFICATIONS_AND_RESULTS_REQUIRED'
      });
    }

    const resultMap =
      new Map(
        results.map(
          item => [
            item.name,
            item
          ]
        )
      );

    const checks =
      specifications.map(spec => {
        const actual =
          resultMap.get(
            spec.name
          );

        if (!actual) {
          return {
            name:
              spec.name,

            state:
              'MISSING_RESULT',

            pass:
              false
          };
        }

        const value =
          Number(
            actual.value
          );

        let pass = true;

        if (
          spec.min !== null &&
          spec.min !== undefined
        ) {
          pass =
            pass &&
            value >= Number(spec.min);
        }

        if (
          spec.max !== null &&
          spec.max !== undefined
        ) {
          pass =
            pass &&
            value <= Number(spec.max);
        }

        return {
          name:
            spec.name,

          unit:
            spec.unit || null,

          value,

          min:
            spec.min ?? null,

          max:
            spec.max ?? null,

          pass,

          state:
            pass
              ? 'WITHIN_SPEC'
              : 'OUT_OF_SPEC'
        };
      });

    res.json({
      checks,

      pass:
        checks.length > 0 &&
        checks.every(
          item => item.pass
        ),

      state:
        checks.length > 0 &&
        checks.every(
          item => item.pass
        )
          ? 'DERIVED_PASS'
          : 'DERIVED_FAIL',

      warning:
        'Derived comparison only. Laboratory identity, methods, lot linkage and reviewer approval remain separate verification gates.'
    });
  }
);

router.post(
  '/label/compile',
  (req, res) => {
    const {
      serving_size,
      servings_per_container,
      ingredients,
      other_ingredients
    } = req.body || {};

    if (
      !serving_size ||
      !servings_per_container ||
      !Array.isArray(ingredients)
    ) {
      return res.status(400).json({
        error:
          'LABEL_INPUT_INCOMPLETE'
      });
    }

    const compiled = {
      state:
        'DRAFT_NOT_APPROVED',

      supplement_facts: {
        serving_size,
        servings_per_container,
        ingredients:
          normalizeIngredients(
            ingredients
          )
      },

      other_ingredients:
        Array.isArray(
          other_ingredients
        )
          ? other_ingredients
          : [],

      claims: [],

      approval: {
        regulatory_review_complete:
          false,

        formula_matches_label:
          false,

        artwork_approved:
          false,

        commercial_release:
          false
      },

      compiled_at:
        new Date().toISOString(),

      notice:
        'Draft compiler output only. Regulatory and formulation review are still required.'
    };

    compiled.sha256 =
      hash(compiled);

    res.json(compiled);
  }
);

router.post(
  '/economics/scenario',
  (req, res) => {
    const {
      name,
      moq,
      unit_manufacturing_cents,
      packaging_cents,
      testing_total_cents,
      freight_total_cents,
      setup_total_cents,
      retail_price_cents
    } = req.body || {};

    const integers = {
      moq,
      unit_manufacturing_cents,
      packaging_cents,
      testing_total_cents,
      freight_total_cents,
      setup_total_cents,
      retail_price_cents
    };

    for (
      const [field, value]
      of Object.entries(integers)
    ) {
      if (
        !Number.isInteger(value) ||
        value < 0
      ) {
        return res.status(400).json({
          error:
            'INVALID_SCENARIO_INPUT',
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

    const allocated =
      Math.ceil(
        (
          testing_total_cents +
          freight_total_cents +
          setup_total_cents
        ) / moq
      );

    const landed =
      unit_manufacturing_cents +
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

    const scenario = {
      id:
        id('scenario'),

      name:
        typeof name === 'string'
          ? name.trim()
          : 'Unnamed scenario',

      moq,

      unit_manufacturing_cents,

      packaging_cents,

      allocated_shared_cost_cents:
        allocated,

      estimated_landed_unit_cost_cents:
        landed,

      retail_price_cents,

      estimated_gross_profit_cents:
        gross,

      estimated_gross_margin_percent:
        margin,

      estimated_initial_cash_requirement_cents:
        (
          unit_manufacturing_cents +
          packaging_cents
        ) * moq
        +
        testing_total_cents
        +
        freight_total_cents
        +
        setup_total_cents,

      state:
        'DERIVED',

      created_at:
        new Date().toISOString(),

      notice:
        'Scenario only. Commercial inputs remain unverified until supported by supplier documentation.'
    };

    const registry =
      read(FILES.economics);

    registry.scenarios.push(
      scenario
    );

    write(
      FILES.economics,
      registry
    );

    res
      .status(201)
      .json(scenario);
  }
);

module.exports = router;
