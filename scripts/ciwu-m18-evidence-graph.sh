#!/data/data/com.termux/files/usr/bin/bash
set -Eeuo pipefail

export HOME="/data/data/com.termux/files/home"

PROJECT="$HOME/ciwu-omni-ai-platform"
PRIVATE="$PROJECT/.ciwu-private/m18"
OUT="$PRIVATE/graphs/evidence-graph.json"

mkdir -p "$(dirname "$OUT")"

python - "$PRIVATE" "$OUT" <<'PY'
import glob
import json
import os
import sys
from datetime import datetime, timezone

root, out = sys.argv[1:]

nodes = []
claims = []

for meta in glob.glob(
    os.path.join(root, "**", "*.metadata.json"),
    recursive=True
):
    try:
        with open(meta, encoding="utf-8") as f:
            d = json.load(f)
    except Exception:
        continue

    typ = d.get("type", "SUPPLIER_RESPONSE")

    state = (
        d.get("verification", {})
        .get("state", "UNVERIFIED")
    )

    artifact = (
        d.get("artifact")
        or d.get("response_artifact")
        or {}
    )

    node = {
        "metadata": meta,
        "type": typ,
        "sha256": artifact.get("sha256"),
        "verification": state
    }

    nodes.append(node)

    claims.append({
        "claim":
            typ + "_VERIFIED",

        "allowable":
            state == "VERIFIED",

        "source":
            meta
    })

graph = {
    "schema":
        "CIWU_M18_SOURCE_CLAIM_GRAPH_V1",

    "nodes":
        nodes,

    "claims":
        claims,

    "generated_at":
        datetime.now(timezone.utc).isoformat()
}

with open(out, "w", encoding="utf-8") as f:
    json.dump(graph, f, indent=2)
    f.write("\n")

os.chmod(out, 0o600)

print("EVIDENCE_NODES=" + str(len(nodes)))
print(
    "VERIFIED_CLAIMS="
    + str(
        sum(
            1
            for c in claims
            if c["allowable"]
        )
    )
)
PY

echo "EVIDENCE_GRAPH=$OUT"
