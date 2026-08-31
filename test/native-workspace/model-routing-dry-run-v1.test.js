'use strict';

const test =
  require('node:test');
const assert =
  require('node:assert/strict');
const fs =
  require('node:fs');
const os =
  require('node:os');
const path =
  require('node:path');

const {
  createRuntime
} = require(
  '../../src/native-workspace/runtime-factory-v1'
);

test(
  'model routing is deterministic dry run only with zero network authority',
  () => {
    const root =
      fs.mkdtempSync(
        path.join(
          os.tmpdir(),
          'ciwu-model-dry-run-'
        )
      );

    try {
      const projectRoot =
        path.join(
          root,
          'project'
        );

      const stateRoot =
        path.join(
          root,
          'state'
        );

      fs.mkdirSync(projectRoot);

      const runtime =
        createRuntime({
          projectRoot,
          stateRoot,
          projectId:'ciwu',
          providers:[]
        });

      const result =
        runtime.modelDryRunService.run({
          current_instruction:
            'Explain current CIWU architecture.',
          query:
            'CIWU architecture',
          metadata:{
            api_key:
              'must-not-survive',
            interface:
              'test'
          }
        });

      assert.equal(
        result.ok,
        true
      );

      assert.equal(
        result.dry_run,
        true
      );

      assert.equal(
        result.model_network_call,
        false
      );

      assert.equal(
        result.route.provider,
        'CIWU_DRY_RUN'
      );

      assert.equal(
        result.route.model,
        'ciwu-dry-run-v1'
      );

      assert.equal(
        result.request.metadata
          .api_key,
        '[REDACTED]'
      );

      assert.equal(
        result.response.provenance
          .external_provider_called,
        false
      );

      assert.equal(
        result.response.authority
          .tool_execution_allowed,
        false
      );

      assert.equal(
        runtime.approvalStore
          .all()
          .tickets
          .length,
        0
      );

      console.log(
        'CIWU_MODEL_ROUTING_DRY_RUN_PASS'
      );
    } finally {
      fs.rmSync(
        root,
        {
          recursive:true,
          force:true
        }
      );
    }
  }
);
