'use strict';

class EVOLVEX {
  evaluateUpgrade(currentModel, candidateModel) {
    const current = Number(
      currentModel?.eons_score || 0
    );

    const candidate = Number(
      candidateModel?.eons_score || 0
    );

    return {
      candidate,
      current,
      improvement: Number(
        (candidate - current).toFixed(4)
      ),
      recommendation:
        candidate > current
          ? 'UPGRADE_CANDIDATE'
          : 'RETAIN_CURRENT'
    };
  }
}

module.exports = EVOLVEX;
