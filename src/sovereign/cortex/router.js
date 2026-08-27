'use strict';

function classifyTask(task = {}) {
  const complexity = Number(task.complexity ?? 0.5);
  const risk = Number(task.risk ?? 0.5);
  const novelty = Number(task.novelty ?? 0.5);

  const score =
    0.45 * complexity +
    0.35 * risk +
    0.20 * novelty;

  if (score >= 0.80) return 'FRONTIER';
  if (score >= 0.50) return 'BALANCED';
  return 'ECONOMY';
}

function shouldEscalate({
  confidence,
  testsPassed,
  attempts,
  highImpact
}) {
  if (highImpact === true && confidence < 0.90)
    return true;

  if (testsPassed === false)
    return true;

  if (confidence < 0.70)
    return true;

  return attempts >= 2 && confidence < 0.90;
}

module.exports = {
  classifyTask,
  shouldEscalate
};
