'use strict';

function build(report) {
  if (
    !report ||
    report.schema!==
      'CIWU_ORIGINAL_PLATFORM_FORENSIC_REPORT_V1'
  ) {
    throw new Error(
      'RECOVERY_REPORT_REQUIRED'
    );
  }

  const phases=[
    {
      order:1,
      id:'FREEZE_EVIDENCE',
      action:
        'Bind exact original candidate SHA and forensic hashes.'
    },
    {
      order:2,
      id:'RECONSTRUCT_PRODUCT_SHELL',
      action:
        'Reconstruct original product experience in isolated fusion workspace.'
    },
    {
      order:3,
      id:'PRESERVE_ADMIN_CONSOLE',
      action:
        'Move current Command Center to sovereign/admin route.'
    },
    {
      order:4,
      id:'INFUSE_INTELLIGENCE',
      action:
        'Connect M3, CORTEX, Project Brain, code intelligence, XEON, NEUROTEX and EONS beneath original experience.'
    },
    {
      order:5,
      id:'RESTORE_FEATURES_BY_EVIDENCE',
      action:
        'Restore only features supported by Git history and tests.'
    },
    {
      order:6,
      id:'RUN_DUAL_UI_REGRESSION',
      action:
        'Verify original product surface and sovereign admin surface independently.'
    },
    {
      order:7,
      id:'HUMAN_VISUAL_REVIEW',
      action:
        'Require human review before changing default public landing surface.'
    },
    {
      order:8,
      id:'CONTROLLED_PROMOTION',
      action:
        'Promote fused frontend only after evidence, tests and authorization.'
    }
  ];

  return {
    schema:
      'CIWU_ORIGINAL_PLATFORM_RECOVERY_BLUEPRINT_V1',
    originalCandidateSha:
      report.originalCandidate.sha,
    phases,
    defaultPublicTarget:
      'ORIGINAL_PLATFORM_EXPERIENCE',
    sovereignAdminTarget:
      'CURRENT_COMMAND_CENTER',
    deleteCurrentCommandCenter:false,
    overwriteCurrentFrontendNow:false,
    automaticRestore:false,
    humanVisualApprovalRequired:true
  };
}

module.exports={
  build
};
