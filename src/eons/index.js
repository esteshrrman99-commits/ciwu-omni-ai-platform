'use strict';

const path = require('path');

const EONS = require('./core/eons');
const CORTEX = require('./cortex/cortex');
const CODEX = require('./codex/codex');
const VORTEX = require('./vortex/vortex');
const ZORTEX = require('./zortex/zortex');
const NEUROTEX = require('./neurotex/neurotex');
const MEMORTEX = require('./memortex/memortex');
const TRUSTEX = require('./trustex/trustex');
const SECUREX = require('./securex/securex');
const EVOLVEX = require('./evolvex/evolvex');

const root = path.resolve(__dirname, '../..');

const eons = new EONS(root);
const cortex = new CORTEX();
const codex = new CODEX();
const vortex = new VORTEX();
const zortex = new ZORTEX();
const neurotex = new NEUROTEX();
const memortex = new MEMORTEX();
const trustex = new TRUSTEX();
const securex = new SECUREX();
const evolvex = new EVOLVEX();

module.exports = {
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
