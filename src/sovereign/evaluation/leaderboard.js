'use strict';

const { score } = require('./scorer');

function rank(results) {
  return results
    .map(r => ({
      ...r,
      compositeScore: score(r)
    }))
    .sort((a, b) =>
      b.compositeScore -
      a.compositeScore
    );
}

function winner(results, threshold = 0.75) {
  const ranked = rank(results);

  return ranked.find(
    r => r.compositeScore >= threshold
  ) || null;
}

module.exports = {
  rank,
  winner
};
