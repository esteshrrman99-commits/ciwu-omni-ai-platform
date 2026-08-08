#!/usr/bin/env bash
set -Eeuo pipefail

ROOT="$HOME/universal_env/apps/myai"
STATE="$ROOT/scripts/.m3-state/pump.state"
BRANCH="main"
REMOTE="origin"
LIVE_URL="${M3_LIVE_URL:-https://ciwu-omni-ai-platform.onrender.com}"

cd "$ROOT"

mkdir -p "$(dirname "$STATE")"

log() {
  printf '[M3] %s\n' "$1"
}

fail() {
  log "❌ STOPPED: $1"
  exit 1
}

checkpoint() {
  printf '%s\n' "$1" > "$STATE"
  log "CHECKPOINT: $1"
}

current_stage() {
  if [ -f "$STATE" ]; then
    cat "$STATE"
  else
    echo "START"
  fi
}

log "================================================"
log "M3 AUTOPUMP V2"
log "Crash-resistant / fail-closed"
log "================================================"

STAGE="$(current_stage)"
log "Current checkpoint: $STAGE"

# ------------------------------------------------
# STAGE 1 — PREFLIGHT
# ------------------------------------------------

if [ "$STAGE" = "START" ]; then
  log "Stage 1: preflight"

  command -v node >/dev/null || fail "Node unavailable"
  command -v git >/dev/null || fail "Git unavailable"
  command -v curl >/dev/null || fail "curl unavailable"

  git rev-parse --is-inside-work-tree >/dev/null \
    || fail "Not a Git repository"

  [ "$(git branch --show-current)" = "$BRANCH" ] \
    || fail "Not on main branch"

  git remote get-url "$REMOTE" >/dev/null 2>&1 \
    || fail "origin remote unavailable"

  checkpoint PREFLIGHT
  STAGE="PREFLIGHT"
fi

# ------------------------------------------------
# STAGE 2 — SYNTAX
# ------------------------------------------------

if [ "$STAGE" = "PREFLIGHT" ]; then
  log "Stage 2: syntax verification"

  FILES=(
    src/eons/core/m3-agent.js
    src/eons/core/model-router.js
    src/eons/security/m3-policy.js
    src/eons/governance/m3-governance.js
    src/eons/planning/m3-planner.js
    src/routes/m3-governance.js
    src/enhanced-api.js
    public/js/m3-console.js
  )

  for f in "${FILES[@]}"; do
    node --check "$f" || fail "Syntax failure: $f"
  done

  checkpoint SYNTAX
  STAGE="SYNTAX"
fi

# ------------------------------------------------
# STAGE 3 — GOVERNANCE
# ------------------------------------------------

if [ "$STAGE" = "SYNTAX" ]; then
  log "Stage 3: governance verification"

  node <<'NODE'
const g = require("./src/eons/governance/m3-governance");

if (g.GOVERNANCE_STACK.length !== 23)
  throw new Error("Governance layer count mismatch");

if (Object.keys(g.SECURITY_ENFORCEMENT).length !== 10)
  throw new Error("Security control count mismatch");

for (const key of [
  "workspaceContainment",
  "executableAllowlist",
  "commandValidation",
  "destructiveOperationBlocking",
  "timeoutEnforcement",
  "outputLimit",
  "secretProtection",
  "authorizationBoundary",
  "auditability",
  "failClosed"
]) {
  if (g.SECURITY_ENFORCEMENT[key] !== true)
    throw new Error(`Security invariant failed: ${key}`);
}

console.log("Governance PASS");
console.log("23 layers");
console.log("10 security controls");
console.log("FAIL-CLOSED PASS");
NODE

  checkpoint GOVERNANCE
  STAGE="GOVERNANCE"
fi

# ------------------------------------------------
# STAGE 4 — PLANNER
# ------------------------------------------------

if [ "$STAGE" = "GOVERNANCE" ]; then
  log "Stage 4: planner verification"

  node <<'NODE'
const Planner = require("./src/eons/planning/m3-planner");
const p = new Planner();

