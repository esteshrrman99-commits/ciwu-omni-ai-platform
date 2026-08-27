'use strict';

const express =
  require('express');

const {
  buildProductionTruth
} =
  require(
    '../eons/intelligence/production-truth'
  );

const router =
  express.Router();

async function fetchJSON(
  base,
  path
) {
  try {
    const response =
      await fetch(
        base + path,
        {
          signal:
            AbortSignal.timeout(4000)
        }
      );

    if (!response.ok) {
      return null;
    }

    return await response.json();

  } catch (_) {
    return null;
  }
}

router.get(
  '/status',
  async (req, res) => {

    const base =
      `${req.protocol}://${req.get('host')}`;

    const [
      stats,
      eons,
      models,
      abijah
    ] =
      await Promise.all([
        fetchJSON(
          base,
          '/api/stats'
        ),
        fetchJSON(
          base,
          '/api/eons/status'
        ),
        fetchJSON(
          base,
          '/api/eons-models/available'
        ),
        fetchJSON(
          base,
          '/api/abijah/status'
        )
      ]);

    res.json(
      buildProductionTruth({
        stats,
        eons,
        models,
        abijah
      })
    );
  }
);

module.exports = router;
