'use strict';

const crypto =
  require('node:crypto');

function slug(value) {
  return String(value)
    .toLowerCase()
    .replace(
      /[^a-z0-9]+/g,
      '-'
    )
    .replace(
      /^-+|-+$/g,
      ''
    )
    .slice(0, 50);
}

function create({
  title,
  summary,
  changedFiles,
  tests,
  evidence
}) {
  if (!title)
    throw new Error(
      'TITLE_REQUIRED'
    );

  if (
    !Array.isArray(
      changedFiles
    )
  ) {
    throw new Error(
      'CHANGED_FILES_REQUIRED'
    );
  }

  const id =
    crypto.randomUUID();

  return {
    id,

    branchSuggestion:
      `ciwu/${slug(title)}-${id.slice(0,8)}`,

    title,

    summary:
      summary || '',

    changedFiles:
      [...changedFiles],

    tests:
      [...(tests || [])],

    evidence:
      [...(evidence || [])],

    permissions: {
      branchCreate:
        false,

      commit:
        false,

      push:
        false,

      pullRequestCreate:
        false
    }
  };
}

function prBody(
  proposal
) {
  return [
    `# ${proposal.title}`,
    '',
    proposal.summary,
    '',
    '## Changed files',
    ...proposal.changedFiles
      .map(
        x => `- ${x}`
      ),
    '',
    '## Tests',
    ...proposal.tests
      .map(
        x => `- ${x}`
      ),
    '',
    '## Evidence',
    ...proposal.evidence
      .map(
        x => `- ${x}`
      ),
    '',
    'Generated as a proposal only.',
    'No GitHub write action was performed.'
  ].join('\n');
}

module.exports = {
  slug,
  create,
  prBody
};
