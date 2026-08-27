'use strict';

function mapTests(index) {
  const source = [];
  const tests = [];

  for (
    const file of
    index.files || []
  ) {
    if (file.test)
      tests.push(file.path);
    else
      source.push(file.path);
  }

  return source.map(file => {
    const stem =
      file
        .replace(/^src\//,'')
        .replace(/\.[^.]+$/,'');

    const base =
      stem.split('/').pop();

    return {
      source: file,
      tests:
        tests.filter(test =>
          test.includes(stem) ||
          test.includes(base)
        )
    };
  });
}

module.exports = {
  mapTests
};
