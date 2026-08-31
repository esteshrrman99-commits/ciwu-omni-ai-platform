'use strict';
const {
  brandStyles,
  topbar,
  hero,
  capabilityGrid
} = require('./ciwu-brand-system-v1');


function html() {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta
  name="viewport"
  content="width=device-width,initial-scale=1"
>
<title>CIWU Native Workspace</title>
<style>
${brandStyles()}

body{
  font-family:system-ui,sans-serif;
  max-width:1200px;
  margin:0 auto;
  padding:20px;
}
main{
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:16px;
}
section{
  border:1px solid #888;
  border-radius:10px;
  padding:14px;
}
textarea,input,select{
  box-sizing:border-box;
  width:100%;
  margin:6px 0;
  padding:8px;
}
button{
  padding:8px 12px;
  margin:4px;
}
pre{
  white-space:pre-wrap;
  overflow:auto;
  max-height:400px;
}
.status{
  font-weight:700;
}
.warning{
  font-weight:700;
}
</style>
</head>
<body>
${topbar()}
${hero()}
${capabilityGrid()}

<h1>CIWU Native Chat × Code × Memory</h1>

<p class="status">
Loopback workspace • Approval-bound one-time mutation
</p>

<p class="warning">
COMMIT / PUSH / DEPLOY remain disabled.
</p>

<main>

<section>
<h2>Chat</h2>
<input id="conversation" value="default">
<input id="provider" value="MOCK">
<textarea
  id="message"
  rows="6"
  placeholder="Message CIWU..."
></textarea>
<button onclick="sendChat()">Send</button>
<pre id="chatOut"></pre>
</section>

<section>
<h2>Workspace</h2>
<input id="path" value="package.json">
<button onclick="readFile()">Read</button>
<button onclick="listFiles()">List</button>
<pre id="fileOut"></pre>
</section>

<section>
<h2>WRITE Transaction</h2>
<input id="editPath" value="package.json">

<textarea
  id="editContent"
  rows="8"
  placeholder="Proposed complete replacement content"
></textarea>

<button onclick="previewEdit()">
1. Preview
</button>

<button onclick="requestWriteApproval()">
2. Request Approval
</button>

<button onclick="approveWrite()">
3. APPROVE
</button>

<button onclick="executeWrite()">
4. Execute Once
</button>

<pre id="editOut"></pre>
</section>

<section>
<h2>Bounded TEST/RUN</h2>

<select id="execAction">
<option>TEST</option>
<option>RUN</option>
</select>

<select id="execPolicy">
<option>node-check</option>
<option>node-test</option>
<option>npm-test</option>
</select>

<input
  id="execArgs"
  placeholder="Arguments separated by spaces"
>

<button onclick="requestExecApproval()">
1. Request Approval
</button>

<button onclick="approveExec()">
2. APPROVE
</button>

<button onclick="executeExec()">
3. Execute Once
</button>

<pre id="execOut"></pre>
</section>

<section>
<h2>Project Memory</h2>
<input
  id="memoryQuery"
  placeholder="Search project memory"
>
<button onclick="memory()">Retrieve</button>
<pre id="memoryOut"></pre>
</section>

<section>
<h2>Conversation Import</h2>

<input
  id="importSourceName"
  placeholder="Source filename"
  value="conversation-import.json"
>

<textarea
  id="importJson"
  rows="10"
  placeholder="Paste exported conversation JSON here"
></textarea>

<button onclick="stageImport()">
Stage Import — Read Only
</button>

<pre id="importOut"></pre>
</section>

<section>
<h2>Provider Dispatch Simulator</h2>

<textarea
  id="providerDispatchInstruction"
  placeholder="Local provider dispatch instruction"
></textarea>

<button onclick="runProviderDispatch()">
Run Local Dispatch
</button>

<pre id="providerDispatchOut"></pre>
</section>

<section>
<h2>Provider Policy Gate</h2>

<input
  id="providerPolicyProvider"
  value="CIWU_DRY_RUN"
  placeholder="Provider"
>

<input
  id="providerPolicyModel"
  value="ciwu-dry-run-v1"
  placeholder="Model"
>

<button onclick="inspectProviderPolicy()">
Inspect Provider Policy
</button>

<pre id="providerPolicyOut"></pre>
</section>

<section>
<h2>Model Provider Dry Run</h2>

<textarea
  id="dryRunInstruction"
  rows="5"
  placeholder="Current instruction for dry-run request"
></textarea>

<input
  id="dryRunQuery"
  placeholder="Optional retrieval query"
>

<button onclick="runModelDryRun()">
Build Provider Dry Run
</button>

<pre id="dryRunOut"></pre>
</section>

<section>
<h2>Prompt Context Assembly</h2>

<textarea
  id="currentInstruction"
  rows="5"
  placeholder="Current user instruction"
></textarea>

<input
  id="assemblyQuery"
  placeholder="Optional context retrieval query"
>

<button onclick="assemblePromptContext()">
Assemble Bounded Context
</button>

<pre id="assemblyOut"></pre>
</section>

<section>
<h2>Unified Context Retrieval</h2>

<input
  id="contextQuery"
  placeholder="Search native chat, memory, and imported history"
>

<button onclick="searchUnifiedContext()">
Search Unified Context
</button>

<pre id="contextOut"></pre>
</section>

<section>
<h2>Imported History Activation</h2>

<input
  id="activationSha"
  placeholder="Staged import SHA-256"
>

<button onclick="activateImport()">
Activate Read-Only Import
</button>

<input
  id="importSearchQuery"
  placeholder="Search activated imported history"
>

<button onclick="searchImportedHistory()">
Search Imported History
</button>

<pre id="activationOut"></pre>
</section>

<section>
<h2>Crash Recovery</h2>

<input
  id="recoveryTicket"
  placeholder="Approval ticket ID"
>

<button onclick="recoveryStatus()">
Check Recovery Status
</button>

<select id="recoveryResolution">
<option>CONFIRMED_EXECUTED</option>
<option>CONFIRMED_NOT_EXECUTED</option>
<option>ABANDONED_UNKNOWN</option>
</select>

<input
  id="recoveryNote"
  placeholder="Operator evidence / note"
>

<button onclick="resolveRecovery()">
Resolve Without Replay
</button>

<pre id="recoveryOut"></pre>
</section>

<section>
<h2>Audit Evidence</h2>
<button onclick="audit()">Refresh Audit</button>
<pre id="auditOut"></pre>
</section>

</main>

<script>
let writePreview = null;
let writeTicket = null;
let writePayload = null;

let execTicket = null;
let execPayload = null;

async function j(url, options) {
  const r = await fetch(url, options);
  return await r.json();
}

function post(url, body) {
  return j(url, {
    method:'POST',
    headers:{
      'content-type':
        'application/json'
    },
    body:JSON.stringify(body)
  });
}

async function sendChat() {
  chatOut.textContent =
    JSON.stringify(
      await post('/api/chat',{
        conversation_id:
          conversation.value,
        provider:
          provider.value,
        content:
          message.value
      }),
      null,2
    );
}

async function readFile() {
  fileOut.textContent =
    JSON.stringify(
      await j(
        '/api/workspace/read?path=' +
        encodeURIComponent(path.value)
      ),
      null,2
    );
}

async function listFiles() {
  fileOut.textContent =
    JSON.stringify(
      await j(
        '/api/workspace/list?path=' +
        encodeURIComponent(path.value)
      ),
      null,2
    );
}

async function previewEdit() {
  const x =
    await post(
      '/api/workspace/preview',
      {
        path:
          editPath.value,
        content:
          editContent.value
      }
    );

  writePreview = x.preview || null;

  editOut.textContent =
    JSON.stringify(x,null,2);
}

async function requestWriteApproval() {
  if (!writePreview) {
    editOut.textContent =
      'Preview required first.';
    return;
  }

  writePayload = {
    path:
      editPath.value,
    content:
      editContent.value,
    expected_before_sha256:
      writePreview.before_sha256
  };

  const x =
    await post(
      '/api/approvals',
      {
        action:'UPDATE',
        payload:
          writePayload
      }
    );

  writeTicket =
    x.ticket
      ? x.ticket.id
      : null;

  editOut.textContent =
    JSON.stringify(x,null,2);
}

async function approveWrite() {
  if (!writeTicket) {
    editOut.textContent =
      'Approval ticket required.';
    return;
  }

  editOut.textContent =
    JSON.stringify(
      await post(
        '/api/approvals/' +
        encodeURIComponent(writeTicket) +
        '/decision',
        {
          decision:'APPROVED'
        }
      ),
      null,2
    );
}

async function executeWrite() {
  if (
    !writeTicket ||
    !writePayload
  ) {
    editOut.textContent =
      'Approved payload required.';
    return;
  }

  editOut.textContent =
    JSON.stringify(
      await post(
        '/api/transactions/' +
        encodeURIComponent(writeTicket) +
        '/execute',
        {
          action:'UPDATE',
          payload:
            writePayload
        }
      ),
      null,2
    );

  await audit();
}

async function requestExecApproval() {
  const args =
    execArgs.value
      .split(/\\s+/)
      .filter(Boolean);

  execPayload = {
    request: {
      policy:
        execPolicy.value,
      args,
      timeout_ms:15000,
      max_output_bytes:131072
    }
  };

  const x =
    await post(
      '/api/approvals',
      {
        action:
          execAction.value,
        payload:
          execPayload
      }
    );

  execTicket =
    x.ticket
      ? x.ticket.id
      : null;

  execOut.textContent =
    JSON.stringify(x,null,2);
}

async function approveExec() {
  if (!execTicket) {
    execOut.textContent =
      'Approval ticket required.';
    return;
  }

  execOut.textContent =
    JSON.stringify(
      await post(
        '/api/approvals/' +
        encodeURIComponent(execTicket) +
        '/decision',
        {
          decision:'APPROVED'
        }
      ),
      null,2
    );
}

async function executeExec() {
  if (
    !execTicket ||
    !execPayload
  ) {
    execOut.textContent =
      'Approved execution required.';
    return;
  }

  execOut.textContent =
    JSON.stringify(
      await post(
        '/api/transactions/' +
        encodeURIComponent(execTicket) +
        '/execute',
        {
          action:
            execAction.value,
          payload:
            execPayload
        }
      ),
      null,2
    );

  await audit();
}

async function memory() {
  memoryOut.textContent =
    JSON.stringify(
      await j(
        '/api/memory?q=' +
        encodeURIComponent(
          memoryQuery.value
        )
      ),
      null,2
    );
}

async function stageImport() {
  let payload;

  try {
    payload =
      JSON.parse(
        importJson.value
      );
  } catch (_) {
    importOut.textContent =
      'Invalid JSON.';
    return;
  }

  importOut.textContent =
    JSON.stringify(
      await post(
        '/api/imports/stage',
        {
          source_name:
            importSourceName.value ||
            'conversation-import.json',
          payload
        }
      ),
      null,
      2
    );
}

async function runProviderDispatch() {
  providerDispatchOut.textContent =
    JSON.stringify(
      await post(
        '/api/provider/dispatch',
        {
          requested_provider:
            'CIWU_DRY_RUN',
          requested_model:
            'ciwu-dry-run-v1',
          current_instruction:
            providerDispatchInstruction.value,
          dispatch_budget:{
            timeout_ms:1500,
            retry_limit:1
          }
        }
      ),
      null,
      2
    );
}

async function inspectProviderPolicy() {
  providerPolicyOut.textContent =
    JSON.stringify(
      await post(
        '/api/provider/policy',
        {
          requested_provider:
            providerPolicyProvider.value,
          requested_model:
            providerPolicyModel.value,
          required_capability:
            'CHAT',
          network_requested:
            false
        }
      ),
      null,
      2
    );
}

async function runModelDryRun() {
  dryRunOut.textContent =
    JSON.stringify(
      await post(
        '/api/model/dry-run',
        {
          current_instruction:
            dryRunInstruction.value,
          query:
            dryRunQuery.value,
          metadata:{
            interface:
              'CIWU_NATIVE_UI'
          },
          budget:{
            max_total_chars:12000,
            max_item_chars:2200,
            max_results:20,
            max_per_source:8
          }
        }
      ),
      null,
      2
    );
}

async function assemblePromptContext() {
  assemblyOut.textContent =
    JSON.stringify(
      await post(
        '/api/context/assemble',
        {
          current_instruction:
            currentInstruction.value,
          query:
            assemblyQuery.value,
          limit:40,
          budget:{
            max_total_chars:12000,
            max_item_chars:2200,
            max_results:20,
            max_per_source:8
          }
        }
      ),
      null,
      2
    );
}

async function searchUnifiedContext() {
  contextOut.textContent =
    JSON.stringify(
      await post(
        '/api/context/search',
        {
          query:
            contextQuery.value,
          limit:20
        }
      ),
      null,
      2
    );
}

async function activateImport() {
  if (!activationSha.value) {
    activationOut.textContent =
      'Source SHA required.';
    return;
  }

  activationOut.textContent =
    JSON.stringify(
      await post(
        '/api/imports/' +
        encodeURIComponent(
          activationSha.value
        ) +
        '/activate',
        {}
      ),
      null,
      2
    );
}

async function searchImportedHistory() {
  activationOut.textContent =
    JSON.stringify(
      await post(
        '/api/imports/search',
        {
          query:
            importSearchQuery.value,
          limit:20
        }
      ),
      null,
      2
    );
}

async function recoveryStatus() {
  if (!recoveryTicket.value) {
    recoveryOut.textContent =
      'Ticket ID required.';
    return;
  }

  recoveryOut.textContent =
    JSON.stringify(
      await j(
        '/api/recovery/' +
        encodeURIComponent(
          recoveryTicket.value
        )
      ),
      null,2
    );
}

async function resolveRecovery() {
  if (!recoveryTicket.value) {
    recoveryOut.textContent =
      'Ticket ID required.';
    return;
  }

  recoveryOut.textContent =
    JSON.stringify(
      await post(
        '/api/recovery/' +
        encodeURIComponent(
          recoveryTicket.value
        ) +
        '/resolve',
        {
          resolution:
            recoveryResolution.value,
          note:
            recoveryNote.value
        }
      ),
      null,2
    );

  await audit();
}

async function audit() {
  auditOut.textContent =
    JSON.stringify(
      await j('/api/audit'),
      null,2
    );
}
</script>
</body>
</html>`;
}

module.exports = {
  html
};
