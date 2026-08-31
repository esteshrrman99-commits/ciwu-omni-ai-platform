'use strict';

const crypto=
  require('node:crypto');


const legacyContract=
  require('./fusion-legacy-ui-contract-v1');

function sha256(value) {
  return crypto
    .createHash('sha256')
    .update(String(value))
    .digest('hex');
}

function inject(html) {
  let output=String(html);

  const bridge=
    '<script src="/ciwu-sovereign-intelligence-bridge.js" defer></script>';

  const assistant=
    '<script src="/ciwu-product-ai-assistant.js" defer></script>';

  const marker=
    '<meta name="ciwu-fusion-generation" content="OMEGA120_M2785_M2904">';

  if (
    !output.includes(
      'ciwu-fusion-generation'
    )
  ) {
    if (
      /<\/head>/i.test(output)
    ) {
      output=output.replace(
        /<\/head>/i,
        `${marker}\n</head>`
      );
    } else {
      output=
        marker+'\n'+output;
    }
  }

  if (
    !output.includes(
      'ciwu-sovereign-intelligence-bridge.js'
    )
  ) {
    output=output.replace(
      /<\/body>/i,
      `${bridge}\n</body>`
    );
  }

  if (
    !output.includes(
      'ciwu-product-ai-assistant.js'
    )
  ) {
    output=output.replace(
      /<\/body>/i,
      `${assistant}\n</body>`
    );
  }

  output=
    legacyContract.inject(output);

  return {
    html:output,
    sha256:
      sha256(output),
    intelligenceInjected:true,
    sovereignAdminPreserved:true,
    legacyUiContractPreserved:true
  };
}

module.exports={
  sha256,
  inject
};
