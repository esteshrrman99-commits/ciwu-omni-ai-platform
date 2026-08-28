'use strict';

function critique({
  candidate,
  validation,
  context,
  plan
}={}) {
  const findings=[];

  if (!candidate) {
    findings.push({
      severity:'CRITICAL',
      code:'CANDIDATE_MISSING'
    });
  }

  if (!validation) {
    findings.push({
      severity:'CRITICAL',
      code:'VALIDATION_MISSING'
    });
  } else {
    if (validation.ok!==true) {
      findings.push({
        severity:'CRITICAL',
        code:'VALIDATION_FAILED'
      });
    }

    if (validation.regression===true) {
      findings.push({
        severity:'CRITICAL',
        code:'REGRESSION_DETECTED'
      });
    }
  }

  if (!context || context.admittedCount===0) {
    findings.push({
      severity:'HIGH',
      code:'GROUNDING_INCOMPLETE'
    });
  }

  if (!plan || !plan.planHash) {
    findings.push({
      severity:'HIGH',
      code:'PLAN_PROVENANCE_MISSING'
    });
  }

  const critical=findings.filter(
    item=>item.severity==='CRITICAL'
  ).length;

  const high=findings.filter(
    item=>item.severity==='HIGH'
  ).length;

  return Object.freeze({
    schema:'CIWU_CORTEX_CRITIC_V1',
    findings,
    critical,
    high,
    acceptable:
      critical===0 && high===0,
    confidenceIsTruth:false,
    optimizationIsAuthorization:false
  });
}

module.exports={
  critique
};
