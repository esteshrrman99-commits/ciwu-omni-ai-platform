'use strict';

function extractHtml(content='') {
  const hrefs=[
    ...content.matchAll(
      /href=["']([^"'#]+)["']/gi
    )
  ].map(match=>match[1]);

  const forms=[
    ...content.matchAll(
      /action=["']([^"']+)["']/gi
    )
  ].map(match=>match[1]);

  const fetches=[
    ...content.matchAll(
      /fetch\(\s*["'`]([^"'`]+)["'`]/gi
    )
  ].map(match=>match[1]);

  const ids=[
    ...content.matchAll(
      /\bid=["']([^"']+)["']/gi
    )
  ].map(match=>match[1]);

  return {
    hrefs:[...new Set(hrefs)].sort(),
    formActions:[...new Set(forms)].sort(),
    fetchTargets:[...new Set(fetches)].sort(),
    ids:[...new Set(ids)].sort()
  };
}

function classify(inventory) {
  const all=[
    ...inventory.hrefs,
    ...inventory.formActions,
    ...inventory.fetchTargets
  ];

  return {
    apiRoutes:
      [...new Set(
        all.filter(value=>
          value.startsWith('/api/')
        )
      )].sort(),
    internalRoutes:
      [...new Set(
        all.filter(value=>
          value.startsWith('/') &&
          !value.startsWith('/api/')
        )
      )].sort(),
    externalLinks:
      [...new Set(
        all.filter(value=>
          /^https?:\/\//i.test(value)
        )
      )].sort()
  };
}

function build(content='') {
  const inventory=extractHtml(content);

  return {
    schema:
      'CIWU_ORIGINAL_ROUTE_PAGE_INVENTORY_V1',
    ...inventory,
    classified:
      classify(inventory),
    mutationPerformed:false
  };
}

module.exports={
  extractHtml,
  classify,
  build
};
