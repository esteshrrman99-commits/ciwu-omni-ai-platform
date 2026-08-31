(function () {
  "use strict";

  const path = window.location.pathname || "/";

  if (
    path === "/sovereign" ||
    path.startsWith("/sovereign/")
  ) {
    document.documentElement.dataset.ciwuTruthSurface = "sovereign";
    return;
  }

  document.documentElement.dataset.ciwuTruthSurface = "product";

  const ENGINEERING_TEXT_MARKERS = [
    "SERVICE PROVENANCE",
    "/api/stats",
    "/api/eons/status",
    "/api/eons-models/status",
    "/api/eons-models/available",
    "/api/abijah/status",

    "OMEGA120_M2785_M2904",
    "OMEGA120_M2665_M2784",
    "Milestones 2785",

    "public/ciwu-project-intelligence.js:",
    "public/ciwu-project-brain.js:",
    "public/ciwu-omni-app.js:",
    "src/enhanced-api.js",
    "src/eons/",
    "data/sovereign/",
    "data/frontend/project-brain",
    "data/frontend/project-intelligence",

    "Repository Explorer",
    "Project Intelligence Workbench",
    "Project Brain",
    "CODEX XEON",
    "CODEX × XEON"
  ];

  const PRODUCT_KEEP_MARKERS = [
    "CIWU OMNI v4.0-QUANTUM",
    "Evidence Orchestration Matrix",
    "EONS M5.0",
    "QUANTUM MILESTONE DASHBOARD",
    "ZORTEX MATRIX",
    "CORTEX KNOWLEDGE",
    "VORTEX ENGINE",
    "EONS MATRIX",
    "NEUROTEX CORE",
    "PATIENT NAVIGATION SYSTEM",
    "VIDEO DIAGNOSTIC AI",
    "ABIJAH INTELLIGENCE",
    "CIWU OMNI AUTONOMOUS MEDICAL AI",
    "Cellular Vitality",
    "Supplier Operations Command Center",
    "Real Supplier Contact & Evidence Console"
  ];

  const RAW_DATA_HINTS = [
    '"supplier_evidence"',
    '"purchase_authorization"',
    '"sales"',
    '"manufacturer":',
    '"gmp":',
    '"coa":',
    '"quote":',
    '"formula":',
    '"complete":',
    '"title":',
    '"protocol":',
    '"supplements":'
  ];

  function text(node) {
    if (!(node instanceof HTMLElement)) return "";
    return (node.innerText || "").trim();
  }

  function containsAny(value, markers) {
    return markers.some(marker => value.includes(marker));
  }

  function productKeep(node) {
    const value = text(node);

    return containsAny(
      value,
      PRODUCT_KEEP_MARKERS
    );
  }

  function closestPanel(node) {
    if (!(node instanceof HTMLElement)) return null;

    return (
      node.closest(
        "section, article, aside, .panel, .card, .module, " +
        ".quantum-card, .quantum-section, " +
        "[data-ciwu-panel], [data-module]"
      ) ||
      node
    );
  }

  function markEngineeringPanel(node) {
    if (!(node instanceof HTMLElement)) return;

    const shell = closestPanel(node);

    if (!shell) return;

    if (productKeep(shell)) {
      /*
       * Preserve the parent product module. If the exact engineering
       * child is smaller, hide only that child.
       */
      if (!productKeep(node)) {
        node.dataset.ciwuPublicEngineeringInternal = "true";
      }
      return;
    }

    shell.dataset.ciwuPublicEngineeringInternal = "true";
  }

  function suppressEngineeringInternals() {
    const nodes = document.querySelectorAll(
      "section, article, aside, div, pre, code"
    );

    for (const node of nodes) {
      if (!(node instanceof HTMLElement)) continue;

      const value = text(node);

      if (!value) continue;

      if (
        containsAny(
          value,
          ENGINEERING_TEXT_MARKERS
        )
      ) {
        markEngineeringPanel(node);
      }
    }
  }

  function suppressRawDataDumps() {
    const nodes = document.querySelectorAll(
      "pre, code, .json, .raw-json, .output, .result, " +
      "[data-output], [data-json], [data-result]"
    );

    for (const node of nodes) {
      if (!(node instanceof HTMLElement)) continue;

      const value = text(node);

      if (!value) continue;

      const looksRaw =
        (
          value.startsWith("{") ||
          value.startsWith("[")
        ) &&
        containsAny(
          value,
          RAW_DATA_HINTS
        );

      if (looksRaw) {
        node.dataset.ciwuPublicRawEngineeringData = "true";
      }
    }
  }

  function classifyFixedEngineeringOverlays() {
    const nodes = document.querySelectorAll("body *");

    for (const node of nodes) {
      if (!(node instanceof HTMLElement)) continue;

      const style = getComputedStyle(node);

      if (
        style.position !== "fixed" &&
        style.position !== "sticky"
      ) {
        continue;
      }

      const value = text(node);

      if (!value) continue;

      if (
        value.includes("EONS CORTEX: ONLINE") &&
        value.includes("MODELS:") &&
        value.includes("PROVIDERS:")
      ) {
        node.dataset.ciwuPublicEngineeringOverlay = "true";
      }

      if (
        value.includes("M3 CODING ENGINE")
      ) {
        node.dataset.ciwuPublicEngineeringDock = "true";
      }
    }
  }

  function normalizeCapabilityLabels() {
    const cards = document.querySelectorAll(
      ".card, .module, .quantum-card, section, article, div"
    );

    for (const card of cards) {
      if (!(card instanceof HTMLElement)) continue;

      const value = text(card);

      if (!value) continue;

      const hasNoLiveDataset =
        value.includes("No live dataset connected") ||
        value.includes("NOT REPORTED") ||
        value.includes("NO VERIFIED VALUE");

      if (!hasNoLiveDataset) continue;

      const labels = card.querySelectorAll(
        ".status-badge, .badge, .status, .pill, " +
        "[class*='status'], [class*='badge']"
      );

      for (const label of labels) {
        if (!(label instanceof HTMLElement)) continue;

        const current = text(label);

        if (!current) continue;

        const activeTerms = [
          "Gene Therapy Active",
          "Regeneration Active",
          "Temporal Active",
          "Neural Active",
          "Universal Engine"
        ];

        if (
          activeTerms.some(term => current.includes(term))
        ) {
          label.dataset.ciwuOriginalStatusText =
            label.textContent || "";

          label.textContent =
            "Research / no live dataset";

          label.dataset.ciwuEvidenceNormalized =
            "true";
        }
      }
    }
  }

  function annotateHistoricalClaims() {
    const selectors = [
      "button",
      ".quantum-card",
      ".quantum-section",
      ".card",
      ".module"
    ];

    const nodes = document.querySelectorAll(
      selectors.join(",")
    );

    for (const node of nodes) {
      if (!(node instanceof HTMLElement)) continue;

      const value = text(node);

      if (!value) continue;

      if (
        value.includes("100x Surprise") ||
        value.includes("100x breakthrough") ||
        value.includes("blockchain-secured medical records") ||
        value.includes("Quantum-Enhanced Medical Platform")
      ) {
        node.dataset.ciwuHistoricalProductClaim =
          "true";
      }
    }
  }

  function apply() {
    suppressEngineeringInternals();
    suppressRawDataDumps();
    classifyFixedEngineeringOverlays();
    normalizeCapabilityLabels();
    annotateHistoricalClaims();
  }

  apply();

  let scheduled = false;

  const observer = new MutationObserver(() => {
    if (scheduled) return;

    scheduled = true;

    requestAnimationFrame(() => {
      scheduled = false;
      apply();
    });
  });

  observer.observe(
    document.documentElement,
    {
      childList: true,
      subtree: true
    }
  );

  window.setTimeout(
    () => observer.disconnect(),
    15000
  );
})();
