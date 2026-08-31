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
  'native conversation memory and imported history unify under bounded provenance-aware retrieval',
  () => {
    const root =
      fs.mkdtempSync(
        path.join(
          os.tmpdir(),
          'ciwu-unified-context-'
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

      fs.mkdirSync(
        path.join(
          stateRoot,
          'conversations',
          'native'
        ),
        {
          recursive:true
        }
      );

      fs.writeFileSync(
        path.join(
          stateRoot,
          'conversations',
          'native',
          'c1.json'
        ),
        JSON.stringify({
          messages:[
            {
              id:'n1',
              role:'user',
              content:
                'Durable provenance exists in native conversation history.'
            }
          ]
        }),
        'utf8'
      );

      fs.mkdirSync(
        path.join(
          stateRoot,
          'memory'
        ),
        {
          recursive:true
        }
      );

      fs.writeFileSync(
        path.join(
          stateRoot,
          'memory',
          'm1.json'
        ),
        JSON.stringify({
          memories:[
            {
              id:'mem1',
              class:'PROJECT',
              content:
                'Project memory preserves durable provenance.',
              confidence:1,
              provenance:'test'
            }
          ]
        }),
        'utf8'
      );

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
            id:'imported-one',
            title:'Imported',
            messages:[
              {
                id:'i1',
                role:'user',
                content:
                  'Imported durable provenance context.'
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
        runtime.unifiedContextRetrieval.search(
          'durable provenance',
          20
        );

      assert.equal(
        result.ok,
        true
      );

      const kinds =
        new Set(
          result.results.map(
            row =>
              row.source_kind
          )
        );

      assert.equal(
        kinds.has(
          'NATIVE_CONVERSATION'
        ),
        true
      );

      assert.equal(
        kinds.has(
          'PROJECT_MEMORY'
        ),
        true
      );

      assert.equal(
        kinds.has(
          'IMPORTED_HISTORY'
        ),
        true
      );

      for (
        const row of
        result.results
      ) {
        assert.equal(
          row.operational_authority,
          false
        );

        assert.equal(
          row.tool_execution_allowed,
          false
        );

        assert.equal(
          row.mutation_authority,
          false
        );
      }

      console.log(
        'CIWU_UNIFIED_CONTEXT_RETRIEVAL_PASS'
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
