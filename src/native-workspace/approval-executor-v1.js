'use strict';

const {
  sha256Canonical,
  sha256Text
} = require('./canonical-json-v1');

const MUTATION_ACTIONS =
  new Set([
    'UPDATE',
    'RUN',
    'TEST'
  ]);

const NEVER_TRANSACTIONAL =
  new Set([
    'COMMIT',
    'PUSH',
    'DEPLOY'
  ]);

class ApprovalExecutor {
  constructor({
    workspace,
    approvalStore,
    auditLedger,
    clock = () =>
      new Date().toISOString()
  }) {
    if (
      !workspace ||
      !approvalStore ||
      !auditLedger
    ) {
      throw new Error(
        'EXECUTOR_DEPENDENCIES_REQUIRED'
      );
    }

    this.workspace = workspace;
    this.approvalStore = approvalStore;
    this.auditLedger = auditLedger;
    this.clock = clock;
  }

  _audit({
    ticket,
    action,
    payloadHash,
    status,
    reason = null,
    result = null
  }) {
    return this.auditLedger.append({
      timestamp: this.clock(),
      ticket_id:
        ticket ? ticket.id : null,
      action,
      payload_sha256:
        payloadHash,
      status,
      reason,
      result
    });
  }

  execute(ticketId, transaction) {
    if (
      typeof ticketId !== 'string' ||
      !ticketId
    ) {
      throw new Error(
        'TICKET_ID_REQUIRED'
      );
    }

    if (
      !transaction ||
      typeof transaction.action !== 'string' ||
      !transaction.payload ||
      typeof transaction.payload !== 'object'
    ) {
      throw new Error(
        'INVALID_TRANSACTION'
      );
    }

    const ticket =
      this.approvalStore.get(ticketId);

    if (!ticket) {
      throw new Error(
        'APPROVAL_NOT_FOUND'
      );
    }

    if (ticket.status !== 'APPROVED') {
      throw new Error(
        'APPROVAL_NOT_APPROVED'
      );
    }

    if (
      this.auditLedger.hasTicket(ticketId)
    ) {
      throw new Error(
        'APPROVAL_REPLAY_BLOCKED'
      );
    }

    const action =
      transaction.action;

    const payload =
      transaction.payload;

    const payloadHash =
      sha256Canonical(payload);

    const approvedPayloadHash =
      sha256Canonical(
        ticket.payload || {}
      );

    if (NEVER_TRANSACTIONAL.has(action)) {
      this._audit({
        ticket,
        action,
        payloadHash,
        status: 'REJECTED',
        reason:
          'GIT_RELEASE_AUTHORITY_OUT_OF_SCOPE'
      });

      return {
        ok: false,
        reason:
          'GIT_RELEASE_AUTHORITY_OUT_OF_SCOPE'
      };
    }

    if (!MUTATION_ACTIONS.has(action)) {
      this._audit({
        ticket,
        action,
        payloadHash,
        status: 'REJECTED',
        reason:
          'TRANSACTION_ACTION_NOT_ALLOWED'
      });

      return {
        ok: false,
        reason:
          'TRANSACTION_ACTION_NOT_ALLOWED'
      };
    }

    if (ticket.action !== action) {
      this._audit({
        ticket,
        action,
        payloadHash,
        status: 'REJECTED',
        reason:
          'APPROVAL_ACTION_MISMATCH'
      });

      return {
        ok: false,
        reason:
          'APPROVAL_ACTION_MISMATCH'
      };
    }

    if (
      payloadHash !==
      approvedPayloadHash
    ) {
      this._audit({
        ticket,
        action,
        payloadHash,
        status: 'REJECTED',
        reason:
          'APPROVAL_PAYLOAD_MISMATCH'
      });

      return {
        ok: false,
        reason:
          'APPROVAL_PAYLOAD_MISMATCH'
      };
    }

    if (action === 'UPDATE') {
      const {
        path,
        content,
        expected_before_sha256
      } = payload;

      if (
        typeof path !== 'string' ||
        typeof content !== 'string' ||
        typeof expected_before_sha256 !==
          'string'
      ) {
        this._audit({
          ticket,
          action,
          payloadHash,
          status: 'REJECTED',
          reason:
            'INVALID_UPDATE_PAYLOAD'
        });

        return {
          ok: false,
          reason:
            'INVALID_UPDATE_PAYLOAD'
        };
      }

      const before =
        this.workspace.read(path);

      const beforeHash =
        sha256Text(before);

      if (
        beforeHash !==
        expected_before_sha256
      ) {
        this._audit({
          ticket,
          action,
          payloadHash,
          status: 'REJECTED',
          reason:
            'WRITE_PRECONDITION_FAILED',
          result: {
            observed_before_sha256:
              beforeHash
          }
        });

        return {
          ok: false,
          reason:
            'WRITE_PRECONDITION_FAILED'
        };
      }

      const writeResult =
        this.workspace.write(
          path,
          content,
          ['WRITE']
        );

      const after =
        this.workspace.read(path);

      const afterHash =
        sha256Text(after);

      const audit =
        this._audit({
          ticket,
          action,
          payloadHash,
          status: 'EXECUTED',
          result: {
            path,
            bytes:
              writeResult.bytes,
            before_sha256:
              beforeHash,
            after_sha256:
              afterHash
          }
        });

      return {
        ok: true,
        action,
        path,
        before_sha256:
          beforeHash,
        after_sha256:
          afterHash,
        audit_hash:
          audit.hash
      };
    }

    if (
      action === 'RUN' ||
      action === 'TEST'
    ) {
      if (
        !payload.request ||
        typeof payload.request !==
          'object'
      ) {
        this._audit({
          ticket,
          action,
          payloadHash,
          status: 'REJECTED',
          reason:
            'INVALID_EXECUTE_PAYLOAD'
        });

        return {
          ok: false,
          reason:
            'INVALID_EXECUTE_PAYLOAD'
        };
      }

      const execution =
        this.workspace.execute(
          payload.request,
          ['EXECUTE']
        );

      const audit =
        this._audit({
          ticket,
          action,
          payloadHash,
          status: 'EXECUTED',
          result: {
            ok: execution.ok,
            policy:
              execution.policy || null,
            exit_code:
              execution.exit_code,
            signal:
              execution.signal,
            error:
              execution.error
                ? 'EXECUTION_ERROR'
                : null
          }
        });

      return {
        ok: execution.ok,
        action,
        execution,
        audit_hash:
          audit.hash
      };
    }

    throw new Error(
      'UNREACHABLE_TRANSACTION_STATE'
    );
  }
}

module.exports = {
  ApprovalExecutor,
  MUTATION_ACTIONS,
  NEVER_TRANSACTIONAL
};
