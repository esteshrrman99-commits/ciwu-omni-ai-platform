(function () {
  "use strict";

  const state = {
    connected: false
  };

  function createConsole() {
    if (document.getElementById("m3-console")) return;

    const panel = document.createElement("section");

    panel.id = "m3-console";

    panel.innerHTML = `
      <div class="m3-header">
        <div>
          <strong>M3 CODING ENGINE</strong>
          <small>EONS • ZORTEX • CORTEX • VORTEX</small>
        </div>
        <span id="m3-status">● READY</span>
      </div>

      <div class="m3-body">
        <textarea
          id="m3-request"
          placeholder="Tell M3 what you want to build, debug, refactor, or test..."
          rows="5"
        ></textarea>

        <div class="m3-actions">
          <button id="m3-plan">PLAN</button>
          <button id="m3-build">BUILD</button>
          <button id="m3-test">TEST</button>
        </div>

        <pre id="m3-output">M3 is ready.</pre>
      </div>
    `;

    document.body.appendChild(panel);

    document
      .getElementById("m3-plan")
      .addEventListener("click", () => run("plan"));

    document
      .getElementById("m3-build")
      .addEventListener("click", () => run("build"));

    document
      .getElementById("m3-test")
      .addEventListener("click", () => run("test"));
  }

  async function run(mode) {
    const request = document
      .getElementById("m3-request")
      .value
      .trim();

    const output = document.getElementById("m3-output");

    if (!request) {
      output.textContent = "Enter a coding task first.";
      return;
    }

    output.textContent =
      `M3 ${mode.toUpperCase()} REQUEST\n\n` +
      request +
      "\n\nWaiting for M3 backend...";

    /*
      Backend integration intentionally remains disabled
      until the server route is verified.

      This prevents the frontend from generating fake
      success messages.
    */

    console.log("[M3]", mode, request);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", createConsole);
  } else {
    createConsole();
  }
})();
