'use strict';

const fs=require('node:fs');

const inspector=
  require('./safe-file-inspector-v1');

const MAX_QUERY_LENGTH=120;
const MAX_FILES=250;
const MAX_RESULTS=200;

function normalizeQuery(value='') {
  const query=
    String(value).trim();

  if (!query)
    throw new Error('SEARCH_QUERY_REQUIRED');

  if (query.length > MAX_QUERY_LENGTH)
    throw new Error('SEARCH_QUERY_TOO_LONG');

  return query;
}

function search(
  root,
  entries=[],
  rawQuery=''
) {
  const query=
    normalizeQuery(rawQuery);

  const needle=
    query.toLowerCase();

  const candidates=
    entries
      .filter(
        entry =>
          entry.type === 'file' &&
          inspector.inspectable(entry.path)
      )
      .slice(0,MAX_FILES);

  const results=[];

  for (const entry of candidates) {
    if (results.length >= MAX_RESULTS)
      break;

    let safe;

    try {
      safe=
        inspector.resolveSafe(
          root,
          entry.path
        );
    } catch (_) {
      continue;
    }

    const stat=
      fs.statSync(safe.absolute);

    if (
      !stat.isFile() ||
      stat.size > inspector.MAX_BYTES
    ) continue;

    const lines=
      fs.readFileSync(
        safe.absolute,
        'utf8'
      ).split(/\r?\n/);

    for (
      let index=0;
      index<lines.length &&
      results.length<MAX_RESULTS;
      index++
    ) {
      const line=lines[index];

      if (
        line.toLowerCase()
          .includes(needle)
      ) {
        results.push({
          file:entry.path,
          line:index+1,
          preview:
            line.length > 300
              ? line.slice(0,300)
              : line
        });
      }
    }
  }

  return {
    ok:true,
    readOnly:true,
    query,
    filesScanned:candidates.length,
    resultCount:results.length,
    capped:
      results.length >= MAX_RESULTS,
    results
  };
}

module.exports={
  MAX_QUERY_LENGTH,
  MAX_FILES,
  MAX_RESULTS,
  normalizeQuery,
  search
};
