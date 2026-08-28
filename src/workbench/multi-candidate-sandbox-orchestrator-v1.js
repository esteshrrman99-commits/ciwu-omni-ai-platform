'use strict';

const workspaceBuilder=
  require('./xeon-workspace-builder-v1');

const applier=
  require('./xeon-sandbox-patch-applier-v1');

const validator=
  require('./xeon-sandbox-validator-v1');

const comparator=
  require('./xeon-repair-comparator-v1');

const decision=
  require('./verified-repair-decision-v1');

function checksFor(files) {
  return files.map(
    file => ({
      file,
      mode:'test'
    })
  );
}

function run({
  root=process.cwd(),
  sourceFiles=[],
  tests=[],
  candidates=[]
}={}) {
  if (
    !Array.isArray(candidates) ||
    candidates.length === 0
  ) {
    throw new Error(
      'ORCHESTRATOR_CANDIDATES_REQUIRED'
    );
  }

  const selected=[
    ...new Set([
      ...sourceFiles,
      ...tests
    ])
  ];

  const results=[];

  for (
    const searchCandidate of
    candidates
  ) {
    const box=
      workspaceBuilder.build({
        root,
        files:selected
      });

    try {
      const baseline=
        validator.validate({
          workspace:
            box.workspace,
          checks:
            checksFor(tests)
        });

      let applyResult=null;
      let candidateValidation=null;
      let comparison=null;
      let verdict=null;
      let failure=null;

      try {
        applyResult=
          applier.apply({
            workspace:
              box.workspace,
            candidate:
              searchCandidate
                .candidate
          });

        candidateValidation=
          validator.validate({
            workspace:
              box.workspace,
            checks:
              checksFor(tests)
          });

        comparison=
          comparator.compare({
            baseline:
              baseline.results,
            candidate:
              candidateValidation
                .results
          });

        verdict=
          decision.decide({
            patch:
              applyResult,
            validation:
              candidateValidation,
            comparison
          });

      } catch (error) {
        failure={
          name:
            error.name ||
            'Error',
          message:
            error.message ||
            'UNKNOWN'
        };
      }

      results.push({
        ordinal:
          searchCandidate.ordinal,
        label:
          searchCandidate.label,
        searchCandidateId:
          searchCandidate
            .searchCandidateId,
        patchId:
          searchCandidate.patchId,
        baseline,
        applyResult,
        candidateValidation,
        comparison,
        verdict,
        failure
      });

    } finally {
      workspaceBuilder.destroy(
        box.workspace
      );
    }
  }

  return {
    ok:true,
    autonomousSearch:true,
    sandboxOnly:true,
    attemptCount:
      results.length,
    attempts:
      results,
    productionMutation:false,
    gitMutation:false
  };
}

module.exports={
  checksFor,
  run
};
