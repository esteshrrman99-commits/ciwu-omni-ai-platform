'use strict';

function derive(
  session
) {
  if (!session)
    return 'NO_SESSION';

  if (
    session.allowed === false
  ) {
    return 'NOT_AUTHORIZED';
  }

  const s =
    session.session ||
    session;

  if (
    s.executed !== true
  ) {
    return 'AUTHORIZED_NOT_EXECUTED';
  }

  if (
    s.certification
      ?.success === true
  ) {
    return 'REAL_INFERENCE_CERTIFIED';
  }

  return 'REAL_INFERENCE_FAILED';
}

module.exports = {
  derive
};
