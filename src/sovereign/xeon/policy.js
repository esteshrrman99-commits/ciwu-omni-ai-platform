'use strict';

const POLICY =
  Object.freeze({
    arbitraryShell: false,
    productionFilesystem: false,
    productionGitMutation: false,
    networkByDefault: false,
    environmentSecretInheritance: false,

    allowedNodeSyntaxCheck: true,
    allowedNodeTest: true,
    allowedNodeRun: true,

    temporaryWorkspaceOnly: true,
    cleanupRequired: true,

    maxRepairAttempts: 3
  });

module.exports = {
  POLICY
};
