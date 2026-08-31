'use strict';

const fs=require('node:fs');
const crypto=require('node:crypto');

function hashFile(file) {
  return crypto
    .createHash('sha256')
    .update(
      fs.readFileSync(file)
    )
    .digest('hex');
}

function create({
  originalCandidate,
  certifiedParent
}={}) {
  const product=
    'public/original-platform-v1/index.fused.html';

  const sovereign=
    'public/sovereign/index.html';

  if (
    !fs.existsSync(product) ||
    !fs.existsSync(sovereign)
  ) {
    throw new Error(
      'DUAL_SURFACE_FILE_MISSING'
    );
  }

  return {
    schema:
      'CIWU_DUAL_SURFACE_INTEGRITY_V1',
    originalCandidate,
    certifiedParent,
    product:{
      target:'/',
      source:product,
      sha256:hashFile(product)
    },
    sovereign:{
      target:'/sovereign/',
      source:sovereign,
      sha256:hashFile(sovereign)
    },
    productPrimary:true,
    sovereignAdminPreserved:true,
    surfacesSeparated:true
  };
}

module.exports={
  hashFile,
  create
};
