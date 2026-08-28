'use strict';

function uniq(values) {
  return [...new Set(values)]
    .filter(Boolean)
    .sort();
}

function extract(content='') {
  const classes=uniq(
    [...content.matchAll(
      /class=["']([^"']+)["']/gi
    )]
      .flatMap(match=>
        match[1]
          .split(/\s+/)
          .filter(Boolean)
      )
  );

  const images=uniq(
    [...content.matchAll(
      /<img[^>]+src=["']([^"']+)["']/gi
    )]
      .map(match=>match[1])
  );

  const stylesheets=uniq(
    [...content.matchAll(
      /<link[^>]+href=["']([^"']+\.css[^"']*)["']/gi
    )]
      .map(match=>match[1])
  );

  const scripts=uniq(
    [...content.matchAll(
      /<script[^>]+src=["']([^"']+)["']/gi
    )]
      .map(match=>match[1])
  );

  const headings=uniq(
    [...content.matchAll(
      /<h[1-3][^>]*>([^<]{1,160})<\/h[1-3]>/gi
    )]
      .map(match=>
        match[1]
          .replace(/\s+/g,' ')
          .trim()
      )
  );

  return {
    schema:
      'CIWU_ORIGINAL_UI_DNA_V1',
    classes,
    images,
    stylesheets,
    scripts,
    headings,
    mutationPerformed:false
  };
}

module.exports={
  uniq,
  extract
};