const plan = p.createPlan(
  "Prepare the next M3 development milestone"
);

if (plan.execution !== "disabled")
  throw new Error("Execution is not disabled");

if (plan.executionPolicy.shellAccess !== false)
  throw new Error("Shell access is enabled");

if (plan.executionPolicy.filesystemMutation !== false)
  throw new Error("Filesystem mutation is enabled");

if (plan.executionPolicy.networkAccess !== false)
  throw new Error("Network access is enabled");

if (plan.executionPolicy.secretsAccess !== false)
  throw new Error("Secrets access is enabled");

if (plan.executionPolicy.requiresAuthorization !== true)
  throw new Error("Authorization gate missing");

console.log("Planner PASS");
console.log("Execution DISABLED");
console.log("Authorization REQUIRED");
NODE

  checkpoint PLANNER
  STAGE="PLANNER"
fi

# ------------------------------------------------
# STAGE 5 — API
# ------------------------------------------------

if [ "$STAGE" = "PLANNER" ]; then
  log "Stage 5: API verification"

  grep -q 'm3GovernanceRouter' src/enhanced-api.js \
    || fail "M3 router missing"

  grep -q "/api/m3" src/enhanced-api.js \
    || fail "M3 mount missing"

  grep -q 'router.post("/plan"' src/routes/m3-governance.js \
    || fail "Plan route missing"

  checkpoint API
  STAGE="API"
fi

# ------------------------------------------------
# STAGE 6 — DIFF SAFETY
# ------------------------------------------------

if [ "$STAGE" = "API" ]; then
  log "Stage 6: Git safety"

  git diff --check || fail "Git diff check failed"

  # Never stage obvious secret material.
  while IFS= read -r f; do
    case "$f" in
      .env|.env.*|*/.env|*/.env.*|*.pem|*.key|*id_rsa*|*id_ed25519*)
        fail "Potential secret file: $f"
        ;;
    esac
  done < <(git ls-files --others --exclude-standard)

  checkpoint DIFF
  STAGE="DIFF"
fi

# ------------------------------------------------
# STAGE 7 — STAGE APPROVED FILES
# ------------------------------------------------

if [ "$STAGE" = "DIFF" ]; then
  log "Stage 7: staging approved M3 files"

  git add -- \
    public/index.html \
    public/css/eons-ui.css \
    public/js/eons-model-status.js \
    public/js/m3-console.js \
    src/config/eons-model-registry.js \
    src/enhanced-api.js \
    src/eons/index.js \
    src/eons/core/m3-agent.js \
    src/eons/core/model-router.js \
    src/eons/security/m3-policy.js \
    src/eons/governance/m3-governance.js \
    src/eons/planning/m3-planner.js \
    src/eons/agents/ \
    src/routes/eons-models.js \
    src/routes/m3-governance.js \
    src/services/eons-model-router.js \
    scripts/eons-diagnostics.js \
    scripts/m3-autopump-v2.sh

  git diff --cached --check \
    || fail "Staged diff failed safety check"

  if [ -z "$(git diff --cached --name-only)" ]; then
    fail "Nothing staged"
  fi

  checkpoint STAGED
  STAGE="STAGED"
fi

# ------------------------------------------------
# STAGE 8 — COMMIT
# ------------------------------------------------

if [ "$STAGE" = "STAGED" ]; then
  log "Stage 8: commit"

  if git diff --cached --quiet; then
    log "Nothing to commit; continuing"
  else
    git commit \
      -m "feat: add crash-resistant M3 autonomous pump" \
      || fail "Commit failed"
  fi

  checkpoint COMMITTED
  STAGE="COMMITTED"
fi

# ------------------------------------------------
# STAGE 9 — PUSH
# ------------------------------------------------

if [ "$STAGE" = "COMMITTED" ]; then
  log "Stage 9: push"

  git push "$REMOTE" "$BRANCH" \
    || fail "Push failed"

  checkpoint PUSHED
  STAGE="PUSHED"
fi

# ------------------------------------------------
# STAGE 10 — REMOTE VERIFICATION
# ------------------------------------------------

