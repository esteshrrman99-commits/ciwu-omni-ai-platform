'use strict';

class ProviderDispatchService {
  constructor({
    providerCapabilityService,
    dispatcher
  } = {}) {
    if (
      !providerCapabilityService ||
      !dispatcher
    ) {
      throw new Error(
        'PROVIDER_DISPATCH_SERVICE_DEPENDENCY_REQUIRED'
      );
    }

    this.providerCapabilityService =
      providerCapabilityService;

    this.dispatcher =
      dispatcher;
  }

  async dispatch(body = {}) {
    const policy =
      this.providerCapabilityService
        .evaluate({
          requested_provider:
            body.requested_provider ||
            'CIWU_DRY_RUN',
          requested_model:
            body.requested_model ||
            'ciwu-dry-run-v1',
          required_capability:
            body.required_capability ||
            'CHAT',

          /*
           * This is intentionally false.
           * Leap016 dispatch is local
           * simulator-only.
           */
          network_requested:false
        });

    if (
      !policy ||
      policy.ok !== true
    ) {
      return {
        ok:false,
        reason:
          policy &&
          policy.reason
            ? policy.reason
            : 'PROVIDER_POLICY_FAILED',
        model_network_call:false
      };
    }

    const route =
      policy.route;

    if (
      route.provider !==
      'CIWU_DRY_RUN'
    ) {
      return {
        ok:false,
        reason:
          'LEAP016_LOCAL_PROVIDER_ONLY',
        model_network_call:false,
        external_provider_called:false,
        real_provider_credential_used:
          false
      };
    }

    const request = {
      provider:
        route.provider,
      model:
        route.model,
      instruction:
        String(
          body.current_instruction ||
          ''
        ),
      context:
        body.context || [],
      authority:{
        operational_authority:false,
        tool_execution_allowed:false,
        mutation_authority:false,
        write_authority:false,
        execute_authority:false,
        commit_authority:false,
        push_authority:false,
        deploy_authority:false
      }
    };

    const result =
      await this.dispatcher.dispatch({
        provider:
          route.provider,
        request,
        budget:
          body.dispatch_budget || {}
      });

    return {
      ...result,
      route_policy:{
        network_call_authorized:
          route.policy
            .network_call_authorized,
        operational_authority:
          false
      },
      model_network_call:false,
      external_provider_called:false,
      real_provider_credential_used:
        false
    };
  }
}

module.exports = {
  ProviderDispatchService
};
