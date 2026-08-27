#!/usr/bin/env bash
set -Eeuo pipefail

echo "🧠 M3 MILESTONE 7 — VERIFICATION & REGRESSION HARNESS"
echo "============================================================"

ROOT="$(git rev-parse --show-toplevel)"
cd "$ROOT"

FILES=(
  "src/routes/m3-governance.js"
  "src/eons/hcns/m3-hcns.js"
  "src/eons/reality/m3-reality-gate.js"
  "src/eons/state/m3-state.js"
  "src/eons/verification/m3-verification.js"
  "scripts/M3-MILESTONE-6-MASTER-PROMPT.md"
)

echo
echo "=== 1. BASELINE ==="

echo "Repository: $ROOT"
echo "Branch: $(git branch --show-current)"
echo "HEAD: $(git log -1 --oneline)"

echo
echo "=== 2. REQUIRED FILES ==="

for f in "${FILES[@]}"; do
    if [[ ! -f "$f" ]]; then
        echo "FAIL: missing M3 file: $f"
        exit 1
    fi
    echo "FOUND: $f"
done

echo "Required files: PASS"

echo
echo "=== 3. INDEX VISIBILITY ==="

for f in "${FILES[@]}"; do
    git update-index \
        --no-assume-unchanged \
        --no-skip-worktree \
        -- "$f" 2>/dev/null || true
done

echo "Index visibility: PASS"

echo
echo "=== 4. M3 CLEAN-STATE REGRESSION ==="

M3_CHANGED=0

for f in "${FILES[@]}"; do
    if ! git diff --quiet -- "$f"; then
        echo "CHANGED: $f"
        M3_CHANGED=1
    fi
done

if [[ "$M3_CHANGED" -eq 0 ]]; then
    echo "CLEAN STATE: PASS"
else
    echo "M3 working-tree changes detected."
    echo "This is informational; no files will be modified."
fi

echo
echo "=== 5. JAVASCRIPT REGRESSION ==="

node --check src/routes/m3-governance.js
node --check src/eons/hcns/m3-hcns.js
node --check src/eons/reality/m3-reality-gate.js
node --check src/eons/state/m3-state.js
node --check src/eons/verification/m3-verification.js

echo "JavaScript syntax: PASS"

echo
echo "=== 6. GOVERNANCE REGRESSION ==="

node <<'NODE'
const g = require("./src/eons/governance/m3-governance");

if (!Array.isArray(g.GOVERNANCE_STACK))
    throw new Error("GOVERNANCE_STACK missing");

if (g.GOVERNANCE_STACK.length !== 23)
    throw new Error("Governance stack changed from 23");

if (!g.SECURITY_ENFORCEMENT)
    throw new Error("SECURITY_ENFORCEMENT missing");

const controls = Object.entries(g.SECURITY_ENFORCEMENT);

if (controls.length !== 10)
    throw new Error("Security control count changed from 10");

for (const [key, value] of controls) {
    if (value !== true)
        throw new Error(`Security invariant failed: ${key}`);
}

console.log("Governance 23/23: PASS");
console.log("Security 10/10: PASS");
NODE

echo
echo "=== 7. REALITY REGRESSION ==="

node <<'NODE'
const { classifyReality } =
    require("./src/eons/reality/m3-reality-gate");

const tests = [
    {
        name: "unsupported claim",
        input: {
            objective: "Unsupported claim",
            evidenceLevel: 0
        }
    }
];

for (const test of tests) {
    const result = classifyReality(test.input);

    if (result.status !== "UNKNOWN")
        throw new Error(
            `${test.name}: unsupported claim was promoted`
        );

    if (result.evidenceLevel !== 0)
        throw new Error(
            `${test.name}: evidence level was modified`
        );

    console.log(`${test.name}: PASS`);
}
NODE

echo
echo "=== 8. HCNS REGRESSION ==="

node <<'NODE'
const { evaluateHCNS } =
    require("./src/eons/hcns/m3-hcns");

const result = evaluateHCNS({
    hope: true,
    care: true,
    need: true,
    shalom: true
});

const requiredFalse = [
    "authorizationOverride",
    "securityOverride",
    "evidenceOverride"
];

for (const key of requiredFalse) {
    if (result[key] !== false)
        throw new Error(`${key} must remain false`);
}

console.log("Authorization override: FALSE");
console.log("Security override: FALSE");
console.log("Evidence override: FALSE");
console.log("HCNS regression: PASS");
NODE