if [ "$STAGE" = "PUSHED" ]; then
  log "Stage 10: remote verification"

  git fetch "$REMOTE" "$BRANCH" --quiet \
    || fail "Remote fetch failed"

  LOCAL="$(git rev-parse HEAD)"
  REMOTE_HEAD="$(git rev-parse "$REMOTE/$BRANCH")"

  [ "$LOCAL" = "$REMOTE_HEAD" ] \
    || fail "Local/remote commit mismatch"

  checkpoint REMOTE_VERIFIED
  STAGE="REMOTE_VERIFIED"
fi

# ------------------------------------------------
# STAGE 11 — LIVE GOVERNANCE
# ------------------------------------------------

if [ "$STAGE" = "REMOTE_VERIFIED" ]; then
  log "Stage 11: live governance verification"

  RESPONSE="$(
    curl -fsS \
      --max-time 30 \
      "$LIVE_URL/api/m3/governance"
  )" || fail "Live governance endpoint failed"

  printf '%s' "$RESPONSE" > "$ROOT/scripts/.m3-state/governance.json"

  node <<'NODE'
const fs = require("fs");

const d = JSON.parse(
  fs.readFileSync("./scripts/.m3-state/governance.json", "utf8")
);

if (d.ok !== true)
  throw new Error("Governance endpoint failed");

if (d.system !== "M3")
  throw new Error("Wrong system");

if (d.execution !== "disabled")
  throw new Error("Live execution is enabled");

if (!Array.isArray(d.governance) || d.governance.length !== 23)
  throw new Error("Governance layer mismatch");

if (!d.security.failClosed)
  throw new Error("Live fail-closed invariant failed");

if (!d.security.workspaceContainment)
  throw new Error("Live workspace containment failed");

if (!d.security.executableAllowlist)
  throw new Error("Live executable allowlist failed");

console.log("LIVE GOVERNANCE PASS");
NODE

  checkpoint LIVE_GOVERNANCE
  STAGE="LIVE_GOVERNANCE"
fi

# ------------------------------------------------
# STAGE 12 — LIVE PLAN
# ------------------------------------------------

if [ "$STAGE" = "LIVE_GOVERNANCE" ]; then
  log "Stage 12: live planner verification"

  RESPONSE="$(
    curl -fsS \
      --max-time 30 \
      -X POST \
      -H "Content-Type: application/json" \
      -d '{"request":"Verify M3 autonomous development pipeline"}' \
      "$LIVE_URL/api/m3/plan"
  )" || fail "Live planner endpoint failed"

  printf '%s' "$RESPONSE" > "$ROOT/scripts/.m3-state/plan.json"

  node <<'NODE'
const fs = require("fs");

const d = JSON.parse(
  fs.readFileSync("./scripts/.m3-state/plan.json", "utf8")
);

if (d.ok !== true)
  throw new Error("Planner failed");

if (d.agent !== "M3")
  throw new Error("Wrong planner");

if (d.execution !== "disabled")
  throw new Error("Live planner execution enabled");

const p = d.executionPolicy;

if (!p ||
    p.shellAccess !== false ||
    p.filesystemMutation !== false ||
    p.networkAccess !== false ||
    p.secretsAccess !== false ||
    p.requiresAuthorization !== true) {
  throw new Error("Live planner security boundary failed");
}

console.log("LIVE PLANNER PASS");
console.log("EXECUTION DISABLED");
console.log("AUTHORIZATION REQUIRED");
NODE

  checkpoint COMPLETE
  STAGE="COMPLETE"
fi

# ------------------------------------------------
# COMPLETE
# ------------------------------------------------

if [ "$STAGE" = "COMPLETE" ]; then
  log "================================================"
  log "🚀 M3 MILESTONE 5 COMPLETE"
  log "================================================"
  log "Commit: $(git rev-parse --short HEAD)"
  log "Remote: VERIFIED"
  log "Governance: PASS"
  log "Planner: PASS"
  log "Live API: PASS"
  log "Execution: DISABLED"
  log "Authorization: REQUIRED"
  log "================================================"
fi
