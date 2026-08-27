'use strict';

const RULES = [
  {
    match: ['insulin', 'sulfonylurea'],
    concern: 'HYPOGLYCEMIA_RISK',
    severity: 'HIGHER_ATTENTION',
    explanation:
      'Both can lower glucose, so clinicians usually pay closer attention to low-blood-sugar risk.'
  },
  {
    match: ['nsaid', 'ace inhibitor'],
    concern: 'KIDNEY_FUNCTION_MONITORING',
    severity: 'MODERATE_ATTENTION',
    explanation:
      'This combination can affect kidney function in some people, especially with dehydration or other risk factors.'
  }
];

function assess(medications = []) {
  const meds =
    medications
      .map(value =>
        String(value || '')
          .toLowerCase()
          .trim()
      )
      .filter(Boolean);

  const findings =
    RULES.filter(rule =>
      rule.match.every(term =>
        meds.some(medication =>
          medication.includes(term)
        )
      )
    );

  return {
    medications: meds,
    findings,
    checkedAgainst:
      'limited built-in educational ruleset',
    boundary:
      'Not a complete interaction database; confirm with a pharmacist or clinician.'
  };
}

module.exports = {
  assess
};
