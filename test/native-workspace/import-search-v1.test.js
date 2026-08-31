'use strict';

const test = require('node:test');
const assert =
  require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const {
  createRuntime
} = require(
  '../../src/native-workspace/runtime-factory-v1'
);

test(
  'activated imported history is bounded searchable with provenance and inert authority',
  () => {
    const root =
      fs.mkdtempSync(
        path.join(
          os.tmpdir(),
          'ciwu-import-search-'
        )
      );

    try {
      const projectRoot =
        path.join(root,'project');

      const stateRoot =
        path.join(root,'state');

      fs.mkdirSync(projectRoot);

      const runtime =
        createRuntime({
          projectRoot,
          stateRoot,
          projectId:'ciwu',
          providers:[]
        });

      const staged =
        runtime.importMigrationService.stage(
          {
            id:'memory-one',
            title:'Trading Architecture',
            messages:[
              {
                id:'m1',
                role:'user',
                content:
                  'The architecture uses durable recovery and provenance.'
              },
              {
                id:'m2',
                role:'assistant',
                content:
                  'Durable recovery prevents unsafe replay.'
              }
            ]
          },
          {
            source_name:'history.json'
          }
        );

      runtime.importActivationService.activate(
        staged.source_sha256
      );

      const result =
        runtime.importActivationService.search(
          'durable recovery',
          10
        );

      assert.equal(result.ok,true);
      assert.equal(
        result.authority,
        'READ_IMPORT_ONLY'
      );

      assert.ok(
        result.results.length >= 1
      );

      assert.equal(
        result.results[0]
          .source_sha256,
        staged.source_sha256
      );

      assert.equal(
        result.results[0]
          .tool_execution_allowed,
        false
      );

      assert.equal(
        result.results[0]
          .mutation_authority,
        false
      );

      assert.ok(
        result.results.length <= 10
      );

      console.log(
        'CIWU_IMPORT_SEARCH_PROVENANCE_PASS'
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
