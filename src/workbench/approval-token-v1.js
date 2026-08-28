'use strict';

const crypto=require('node:crypto');

const policy=
  require('./approval-policy-v1');

function b64url(value) {
  return Buffer
    .from(value)
    .toString('base64url');
}

function unb64url(value) {
  return Buffer.from(
    value,
    'base64url'
  );
}

function signPayload(
  encodedPayload,
  secret
) {
  return crypto
    .createHmac(
      'sha256',
      policy.assertSecret(secret)
    )
    .update(encodedPayload)
    .digest('base64url');
}

function timingSafeEqualText(
  a,
  b
) {
  const aa=Buffer.from(
    String(a)
  );

  const bb=Buffer.from(
    String(b)
  );

  return (
    aa.length === bb.length &&
    crypto.timingSafeEqual(
      aa,
      bb
    )
  );
}

function issue({
  proposal,
  secret,
  now=Math.floor(
    Date.now() / 1000
  ),
  ttlSeconds=300,
  jti=
    crypto.randomBytes(18)
      .toString('hex')
}={}) {
  if (
    !proposal ||
    proposal.schema !==
      'CIWU_REPAIR_PROPOSAL_V1'
  ) {
    throw new Error(
      'TOKEN_PROPOSAL_INVALID'
    );
  }

  if (
    !Number.isInteger(
      ttlSeconds
    ) ||
    ttlSeconds < 1 ||
    ttlSeconds >
      policy.MAX_TOKEN_TTL_SECONDS
  ) {
    throw new Error(
      'TOKEN_TTL_INVALID'
    );
  }

  const claims={
    schema:
      'CIWU_APPROVAL_TOKEN_V1',
    scope:
      policy.ALLOWED_SCOPE,
    proposalId:
      proposal.proposalId,
    evidenceHash:
      proposal.evidenceHash,
    baseSha:
      proposal.baseSha,
    jti,
    iat:now,
    exp:
      now + ttlSeconds
  };

  policy.assertClaims(
    claims
  );

  const payload=
    b64url(
      JSON.stringify(
        claims
      )
    );

  const signature=
    signPayload(
      payload,
      secret
    );

  return {
    token:
      `${payload}.${signature}`,
    claims
  };
}

function decodeAndVerify({
  token,
  secret,
  now=Math.floor(
    Date.now() / 1000
  )
}={}) {
  const parts=
    String(token || '')
      .split('.');

  if (
    parts.length !== 2
  ) {
    throw new Error(
      'TOKEN_FORMAT_INVALID'
    );
  }

  const [
    payload,
    signature
  ]=parts;

  const expected=
    signPayload(
      payload,
      secret
    );

  if (
    !timingSafeEqualText(
      signature,
      expected
    )
  ) {
    throw new Error(
      'TOKEN_SIGNATURE_INVALID'
    );
  }

  let claims;

  try {
    claims=
      JSON.parse(
        unb64url(
          payload
        ).toString('utf8')
      );
  } catch (_) {
    throw new Error(
      'TOKEN_PAYLOAD_INVALID'
    );
  }

  policy.assertClaims(
    claims
  );

  if (
    now < claims.iat
  ) {
    throw new Error(
      'TOKEN_NOT_YET_VALID'
    );
  }

  if (
    now >= claims.exp
  ) {
    throw new Error(
      'TOKEN_EXPIRED'
    );
  }

  return {
    verified:true,
    claims
  };
}

module.exports={
  b64url,
  unb64url,
  signPayload,
  timingSafeEqualText,
  issue,
  decodeAndVerify
};
