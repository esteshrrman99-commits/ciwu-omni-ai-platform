'use strict';

const crypto=require('node:crypto');

const history=
  require('./original-platform-history-locator-v1');

function sha256(value) {
  return crypto
    .createHash('sha256')
    .update(String(value))
    .digest('hex');
}

function metrics(content='') {
  return {
    bytes:
      Buffer.byteLength(content),
    forms:
      (content.match(/<form\b/gi)||[]).length,
    buttons:
      (content.match(/<button\b/gi)||[]).length,
    inputs:
      (content.match(/<input\b/gi)||[]).length,
    scripts:
      (content.match(/<script\b/gi)||[]).length,
    links:
      (content.match(/<a\b/gi)||[]).length,
    sections:
      (content.match(/<section\b/gi)||[]).length
  };
}

function build({
  pathname='public/index.html',
  maximum=60
}={}) {
  const revisions=
    history.commitsFor(pathname)
      .slice(0,maximum);

  const snapshots=[];

  for (const revision of revisions) {
    const content=
      history.showFile(
        revision.sha,
        pathname
      );

    if (content===null) continue;

    snapshots.push({
      ...revision,
      contentSha256:
        sha256(content),
      metrics:
        metrics(content),
      signals:{
        sovereign:
          /Sovereign|Command Center|M3 Intelligence/i.test(content),
        dashboard:
          /dashboard/i.test(content),
        chatbot:
          /chat|assistant|conversation/i.test(content),
        commerce:
          /product|supplier|checkout|cart|order/i.test(content),
        project:
          /project|workspace|repository/i.test(content)
      }
    });
  }

  return {
    schema:
      'CIWU_HISTORICAL_FRONTEND_SNAPSHOT_INDEX_V1',
    pathname,
    count:
      snapshots.length,
    snapshots,
    mutationPerformed:false
  };
}

module.exports={
  sha256,
  metrics,
  build
};
