const express = require("express");
const router = express.Router();

const EonsModelRouter =
  require("../services/eons-model-router");

const routerEngine = new EonsModelRouter();

router.get("/status", (req, res) => {

  try {

    res.json({
      success: true,
      eons: routerEngine.status()
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      error: error.message
    });

  }
});

router.get("/available", (req, res) => {

  res.json({
    success: true,
    models: routerEngine.getAvailableModels()
  });

});

module.exports = router;
