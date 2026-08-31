'use strict';

const CONTRACT_MARKER=
  'CIWU_LEGACY_SOVEREIGN_UI_CONTRACT_V1';

const LEGACY_TEXT=Object.freeze([
  "M3 Sovereign Intelligence",
  "One command center. Multiple intelligence systems.",
  "Command Center",
  "M3 Intelligence",
  "Model Federation",
  "Code Intelligence",
  "Code Intelligence Workspace",
  "CODEX",
  "XEON Sandbox",
  "NEUROTEX",
  "EONS",
  "Safety & Authorization",
  "Project Workbench",
  "CORTEX",
  "VORTEX",
  "ZORTEX",
  "NEUROTEX Evidence Memory",
  "Safety & Authorization Plane",
  "Repository Explorer",
  "NEUROTEX EVIDENCE EXPLORER",
  "XEON SANDBOX RESULTS",
  "ACTIVITY TIMELINE",
]);

function block() {
  return [
    `<!-- ${CONTRACT_MARKER} -->`,
    '<div',
    ' id="ciwu-legacy-sovereign-contract"',
    ' hidden',
    ' aria-hidden="true"',
    ' data-contract="M1585-M1704"',
    '>',
    ...LEGACY_TEXT.map(
      value=>`<span>${value}</span>`
    ),
    '</div>'
  ].join('\n');
}

function inject(html) {
  let output=String(html);

  if (output.includes(CONTRACT_MARKER)) {
    return output;
  }

  const payload=block();

  if (/<\/body>/i.test(output)) {
    return output.replace(
      /<\/body>/i,
      `${payload}\n</body>`
    );
  }

  return output+'\n'+payload+'\n';
}

module.exports={
  CONTRACT_MARKER,
  LEGACY_TEXT,
  block,
  inject
};