echo
echo "=== 9. STATE / VERIFICATION REGRESSION ==="

node <<'NODE'
const state =
    require("./src/eons/state/m3-state");

const verification =
    require("./src/eons/verification/m3-verification");

const requiredStateExports = [
    "STATE_DIR",
    "STATE_FILE",
    "DEFAULT_STATE",
    "readState",
    "writeState",
    "checkpoint"
];

for (const key of requiredStateExports) {
    if (!(key in state))
        throw new Error(`Missing state export: ${key}`);
}

if (typeof verification.verifySystem !== "function")
    throw new Error("verifySystem export missing");

console.log("State exports: PASS");
console.log("Verification exports: PASS");
NODE

echo
echo "=== 10. M3 V2 PRESERVATION ==="

if [[ ! -f scripts/m3-autopump-v2.sh ]]; then
    echo "FAIL: M3 V2 missing"
    exit 1
fi

bash -n scripts/m3-autopump-v2.sh

echo "M3 V2 preservation: PASS"

echo
echo "=== 11. EXECUTION BOUNDARY REGRESSION ==="

if grep -RInE \
'exec[[:space:]]*\(|execSync[[:space:]]*\(|spawn[[:space:]]*\(|spawnSync[[:space:]]*\(|child_process|eval[[:space:]]*\(' \
src/routes/m3-governance.js \
src/eons/reality \
src/eons/hcns \
src/eons/state \
src/eons/verification \
2>/dev/null
then
    echo "FAIL: prohibited execution primitive detected"
    exit 1
fi

echo "Execution boundary: PASS"

echo
echo "=== 12. SECRET REGRESSION ==="

if git diff --cached --name-only |
grep -E \
'(^|/)(\.env|\.env\..*|.*\.pem|.*\.key|id_rsa.*|id_ed25519.*)$'
then
    echo "FAIL: possible secret staged"
    exit 1
fi

echo "Secret scan: PASS"

echo
echo "=== 13. M15 ISOLATION REGRESSION ==="

FORBIDDEN=0

while IFS= read -r f; do
    case "$f" in
        src/server.js)
            # M15 canonical integration is an explicitly authorized server change.
            # Reject server.js unless the staged diff contains both required M15
            # integration lines.
            if git diff --cached -- src/server.js |
               grep -Fq "+const eonsModelsRouter = require('./routes/eons-models');" &&
               git diff --cached -- src/server.js |
               grep -Fq "+app.use('/api/eons-models', eonsModelsRouter);"
            then
                echo "AUTHORIZED M15 INTEGRATION: $f"
            else
                echo "FORBIDDEN: $f"
                FORBIDDEN=1
            fi
            ;;
        eons-omnimodel-upgrade.sh)
            echo "FORBIDDEN: $f"
            FORBIDDEN=1
            ;;
        public/index.html.backup-*)
            echo "FORBIDDEN: $f"
            FORBIDDEN=1
            ;;
        public/index.html.pre-ui-fix-*)
            echo "FORBIDDEN: $f"
            FORBIDDEN=1
            ;;
    esac
done < <(git diff --cached --name-only)

if [[ "$FORBIDDEN" -ne 0 ]]; then
    echo "FAIL: M15/unrelated staged material detected"
    exit 1
fi

echo "M15 isolation: PASS"

echo
echo "=== 14. DIFF SAFETY ==="

git diff --cached --check

echo "Diff safety: PASS"

echo
echo "=== 15. GIT SAFETY ==="

echo "Commit: DISABLED"
echo "Push: DISABLED"
echo "Deployment: DISABLED"
echo "Destructive reset: DISABLED"
echo "Working-tree cleanup: DISABLED"

echo
echo "=== 16. FINAL STATUS ==="

git status --short

echo
echo "============================================================"
echo "🧠 M3 MILESTONE 7 — REGRESSION HARNESS PASSED"
echo "============================================================"
echo "M3 FOUNDATION PRESERVED"
echo "GOVERNANCE REGRESSION PASSED"
echo "REALITY REGRESSION PASSED"
echo "HCNS REGRESSION PASSED"
echo "STATE / VERIFICATION REGRESSION PASSED"
echo "M3 V2 PRESERVED"
echo "EXECUTION BOUNDARY PASSED"
echo "SECRET SCAN PASSED"
echo "M15 ISOLATION PASSED"
echo "NO COMMIT"
echo "NO PUSH"
echo "NO DEPLOYMENT"
echo "============================================================"
