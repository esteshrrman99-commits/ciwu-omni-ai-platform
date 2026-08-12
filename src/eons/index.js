'use strict';

/*
 * CIWU OMNI / EONS LIVE MODULE REGISTRY
 *
 * The public EONS API exports initialized module instances,
 * not constructor classes.
 */

const M3CodingAgent = require('./core/m3-agent');
const EonsModelRouter = require('./core/model-router');

const Eons = require('./core/eons');
const Cortex = require('./cortex/cortex');
const Codex = require('./codex/codex');
const Vortex = require('./vortex/vortex');
const Zortex = require('./zortex/zortex');
const Neurotex = require('./neurotex/neurotex');
const Memortex = require('./memortex/memortex');
const Trustex = require('./trustex/trustex');
const Securex = require('./securex/securex');
const Evolvex = require('./evolvex/evolvex');

function instantiate(Module, name) {
  if (typeof Module !== 'function') {
    throw new TypeError(
      `[EONS] ${name} implementation is not constructable`
    );
  }

  const instance = new Module();

  if (!instance) {
    throw new Error(
      `[EONS] ${name} failed to initialize`
    );
  }

  return instance;
}

const eons = instantiate(Eons, 'EONS');
const cortex = instantiate(Cortex, 'CORTEX');
const codex = instantiate(Codex, 'CODEX');
const vortex = instantiate(Vortex, 'VORTEX');
const zortex = instantiate(Zortex, 'ZORTEX');
const neurotex = instantiate(Neurotex, 'NEUROTEX');
const memortex = instantiate(Memortex, 'MEMORTEX');
const trustex = instantiate(Trustex, 'TRUSTEX');
const securex = instantiate(Securex, 'SECUREX');
const evolvex = instantiate(Evolvex, 'EVOLVEX');

module.exports = {
  M3CodingAgent,
  EonsModelRouter,

  eons,
  cortex,
  codex,
  vortex,
  zortex,
  neurotex,
  memortex,
  trustex,
  securex,
  evolvex
};
