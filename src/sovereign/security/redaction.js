'use strict';

const PATTERNS = [
  /sk-[A-Za-z0-9_-]{12,}/g,
  /gsk_[A-Za-z0-9_-]{12,}/g,
  /hf_[A-Za-z0-9_-]{12,}/g,
  /AIza[A-Za-z0-9_-]{12,}/g,
  /Bearer\s+[A-Za-z0-9._-]{12,}/gi
];

function redact(value) {
  let text =
    String(
      value ?? ''
    );

  for (
    const pattern of
    PATTERNS
  ) {
    text =
      text.replace(
        pattern,
        '[REDACTED]'
      );
  }

  return text;
}

module.exports = {
  redact
};
