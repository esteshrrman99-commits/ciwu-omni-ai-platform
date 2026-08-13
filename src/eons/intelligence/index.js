'use strict';

const ledger =
  require('./claim-ledger');

const timeline =
  require('./timeline');

const {
  analyzeTrend
} = require('./lab-trends');

const medicationReasoner =
  require('./medication-reasoner');

const treatmentCompare =
  require('./treatment-compare');

const truth =
  require('./truth-lattice');

function status() {
  return {
    success: true,
    name:
      'EONS Clinical Intelligence Core',
    version:
      '5.0.0',
    status:
      'ONLINE',
    milestones: {
      M43: 'TRUTH_LATTICE',
      M44: 'PATIENT_CONTEXT_GRAPH',
      M45: 'CLAIM_CONFLICT_RESOLUTION',
      M46: 'LAB_TREND_INTELLIGENCE',
      M47: 'MEDICATION_REASONING',
      M48: 'EVIDENCE_RANKED_OPTIONS',
      M49: 'LONGITUDINAL_MEMORY',
      M50: 'UNIFIED_INTELLIGENCE_CORE'
    },
    truthStates:
      truth.TRUTH_STATES,
    sourceClasses:
      truth.SOURCE_CLASSES,
    boundary:
      'Educational clinical decision support; no autonomous diagnosis or prescribing.'
  };
}

module.exports = {
  status,
  ledger,
  timeline,
  analyzeTrend,
  medicationReasoner,
  treatmentCompare,
  truth
};
