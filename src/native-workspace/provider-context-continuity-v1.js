'use strict';

const {
  ProviderContextPersistence
} = require(
  './provider-context-persistence-v1'
);

function createProviderContextContinuity({
  stateRoot,
  clock
}) {
  const store =
    new ProviderContextPersistence({
      stateRoot,
      clock
    });

  return {
    persistAdmittedContext(input) {
      return store.persist(input);
    },

    retrieveAdmittedContext(query) {
      return store.retrieve(query);
    },

    verifyContinuity() {
      return store.verifyLedger();
    },

    get authority() {
      return {
        operational:false,
        tool:false,
        write:false,
        execute:false,
        commit:false,
        push:false,
        deploy:false,
        network:false
      };
    }
  };
}

module.exports = {
  createProviderContextContinuity
};
