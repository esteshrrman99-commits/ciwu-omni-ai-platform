'use strict';

const express=require('express');

const runtime=
  require('../workbench/project-runtime-snapshot-v2');

const repository=
  require('../workbench/repository-inventory-v2');

const symbols=
  require('../workbench/symbol-index-v2');

const providers=
  require('../workbench/provider-runtime-truth-v2');

const neurotex=
  require('../workbench/neurotex-runtime-summary-v2');

const activity=
  require('../workbench/certification-activity-v2');

const router=express.Router();

function noStore(res) {
  res.set(
    'Cache-Control',
    'no-store, max-age=0'
  );
}

router.get('/health',(req,res) => {
  noStore(res);

  res.json({
    ok:true,
    service:'CIWU_WORKBENCH_READONLY_V1',
    mutationAuthority:false,
    gitPushAuthority:false,
    purchaseAuthority:false
  });
});

router.get('/runtime',(req,res) => {
  noStore(res);
  res.json(
    runtime.snapshot(
      process.cwd()
    )
  );
});

router.get('/repository',(req,res) => {
  noStore(res);
  res.json(
    repository.inventory(
      process.cwd()
    )
  );
});

router.get('/symbols',(req,res) => {
  noStore(res);

  const inventory=
    repository.inventory(
      process.cwd()
    );

  res.json(
    symbols.build(
      process.cwd(),
      inventory.entries
    )
  );
});

router.get('/providers',(req,res) => {
  noStore(res);

  res.json(
    providers.truth(
      process.cwd()
    )
  );
});

router.get('/neurotex',(req,res) => {
  noStore(res);

  res.json(
    neurotex.scan(
      process.cwd()
    )
  );
});

router.get('/activity',(req,res) => {
  noStore(res);

  res.json(
    activity.build(
      process.cwd()
    )
  );
});

for (const blocked of [
  '/execute',
  '/write',
  '/apply',
  '/commit',
  '/push',
  '/purchase'
]) {
  router.all(
    blocked,
    (req,res) => {
      noStore(res);

      res.status(403).json({
        ok:false,
        error:
          'WORKBENCH_READ_ONLY'
      });
    }
  );
}

module.exports=router;
