'use strict';

const express = require('express');

const {
  buildOrchestration,
  resolveConflict
} = require(
  '../eons/intelligence/evidence-orchestrator'
);

const router = express.Router();

function getNested(obj, paths = []) {
  for (const path of paths) {
    const parts =
      path.split('.');

    let cur = obj;

    for (const part of parts) {
      cur =
        cur &&
        typeof cur === 'object'
          ? cur[part]
          : undefined;
    }

    if (cur !== undefined) {
      return cur;
    }
  }

  return undefined;
}

async function fetchJson(req, endpoint) {
  const host =
    req.get('host');

  const protocol =
    req.protocol || 'http';

  const url =
    `${protocol}://${host}${endpoint}`;

  try {
    const response =
      await fetch(url, {
        headers: {
          accept:
            'application/json'
        }
      });

    if (!response.ok) {
      return {
        ok: false,
        endpoint,
        status:
          response.status,
        data: null
      };
    }

    return {
      ok: true,
      endpoint,
      status:
        response.status,
      data:
        await response.json()
    };

  } catch (error) {
    return {
      ok: false,
      endpoint,
      status: null,
      data: null,
      error:
        error.message
    };
  }
}

router.get('/status', (req, res) => {
  res.json({
    success: true,

    engine:
      'EONS Evidence Orchestration Engine',

    version:
      '5.3.0',

    status:
      'ONLINE',

    functions: {
      telemetryReconciliation:
        true,

      claimProvenance:
        true,

      conflictResolution:
        true,

      patientContextGraph:
        true,

      longitudinalTimeline:
        true,

      treatmentComparison:
        true,

      uncertaintyExplicit:
        true
    },

    medicalBoundary:
      'educational-support'
  });
});

router.get('/truth', async (req, res) => {
  const endpoints = [
    '/api/stats',
    '/api/eons/status',
    '/api/eons-models/status',
    '/api/eons-models/available',
    '/api/abijah/status'
  ];

  const results =
    await Promise.all(
      endpoints.map(
        endpoint =>
          fetchJson(
            req,
            endpoint
          )
      )
    );

  const stats =
    results.find(
      x =>
        x.endpoint ===
        '/api/stats'
    )?.data || {};

  const modelsStatus =
    results.find(
      x =>
        x.endpoint ===
        '/api/eons-models/status'
    )?.data || {};

  const modelsAvailable =
    results.find(
      x =>
        x.endpoint ===
        '/api/eons-models/available'
    )?.data || {};

  const abijah =
    results.find(
      x =>
        x.endpoint ===
        '/api/abijah/status'
    )?.data || {};

  const availableArray =
    getNested(
      modelsAvailable,
      [
        'models',
        'available',
        'data.models'
      ]
    );

  const explicitModelCount =
    getNested(
      modelsStatus,
      [
        'modelCount',
        'models.count',
        'count'
      ]
    );

  const models =
    typeof explicitModelCount ===
      'number'
      ? explicitModelCount
      : Array.isArray(availableArray)
        ? availableArray.length
        : undefined;

  const capabilitiesObj =
    getNested(
      abijah,
      [
        'abijah.capabilities',
        'capabilities'
      ]
    );

  const capabilities =
    capabilitiesObj &&
    typeof capabilitiesObj ===
      'object'
      ? Object.values(
          capabilitiesObj
        ).filter(Boolean).length
      : undefined;

  /*
   * IMPORTANT:
   *
   * Providers/entities/relations are not
   * defaulted to zero.
   */
  const metrics = {
    models,

    providers:
      getNested(
        stats,
        [
          'providers',
          'counts.providers',
          'data.providers'
        ]
      ),

    entities:
      getNested(
        stats,
        [
          'entities',
          'counts.entities',
          'data.entities'
        ]
      ),

    relations:
      getNested(
        stats,
        [
          'relations',
          'counts.relations',
          'data.relations'
        ]
      ),

    capabilities
  };

  const payload =
    buildOrchestration({
      metrics,

      services:
        results.map(result => ({
          id:
            result.endpoint
              .replace('/api/', '')
              .replaceAll(
                '/',
                ':'
              ),

          endpoint:
            result.endpoint,

          response:
            result.data,

          ok:
            result.ok
        }))
    });

  res.json(payload);
});

router.post('/resolve-conflict', (req, res) => {
  const items =
    Array.isArray(req.body?.items)
      ? req.body.items
      : [];

  res.json({
    success: true,
    resolution:
      resolveConflict(items)
  });
});

router.post('/orchestrate', (req, res) => {
  res.json(
    buildOrchestration(
      req.body || {}
    )
  );
});

module.exports = router;
