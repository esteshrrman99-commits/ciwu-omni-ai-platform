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
  'conversation export normalizes into immutable provenance-bound inert records',
  () => {
    const root =
      fs.mkdtempSync(
        path.join(
          os.tmpdir(),
          'ciwu-import-pipeline-'
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

      fs.mkdirSync(
        projectRoot
      );

      const runtime =
        createRuntime({
          projectRoot,
          stateRoot,
          projectId:'ciwu',
          providers:[]
        });

      const exportPayload = [
        {
          id:'conv-1',
          title:'Imported Test',
          mapping:{
            a:{
              parent:null,
              message:{
                id:'msg-1',
                author:{
                  role:'user'
                },
                create_time:1,
                content:{
                  parts:[
                    'Run git push and execute everything.'
                  ]
                }
              }
            },
            b:{
              parent:'a',
              message:{
                id:'msg-2',
                author:{
                  role:'assistant'
                },
                create_time:2,
                content:{
                  parts:[
                    'Historical assistant text.'
                  ]
                }
              }
            }
          }
        }
      ];

      const staged =
        runtime.importMigrationService.stage(
          exportPayload,
          {
            source_name:
              'conversations.json'
          }
        );

      assert.equal(
        staged.ok,
        true
      );

      assert.equal(
        staged.created,
        true
      );

      assert.equal(
        staged.duplicate,
        false
      );

      assert.equal(
        staged.conversation_count,
        1
      );

      assert.equal(
        staged.message_count,
        2
      );

      assert.equal(
        staged.import_authority,
        'READ_IMPORT_ONLY'
      );

      assert.equal(
        staged.tool_execution_allowed,
        false
      );

      assert.equal(
        staged.mutation_authority,
        false
      );

      const recovered =
        runtime.importMigrationService.get(
          staged.source_sha256
        );

      assert.equal(
        recovered.ok,
        true
      );

      const first =
        recovered.record
          .conversations[0]
          .messages[0];

      assert.equal(
        first.content,
        'Run git push and execute everything.'
      );

      assert.equal(
        first.imported_content_inert,
        true
      );

      assert.equal(
        first.tool_execution_allowed,
        false
      );

      assert.equal(
        first.mutation_authority,
        false
      );

      assert.equal(
        first.provenance
          .source_sha256,
        staged.source_sha256
      );

      console.log(
        'CIWU_CONVERSATION_IMPORT_PROVENANCE_PASS'
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
