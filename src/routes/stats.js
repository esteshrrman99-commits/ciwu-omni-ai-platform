const express = require('express');
const router = express.Router();
const knowledgeBaseLoader = require('../services/knowledge-base-loader');

router.get('/', async (req, res) => {
  if (!knowledgeBaseLoader.loaded) await knowledgeBaseLoader.load();
  
  const counts = knowledgeBaseLoader.getCounts();
  const totals = knowledgeBaseLoader.getTotalCounts();
  
  res.json({
    success: true,
    zortex: counts.zortex,
    cortex: counts.cortex,
    vortex: counts.vortex,
    eons: counts.eons,
    neurotex: counts.neurotex,
    totals: totals,
    rawStats: knowledgeBaseLoader.rawStats
  });
});

module.exports = router;
