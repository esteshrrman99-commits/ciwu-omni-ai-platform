'use strict';

const {
  sha256Canonical,
  sha256Text
} = require(
  './canonical-json-v1'
);

const {
  guardExecutionRequest
} = require(
  './execution-request-guard-v1'
);

function textBytes(value) {
  return Buffer.byteLength(
    String(value),
    'utf8'
  );
}

class ApprovalExecutorV2 {
  constructor({
    workspace,
    projectRoot,
    approvalStore,
    auditLedger,
    journal,
    clock =
      () =>
        new Date().toISOString(),
    faultInjector = null
  }) {
    if (
      !workspace ||
      !projectRoot ||
      !approvalStore ||
      !auditLedger ||
      !journal
    ) {
      throw new Error(
        'APPROVAL_EXECUTOR_V2_DEPENDENCIES_REQUIRED'
      );
    }

    this.workspace =
      workspace;

    this.projectRoot =
      projectRoot;

    this.approvalStore =
      approvalStore;

    this.auditLedger =
      auditLedger;

    this.journal =
      journal;

    this.clock =
      clock;

    this.faultInjector =
      typeof faultInjector ===
        'function'
        ? faultInjector
        : null;
  }

  _fault(stage, context) {
    if (
      this.faultInjector
    ) {
      this.faultInjector(
        stage,
        context
      );
    }
  }

  _lastAuditHash() {
    const rows =
      this.auditLedger.records();

    if (
      !Array.isArray(rows) ||
      rows.length === 0
    ) {
      return null;
    }

    return (
      rows[
        rows.length - 1
      ].hash || null
    );
  }

  _audit(record) {
    this.auditLedger.append({
      ...record,
      timestamp:
        record.timestamp ||
        this.clock()
    });

    return this._lastAuditHash();
  }

  _consumeRejected(
    ticketId,
    action,
    reason,
    payloadHash
  ) {
    const hash =
      this._audit({
        ticket_id:
          ticketId,
        action,
        status:
          'REJECTED',
        reason,
        payload_sha256:
          payloadHash || null
      });

    this.journal.put(
      ticketId,
      {
        state:
          'AUDITED',
        action,
        outcome:
          'REJECTED',
        reason,
        audit_hash:
          hash
      }
    );

    return {
      ok: false,
      reason,
      audit_hash:
        hash
    };
  }

  _finalizeWriteRecovery(
    ticketId,
    entry
  ) {
    const current =
      this.workspace.read(
        entry.path
      );

    const currentHash =
      sha256Text(current);

    if (
      currentHash ===
      entry.target_sha256
    ) {
      const hash =
        this._audit({
          ticket_id:
            ticketId,
          action:
            'UPDATE',
          status:
            'RECOVERED_APPLIED',
          path:
            entry.path,
          before_sha256:
            entry.before_sha256,
          after_sha256:
            currentHash,
          payload_sha256:
            entry.payload_sha256
        });

      this.journal.put(
        ticketId,
        {
          ...entry,
          state:
            'AUDITED',
          outcome:
            'RECOVERED_APPLIED',
          audit_hash:
            hash
        }
      );

      return {
        ok: true,
        recovered: true,
        write: {
          path:
            entry.path,
          after_sha256:
            currentHash
        },
        audit_hash:
          hash
      };
    }

    if (
      currentHash !==
      entry.before_sha256
    ) {
      return this._consumeRejected(
        ticketId,
        'UPDATE',
        'WRITE_RECOVERY_AMBIGUOUS_STATE',
        entry.payload_sha256
      );
    }

    return null;
  }

