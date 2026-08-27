'use strict';

function compare(options = [], context = {}) {
  const rows =
    options
      .map((option, index) => {
        const evidence =
          Number(option.evidenceScore ?? 0.5);
        const fit =
          Number(option.contextFit ?? 0.5);
        const safety =
          Number(option.safetyScore ?? 0.5);
        const uncertainty =
          Number(option.uncertainty ?? 0.3);

        const composite =
          (0.40 * evidence) +
          (0.30 * fit) +
          (0.25 * safety) -
          (0.15 * uncertainty);

        return {
          rank: index + 1,
          name:
            option.name ||
            `Option ${index + 1}`,
          purpose:
            option.purpose || null,
          evidenceScore: evidence,
          contextFit: fit,
          safetyScore: safety,
          uncertainty,
          compositeScore:
            Math.max(
              0,
              Math.min(1, composite)
            ),
          notes:
            option.notes || null
        };
      })
      .sort((a, b) =>
        b.compositeScore -
        a.compositeScore
      )
      .map((row, index) => ({
        ...row,
        rank: index + 1
      }));

  return {
    context,
    options: rows,
    boundary:
      'Educational decision support only; no autonomous diagnosis or prescribing.'
  };
}

module.exports = {
  compare
};
