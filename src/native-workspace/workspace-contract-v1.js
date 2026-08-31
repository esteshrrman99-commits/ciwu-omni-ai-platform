'use strict';

const OPERATIONS = Object.freeze({
  LIST:    { authority: 'READ',    mutates: false },
  READ:    { authority: 'READ',    mutates: false },
  SEARCH:  { authority: 'READ',    mutates: false },

  CREATE:  { authority: 'WRITE',   mutates: true },
  UPDATE:  { authority: 'WRITE',   mutates: true },
  DELETE:  { authority: 'WRITE',   mutates: true },

  RUN:     { authority: 'EXECUTE', mutates: true },
  TEST:    { authority: 'EXECUTE', mutates: true },

  COMMIT:  { authority: 'COMMIT',  mutates: true },
  PUSH:    { authority: 'PUSH',    mutates: true },
  DEPLOY:  { authority: 'DEPLOY',  mutates: true }
});

function operation(name) {
  return OPERATIONS[name] || null;
}

module.exports = {
  OPERATIONS,
  operation
};
