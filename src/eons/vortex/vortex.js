'use strict';

class VORTEX {
  verify(results = []) {
    const valid = Array.isArray(results)
      ? results.filter(Boolean)
      : [];

    return {
      subsystem: 'VORTEX',
      candidates: valid.length,
      verification: valid.length > 0
        ? 'CANDIDATES_AVAILABLE'
        : 'NO_CANDIDATES',
      requires_external_evidence: true,
      consensus_is_not_proof: true
    };
  }

  compare(models = []) {
    return [...models].sort((a, b) => {
      const scoreA = Number(a.eons_score || 0);
      const scoreB = Number(b.eons_score || 0);
      return scoreB - scoreA;
    });
  }
}

module.exports = VORTEX;
