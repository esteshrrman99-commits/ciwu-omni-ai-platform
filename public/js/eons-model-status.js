(function () {

  "use strict";

  async function loadEonsModels() {

    try {

      const response =
        await fetch("/api/eons-models/status");

      if (!response.ok) {
        throw new Error("EONS status request failed");
      }

      const data = await response.json();

      console.log(
        "[EONS] OMNIMODEL STATUS",
        data
      );

      window.EONS_MODEL_STATUS = data;

      document.dispatchEvent(
        new CustomEvent(
          "eons-model-status",
          {
            detail: data
          }
        )
      );

    } catch (error) {

      console.warn(
        "[EONS] Model status unavailable:",
        error.message
      );

    }

  }

  if (document.readyState === "loading") {

    document.addEventListener(
      "DOMContentLoaded",
      loadEonsModels
    );

  } else {

    loadEonsModels();

  }

})();
