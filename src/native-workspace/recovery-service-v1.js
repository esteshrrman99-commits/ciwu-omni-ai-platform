'use strict';

const RESOLUTIONS =
  new Set([
    'CONFIRMED_EXECUTED',
    'CONFIRMED_NOT_EXECUTED',
    'ABANDONED_UNKNOWN'
  ]);

class RecoveryService {
  constructor({
    approvalStore,
    journal,
    auditLedger,
    clock =
      () => new Date().toISOString()
  }) {
    if (
      !approvalStore ||
      !journal ||
      !auditLedger
    ) {
      throw new Error(
        'RECOVERY_DEPENDENCIES_REQUIRED'
      );
    }

    this.approvalStore =
      approvalStore;

    this.journal =
      journal;

    this.auditLedger =
      auditLedger;

    this.clock =
      clock;
  }

  status(ticketId) {
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

    const transaction =
      this.journal.get(
        ticketId
      );

    const audited =
      this.auditLedger.hasTicket(
        ticketId
      );

    let recoveryState =
      'NO_TRANSACTION';

    let operatorAction =
      'NONE';

    if (audited) {
      recoveryState =
        'FINALIZED';
    } else if (
      transaction &&
      transaction.state ===
        'APPLYING' &&
      (
        transaction.action ===
          'RUN' ||
        transaction.action ===
          'TEST'
      )
    ) {
      recoveryState =
        'EXECUTION_OUTCOME_UNKNOWN';

      operatorAction =
        'RESOLUTION_REQUIRED';
    } else if (
      transaction &&
      transaction.state ===
        'APPLYING' &&
      transaction.action ===
        'UPDATE'
    ) {
      recoveryState =
        'WRITE_RECOVERY_AVAILABLE';

      operatorAction =
        'EXECUTOR_RECOVERY_ALLOWED';
    } else if (
      transaction
    ) {
      recoveryState =
        transaction.state;
    }

    return {
      ok: true,
      ticket_id:
        ticketId,
      approval_status:
        ticket.status,
      execution_status:
        ticket.execution_status ||
        'NOT_EXECUTED',
      action:
        ticket.action,
      transaction_state:
        transaction
          ? transaction.state
          : null,
      recovery_state:
        recoveryState,
      operator_action:
        operatorAction,
      audited,
      auto_replay:
        false
    };
  }

  resolve(
    ticketId,
    resolution,
    note = ''
  ) {
    if (
      !RESOLUTIONS.has(
        resolution
      )
    ) {
      return {
        ok: false,
        reason:
          'OPERATOR_RESOLUTION_INVALID'
      };
    }

    const status =
      this.status(
        ticketId
      );

    if (!status.ok) {
      return status;
    }

    if (
      status.recovery_state !==
      'EXECUTION_OUTCOME_UNKNOWN'
    ) {
      return {
        ok: false,
        reason:
          'OPERATOR_RESOLUTION_NOT_REQUIRED'
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

    const transaction =
      this.journal.get(
        ticketId
      );

    this.auditLedger.append({
      ticket_id:
        ticketId,
      action:
        transaction.action,
      status:
        'OPERATOR_RESOLVED',
      resolution,
      note:
        String(note || '')
          .slice(0, 1000),
      timestamp:
        this.clock()
    });

    const rows =
      this.auditLedger.records();

    const auditHash =
      rows.length
        ? rows[
            rows.length - 1
          ].hash
        : null;

    this.journal.put(
      ticketId,
      {
        ...transaction,
        state:
          'AUDITED',
        outcome:
          'OPERATOR_RESOLVED',
        operator_resolution:
          resolution,
        operator_note:
          String(note || '')
            .slice(0, 1000),
        audit_hash:
          auditHash
      }
    );

    return {
      ok: true,
      ticket_id:
        ticketId,
      resolution,
      execution_replayed:
        false,
      audit_hash:
        auditHash
    };
  }
}

module.exports = {
  RecoveryService
};
