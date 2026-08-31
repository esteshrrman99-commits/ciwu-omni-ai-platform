(function () {
  "use strict";

  const path = window.location.pathname || "/";

  /*
   * Sovereign/admin surface retains full engineering instrumentation.
   */
  if (
    path === "/sovereign" ||
    path.startsWith("/sovereign/")
  ) {
    document.documentElement.dataset.ciwuSurface = "sovereign";
    return;
  }

  document.documentElement.dataset.ciwuSurface = "product";

  const ENGINEERING_ID_CLASS = [
    "workbench",
    "project-brain",
    "project-intelligence",
    "repository",
    "repo-explorer",
    "code-intelligence",
    "codex",
    "xeon",
    "repair-search",
    "repair-approval",
    "milestone-ledger",
    "release-ledger",
    "source-symbol",
    "symbol-list",
    "dependency-list"
  ];

  const ENGINEERING_TEXT = [
    "public/ciwu-project-intelligence.js:",
    "public/ciwu-project-brain.js:",
    "public/ciwu-omni-app.js:",
    "src/enhanced-api.js",
    "src/eons/",
    "data/sovereign/omega120-",
    "data/frontend/project-brain",
    "data/frontend/project-intelligence",
    "OMEGA120_M2785_M2904",
    "Milestones 2785",
    "Repository Explorer",
    "Project Intelligence Workbench",
    "Project Brain",
    "CODEX XEON",
    "CODEX × XEON"
  ];

  function markerMatch(node) {
    if (!(node instanceof HTMLElement)) return false;

    const marker = [
      node.id || "",
      typeof node.className === "string" ? node.className : ""
    ].join(" ").toLowerCase();

    return ENGINEERING_ID_CLASS.some(
      token => marker.includes(token)
    );
  }

  function textMatch(node) {
    if (!(node instanceof HTMLElement)) return false;

    const text = (node.innerText || "").trim();

    if (!text || text.length > 150000) return false;

    return ENGINEERING_TEXT.some(
      token => text.includes(token)
    );
  }

  function shellFor(node) {
    if (!(node instanceof HTMLElement)) return null;

    return (
      node.closest(
        "section, article, .panel, .card, .module, .workbench, " +
        "[data-ciwu-workbench], [data-ciwu-project-brain], " +
        "[data-ciwu-project-intelligence]"
      ) ||
      node
    );
  }

  function hideEngineeringSurface() {
    const candidates = document.querySelectorAll(
      "section, article, div, aside"
    );

    for (const node of candidates) {
      if (
        markerMatch(node) ||
        textMatch(node)
      ) {
        const shell = shellFor(node);

        if (!shell) continue;

        /*
         * Never suppress primary original-product modules merely because
         * one descendant happens to contain an engineering label.
         */
        const bodyText = (shell.innerText || "");

        const productSignals = [
          "ABIJAH INTELLIGENCE",
          "PATIENT NAVIGATION SYSTEM",
          "VIDEO DIAGNOSTIC AI",
          "Supplier Operations Command Center",
          "Cellular Vitality",
          "QUANTUM MILESTONE DASHBOARD",
          "EONS M5.0",
          "Evidence Orchestration Matrix"
        ];

        if (
          productSignals.some(
            signal => bodyText.includes(signal)
          ) &&
          shell.children.length > 3
        ) {
          continue;
        }

        shell.dataset.ciwuEngineeringSurface = "hidden-on-product";
        shell.hidden = true;
      }
    }
  }

  function classifyFloatingElements() {
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

      const text = (node.innerText || "").trim();

      if (
        text.includes("EONS CORTEX: ONLINE") ||
        (
          text.includes("MODELS:") &&
          text.includes("PROVIDERS:")
        )
      ) {
        node.dataset.ciwuEngineeringTelemetry = "true";
      }

      if (text.includes("M3 CODING ENGINE")) {
        node.dataset.ciwuM3EngineeringDock = "true";
      }

      if (
        text.trim() === "CIWU AI" ||
        text.includes("CIWU AI")
      ) {
        node.dataset.ciwuProductAiControl = "true";
      }
    }
  }

  function apply() {
    hideEngineeringSurface();
    classifyFloatingElements();
  }

  apply();

  const observer = new MutationObserver(() => {
    window.clearTimeout(window.__ciwuSurfaceTimer);

    window.__ciwuSurfaceTimer =
      window.setTimeout(apply, 80);
  });

  observer.observe(
    document.documentElement,
    {
      childList: true,
      subtree: true
    }
  );

  /*
   * Prevent an indefinitely active observer from becoming unnecessary
   * page overhead after asynchronous boot completes.
   */
  window.setTimeout(
    () => observer.disconnect(),
    12000
  );
})();
