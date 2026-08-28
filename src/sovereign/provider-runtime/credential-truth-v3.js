'use strict';

function assess({
  credentialPresent,
  credentialSource,
  printedOrLogged,
  embeddedInSource
}) {
  const failures=[];

  if (credentialPresent !== true)
    failures.push('CREDENTIAL_MISSING');

  if (
    credentialSource !== 'ENVIRONMENT' &&
    credentialSource !== 'PRIVATE_VAULT'
  ) {
    failures.push(
      'UNAPPROVED_CREDENTIAL_SOURCE'
    );
  }

  if (printedOrLogged === true)
    failures.push('CREDENTIAL_EXPOSED');

  if (embeddedInSource === true)
    failures.push('CREDENTIAL_EMBEDDED');

  return {
    configured:
      credentialPresent === true,

    secure:
      failures.length === 0,

    certified:
      false,

    failures
  };
}

module.exports={ assess };
