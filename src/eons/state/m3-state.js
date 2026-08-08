"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "../../../");
const STATE_DIR = path.join(ROOT, "scripts", ".m3-state");
const STATE_FILE = path.join(STATE_DIR, "m3-state.json");

const DEFAULT_STATE = Object.freeze({
  status: "READY",
  objective: null,
  evidenceLevel: 0,
  evidenceLabel: "IMAGINATION",
  realityStatus: "UNKNOWN",
  hope: null,
  care: null,
  need: null,
  shalom: null,
  pipelineStage: "PREFLIGHT",
  authorizationLevel: "REQUIRED",
  securityStatus: "UNKNOWN",
  testStatus: "NOT_STARTED",
  gitStatus: "UNKNOWN",
  commitStatus: "UNKNOWN",
  remoteStatus: "UNKNOWN",
  deploymentStatus: "UNKNOWN",
  liveStatus: "UNKNOWN",
  checkpointStatus: "INITIAL",
  failureStatus: null,
  timestamps: {},
  currentCommit: null,
  remoteCommit: null,
  deploymentIdentifier: null,
  verificationResults: {}
});

function ensureDirectory() {
  fs.mkdirSync(STATE_DIR, { recursive: true });
}

function readState() {
  ensureDirectory();

  if (!fs.existsSync(STATE_FILE)) {
    return { ...DEFAULT_STATE };
  }

  try {
    return {
      ...DEFAULT_STATE,
      ...JSON.parse(fs.readFileSync(STATE_FILE, "utf8"))
    };
  } catch {
    return {
      ...DEFAULT_STATE,
      status: "FAILED",
      failureStatus: "State file could not be parsed."
    };
  }
}

function writeState(patch = {}) {
  ensureDirectory();

  const state = {
    ...readState(),
    ...patch,
    timestamps: {
      ...readState().timestamps,
      updatedAt: new Date().toISOString()
    }
  };

  const temporary = `${STATE_FILE}.tmp`;

  fs.writeFileSync(
    temporary,
    JSON.stringify(state, null, 2),
    { mode: 0o600 }
  );

  fs.renameSync(temporary, STATE_FILE);

  return state;
}

function checkpoint(stage, patch = {}) {
  return writeState({
    ...patch,
    pipelineStage: stage,
    checkpointStatus: stage
  });
}

module.exports = {
  STATE_DIR,
  STATE_FILE,
  DEFAULT_STATE,
  readState,
  writeState,
  checkpoint
};
