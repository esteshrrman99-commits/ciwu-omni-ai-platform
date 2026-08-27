'use strict';

const {
  publicStatus
} = require(
  '../../src/sovereign/providers/environment'
);

const status =
  publicStatus();

for (
  const [provider, state]
  of Object.entries(status)
) {
  console.log(
    `${provider.toUpperCase()}=` +
    (
      state.configured
        ? 'CONFIGURED'
        : 'UNCONFIGURED'
    )
  );

  console.log(
    `${provider.toUpperCase()}_MODEL=` +
    (
      state.modelConfigured
        ? 'CONFIGURED'
        : 'DEFAULT_OR_UNCONFIGURED'
    )
  );
}