  execute(
    ticketId,
    transaction
  ) {
    const ticket =
      this.approvalStore.get(
        ticketId
      );

    if (!ticket) {
      return {
        ok: false,
        reason:
          'APPROVAL_TICKET_NOT_FOUND'
      };
    }

    if (
      ticket.status !==
      'APPROVED'
    ) {
      return {
        ok: false,
        reason:
          'APPROVAL_NOT_APPROVED'
      };
    }

    if (
      this.auditLedger.hasTicket(
        ticketId
      )
    ) {
      return {
        ok: false,
        reason:
          'APPROVAL_REPLAY_BLOCKED'
      };
    }

    const action =
      transaction &&
      transaction.action;

    const payload =
      transaction &&
      transaction.payload
        ? transaction.payload
        : {};

    const payloadHash =
      sha256Canonical(
        payload
      );

    if (
      action !==
      ticket.action
    ) {
      return this._consumeRejected(
        ticketId,
        action || 'UNKNOWN',
        'APPROVAL_ACTION_MISMATCH',
        payloadHash
      );
    }

    if (
      payloadHash !==
      sha256Canonical(
        ticket.payload || {}
      )
    ) {
      return this._consumeRejected(
        ticketId,
        action,
        'APPROVAL_PAYLOAD_MISMATCH',
        payloadHash
      );
    }

    if (
      [
        'COMMIT',
        'PUSH',
        'DEPLOY'
      ].includes(action)
    ) {
      return this._consumeRejected(
        ticketId,
        action,
        'GIT_RELEASE_AUTHORITY_OUT_OF_SCOPE',
        payloadHash
      );
    }

    let existing =
      this.journal.get(
        ticketId
      );

    if (
      existing &&
      existing.state ===
        'AUDITED'
    ) {
      return {
        ok: false,
        reason:
          'APPROVAL_REPLAY_BLOCKED'
      };
    }

    if (
      existing &&
      existing.action !==
        action
    ) {
      return {
        ok: false,
        reason:
          'TRANSACTION_JOURNAL_ACTION_MISMATCH'
      };
    }

    if (
      existing &&
      existing.payload_sha256 &&
      existing.payload_sha256 !==
        payloadHash
    ) {
      return {
        ok: false,
        reason:
          'TRANSACTION_JOURNAL_PAYLOAD_MISMATCH'
      };
    }

    if (
      existing &&
      existing.state ===
        'APPLYING'
    ) {
      if (
        action ===
        'UPDATE'
      ) {
        const recovered =
          this._finalizeWriteRecovery(
            ticketId,
            existing
          );

        if (recovered) {
          return recovered;
        }
      } else {
        return this._consumeRejected(
          ticketId,
          action,
          'EXECUTION_RECOVERY_MANUAL_REQUIRED',
          payloadHash
        );
      }
    }

    if (
      existing &&
      existing.state ===
        'APPLIED'
    ) {
      const hash =
        this._audit({
          ticket_id:
            ticketId,
          action,
          status:
            'RECOVERED_APPLIED',
          payload_sha256:
            payloadHash
        });

      this.journal.put(
        ticketId,
        {
          ...existing,
          state:
            'AUDITED',
          audit_hash:
            hash
        }
      );

      return {
        ok: true,
        recovered: true,
        audit_hash:
          hash
      };
    }

    if (!existing) {
      existing =
        this.journal.put(
          ticketId,
          {
            state:
              'PREPARED',
            action,
            payload_sha256:
              payloadHash
          }
        );
    }

    if (
      action ===
      'UPDATE'
    ) {
      const relative =
        payload.path;

      const content =
        payload.content;

      const expected =
        payload.expected_before_sha256;

      if (
        typeof relative !==
          'string' ||
        typeof content !==
          'string' ||
        typeof expected !==
          'string'
      ) {
        return this._consumeRejected(
          ticketId,
          action,
          'WRITE_PAYLOAD_INVALID',
          payloadHash
        );
      }

      const before =
        this.workspace.read(
          relative
        );

      const beforeHash =
        sha256Text(before);

      if (
        beforeHash !== expected
      ) {
        return this._consumeRejected(
          ticketId,
          action,
          'WRITE_PRECONDITION_FAILED',
          payloadHash
        );
      }

      const targetHash =
        sha256Text(content);

      const applying =
        this.journal.put(
          ticketId,
          {
            ...existing,
            state:
              'APPLYING',
            action,
            path:
              relative,
            payload_sha256:
              payloadHash,
            before_sha256:
              beforeHash,
            target_sha256:
              targetHash
          }
        );

      const writeResult =
        this.workspace.write(
          relative,
          content,
          ['WRITE']
        );

      this._fault(
        'AFTER_WRITE_BEFORE_JOURNAL',
        {
          ticket_id:
            ticketId,
          path:
            relative
        }
      );

      const after =
        this.workspace.read(
          relative
        );

      const afterHash =
        sha256Text(after);

      if (
        afterHash !==
        targetHash
      ) {
        return this._consumeRejected(
          ticketId,
          action,
          'WRITE_POSTCONDITION_FAILED',
          payloadHash
        );
      }

      this.journal.put(
        ticketId,
        {
          ...applying,
          state:
            'APPLIED',
          after_sha256:
            afterHash
        }
      );

      const auditHash =
        this._audit({
          ticket_id:
            ticketId,
          action,
          status:
            'APPLIED',
          path:
            relative,
          bytes:
            Number.isInteger(
              writeResult &&
              writeResult.bytes
            )
              ? writeResult.bytes
              : textBytes(content),
          before_sha256:
            beforeHash,
          after_sha256:
            afterHash,
          payload_sha256:
            payloadHash
        });

      this.journal.put(
        ticketId,
        {
          ...applying,
          state:
            'AUDITED',
          outcome:
            'APPLIED',
          after_sha256:
            afterHash,
          audit_hash:
            auditHash
        }
      );

      return {
        ok: true,
        write: {
          path:
            relative,
          bytes:
            textBytes(content),
          before_sha256:
            beforeHash,
          after_sha256:
            afterHash
        },
        audit_hash:
          auditHash
      };
    }

    if (
      action === 'RUN' ||
      action === 'TEST'
    ) {
      try {
        guardExecutionRequest(
          this.projectRoot,
          payload.request
        );
      } catch (error) {
        return this._consumeRejected(
          ticketId,
          action,
          error.message ||
            'EXECUTION_REQUEST_BLOCKED',
          payloadHash
        );
      }

      const applying =
        this.journal.put(
          ticketId,
          {
            ...existing,
            state:
              'APPLYING',
            action,
            payload_sha256:
              payloadHash,
            execution_policy:
              payload.request.policy
          }
        );

      const execution =
        this.workspace.execute(
          payload.request,
          ['EXECUTE']
        );

      this._fault(
        'AFTER_EXECUTE_BEFORE_JOURNAL',
        {
          ticket_id:
            ticketId,
          policy:
            payload.request.policy
        }
      );

      this.journal.put(
        ticketId,
        {
          ...applying,
          state:
            'APPLIED',
          exit_code:
            Number.isInteger(
              execution &&
              execution.exit_code
            )
              ? execution.exit_code
              : null
        }
      );

      const auditHash =
        this._audit({
          ticket_id:
            ticketId,
          action,
          status:
            'APPLIED',
          payload_sha256:
            payloadHash,
          execution: {
            policy:
              payload.request.policy,
            ok:
              Boolean(
                execution &&
                execution.ok
              ),
            exit_code:
              Number.isInteger(
                execution &&
                execution.exit_code
              )
                ? execution.exit_code
                : null,
            signal:
              execution &&
              execution.signal
                ? String(
                    execution.signal
                  )
                : null
          }
        });

      this.journal.put(
        ticketId,
        {
          ...applying,
          state:
            'AUDITED',
          outcome:
            'APPLIED',
          audit_hash:
            auditHash
        }
      );

      return {
        ok: true,
        execution,
        audit_hash:
          auditHash
      };
    }

    return this._consumeRejected(
      ticketId,
      action,
      'TRANSACTION_ACTION_BLOCKED',
      payloadHash
    );
  }
}

module.exports = {
  ApprovalExecutorV2
};
