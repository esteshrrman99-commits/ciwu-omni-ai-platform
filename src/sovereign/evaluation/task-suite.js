'use strict';

const SUITE = Object.freeze([
  {
    id: 'syntax-repair',
    category: 'DEBUG',
    expected: 'TEST_PASS'
  },
  {
    id: 'small-refactor',
    category: 'REFACTOR',
    expected: 'SEMANTIC_EQUIVALENCE'
  },
  {
    id: 'unit-test-generation',
    category: 'TEST',
    expected: 'TEST_PASS'
  },
  {
    id: 'security-review',
    category: 'SECURITY',
    expected: 'FINDINGS_WITH_EVIDENCE'
  },
  {
    id: 'architecture-plan',
    category: 'ARCHITECT',
    expected: 'CONSTRAINT_SATISFACTION'
  },
  {
    id: 'repository-question',
    category: 'RETRIEVAL',
    expected: 'SOURCE_GROUNDED'
  }
]);

module.exports = {
  SUITE
};
